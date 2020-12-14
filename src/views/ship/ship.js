import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Refractor } from 'three/examples/jsm/objects/Refractor'
import { Water } from 'three/examples/jsm/objects/Water'
import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader'
import Stats from 'three/examples/js/libs/stats.min.js'
import * as ShipConfig from './ship.config'
import { Loading } from 'element-ui'

const Ship = function(el) {
    this.loader = new FBXLoader() // 模型加载器（FBX）
    this.canvas = document.querySelector(el) // 画布
    this.scene = null // 场景
    this.camera = null // 摄像机
    this.controls = null // 轨道控制器
    this.renderer = null // 渲染器
    this.aspectRatio = 1 // 摄像机视锥体长宽比
    // 摄像机默认配置
    this.camera_config = {
        near: 1,
        far: 20000,
        fov: 55
    }
    this.water = null // 水面
    this.shipObj = null // 船
    this.curves = null // 路线
    this.refractor = null
    this.refractorGeometry = null
    this.pivot = null
    this.statsVisible = 'block' // 监视器状态
    this.eventObjects = []    // 需要监听鼠标事件的Object
    this.raycaster = new THREE.Raycaster(), // 鼠标射线
    this.mouse = new THREE.Vector2(),   // 鼠标坐标

    this.loading = Loading.service({
        spinner: 'el-icon-loading',
        text: '模型加载中...',
        background: 'rgba(0, 0, 0, 0.5)'
    })
}

Ship.prototype = {
    constructor: Ship,

    /**
     * 初始化整个场景
     */
    init() {
        console.log('start init')
        // 重新计算长宽比
        this.recalcAspectRatio()

        // 初始化染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true // 抗锯齿
        })
        // canvas 模糊问题解决
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // 初始化场景
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0a0a0)

        // 加载环境三位贴图
        new THREE.CubeTextureLoader().load(ShipConfig.sceneBgImg, texture => {
            texture.encoding = THREE.sRGBEncoding
            this.scene.background = texture
        })

        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(this.camera_config.fov, this.aspectRatio, this.camera_config.near, this.camera_config.far)
        this.camera.lookAt(this.scene.position)
        this.camera.position.set(50, 1000, 1500)

        // 初始化轨道控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableKeys = true
        this.controls.minDistance = 1
        this.controls.maxDistance = 4000
        this.controls.enablePan = true

        // 加载船的3D模型
        this.loadShipFBX()

        // 加载灯光
        // 场景光
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
        this.scene.add(ambientLight)
        // 平型光，模拟太阳
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
        directionalLight.position.set(-1, 1, 1)
        this.scene.add(directionalLight)
        // 水面光
        const light = new THREE.DirectionalLight(0xffffff, 0.8)
        this.scene.add(light)

        // 加载水面
        const waterGeometry = new THREE.PlaneBufferGeometry(40000, 40000) // 创建一个平面几何体
        this.water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('/module/Ship/waternormals.jpg', texture => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping
            }),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x00456e,
            distortionScale: 3.7
        })
        this.water.rotation.x = -Math.PI / 2
        this.scene.add(this.water)

        // 3D几何体
        this.pivot = new THREE.Object3D()
        this.pivot.name = 'Pivot'
        this.scene.add(this.pivot)

        // 水面上的折射面
        this.refractorGeometry = new THREE.PlaneBufferGeometry(50, 50)
        this.refractor = new Refractor(this.refractorGeometry, {
            color: 0x66ccff,
            textureWidth: 1024,
            textureHeight: 1024,
            shader: WaterRefractionShader
        })
        this.refractor.position.set(40, 990, 1400)
        var dudvMap = new THREE.TextureLoader().load(require('@/assets/textures/waterdudv.jpg'))
        dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping
        this.refractor.material.uniforms.tDudv.value = dudvMap
        // this.controls.target = this.refractor.position
        this.scene.add(this.refractor)

        this.render()
    },

    // 加载船模型
    loadShipFBX() {
        this.loader.load('/module/ship/Chuan.FBX', object => {
            object.name = 'Ship'
            this.shipObj = object
            this.scene.add(object)
            this.createCurves(ShipConfig.curvesPoints)
            this.loading.close()
            this.eventObjects.push(...object.children)
        })
    },

    // 绘制航行路线
    createCurves(pointsArray) {
        this.curves = new THREE.CatmullRomCurve3(pointsArray, false)
    },

    // 渲染
    render() {
        if (!this.renderer.autoClear) this.renderer.clear()
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
        this.water.material.uniforms.time.value += 2.0 / 60.0
        this.refractor.material.uniforms.time.value += 1.0 / 30.0
        this.refractor.lookAt(this.camera.position)
        if (this.camera.position.y < 0) {
            this.refractor.visible = true
        } else {
            this.refractor.visible = false
        }
        if (this.statsObj) this.statsObj.update()
    },

    // 清空场景
    clear() {
        this.pivot.traverse(item => {
            this.scene.remove(item)
        })
        // this.scene.dispose()
        this.renderer.clear()
    },

    // 计算长宽比
    recalcAspectRatio() {
        this.aspectRatio = this.canvas.offsetHeight === 0 ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight
    },
    // 更新摄像机
    updateCamera() {
        this.camera.aspect = this.aspectRatio
        this.camera.updateProjectionMatrix()
    },
    
    // 初始化一个性能监测器
    initStats() {
        this.statsObj = new Stats()
        this.statsObj.domElement.style.position = 'absolute'
        this.statsObj.domElement.style.left = '0px'
        this.statsObj.domElement.style.top = '0px'
        document.body.appendChild(this.statsObj.domElement)
    },
    statsToggle() {
        this.statsVisible = this.statsVisible === 'block' ? 'none' : 'block'
        this.statsObj.domElement.style.display = this.statsVisible
    },

    /**
     * Mouse Down Event
     * @param {Object} e 
     */
    onMouseDown(e) {
        e.preventDefault()
        this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1
        this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersects = this.raycaster.intersectObjects(this.eventObjects)
        if (!intersects.length) return
        let _obj = intersects[0].object
        console.log(_obj)
        _obj.material[0].emissive = new THREE.Color(0, 0, 255)
    },
    /**
     * Mouse Move Event
     * @param {Object} e 
     */
    onMouseMove(e) {
        this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1
        this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersects = this.raycaster.intersectObjects(this.eventObjects)
        if (!intersects.length) return
        let _obj = intersects[0].object
        console.log(_obj)
        _obj.material[0].emissive = new THREE.Color(0, 0, 255)
    }
}

export default Ship
