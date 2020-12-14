import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Water } from 'three/examples/jsm/objects/Water'
import Stats from 'three/examples/js/libs/stats.min.js'

const WindPower = function (el) {
    this.loader = new GLTFLoader() // 模型加载器（GLTF）
    this.loaderFBX = new FBXLoader() // 模型加载器（FBX）
    this.canvas = document.querySelector(el) // 画布
    this.scene = null // 场景
    this.camera = null // 摄像机
    this.controls = null // 轨道控制器
    this.renderer = null // 渲染器
    this.aspectRatio = document.body.clientWidth/document.body.clientHeight // 摄像机视锥体长宽比
    this.stats = null // 性能监视器
    this.water = null // 水面
    this.mixer = null
    this.clock = new THREE.Clock()
    this.domEvent = null
    this.composer = null
}

WindPower.prototype = {
    constructor: WindPower,

    // 初始化场景
    init() {
        // 初始化染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true, // 抗锯齿
        })
        // canvas 模糊问题解决
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // 初始化场景
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0a0a0)

        // 加载环境三位贴图
        const sceneBgImg = [
            require('@/assets/ocean-sky-sunny/SunnyDay_px.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_nx.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_py.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_ny.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_pz.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_nz.jpg'),
        ]
        new THREE.CubeTextureLoader().load(sceneBgImg, texture => {
            texture.encoding = THREE.sRGBEncoding
            this.scene.background = texture
        })

        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 1, 10000)
        this.camera.position.set(0, 150, 300)

        // 初始化轨道控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.enableKeys = true
        this.controls.minDistance = 1
        this.controls.maxDistance = 4000
        this.controls.enablePan = true
        this.controls.keys = {
            LEFT: 65, //left arrow
            UP: 87, // up arrow
            RIGHT: 68, // right arrow
            BOTTOM: 83, // down arrow
        }
        // this.controls.dispose()

        // 场景光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        this.scene.add(ambientLight)
        // 平型光，模拟太阳
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(-100, 100, 100)
        this.scene.add(directionalLight)

        // initGrid(this.scene)

        this.water = initWater(this.scene)

        // 加载模型
        this.loader.load('/module/wp/A.gltf', object => {
            object.scene.name = 'FDMain'
            this.scene.add(object.scene)
            this.mixer = new THREE.AnimationMixer(object.scene)
            //同时将这个外部模型的动画全部绑定到动画混合器里面
            object.animations.forEach(a => {
                this.mixer.clipAction(a).play()
            })
            this.composer = new EffectComposer(this.renderer) //效果组合器
            const renderPass = new RenderPass(this.scene, this.camera) //原始场景渲染结果
            this.composer.addPass(renderPass)
            const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera) //轮廓通道
            this.composer.addPass(outlinePass)

            this.domEvent = new DomEvent(this.renderer.domElement, this.camera, object.scene, outlinePass)
        })

        // 雾
        this.scene.fog = new THREE.Fog(0x1577b7, 0, 40000)

        this.render()
        this.initStats()
    },

    // 渲染
    render() {
        if (!this.renderer.autoClear) this.renderer.clear()
        if (this.controls) this.controls.update()
        this.renderer.render(this.scene, this.camera)
    },

    // 初始化一个性能监测器
    initStats() {
        this.stats = new Stats()
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.left = '0px'
        this.stats.domElement.style.top = '0px'
        document.body.appendChild(this.stats.domElement)
    },
}

// 初始化网格
// function initGrid(scene) {
//     const material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }) //创建一个材质
//     const color1 = new THREE.Color(0x444444)
//     const color2 = new THREE.Color(0xff0000)
//     const geometry = new THREE.Geometry() //创建点的集合
//     const p1 = new THREE.Vector3(-500, 0, 0)
//     const p2 = new THREE.Vector3(500, 0, 0)
//     geometry.vertices.push(p1)
//     geometry.vertices.push(p2)
//     geometry.colors.push(color1, color2)
//     for (let i = 0; i <= 20; i++) {
//         let line = new THREE.Line(geometry, material, THREE.LineSegments)
//         line.position.z = i * 50 - 500
//         scene.add(line)
//         line = new THREE.Line(geometry, material, THREE.LineSegments)
//         line.position.x = i * 50 - 500
//         line.rotation.y = (90 * Math.PI) / 180
//         scene.add(line)
//     }
// }
// 加载水面
function initWater(scene) {
    const waterGeometry = new THREE.PlaneGeometry(40000, 40000)
    const light = new THREE.DirectionalLight(0xffffff, 0.8)
    scene.add(light)
    const water = new Water(waterGeometry, {
        waterNormals: new THREE.TextureLoader().load('/module/Ship/Water_2_M_Normal.jpg', texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }),
        sunDirection: light.position.clone().normalize(),
    })
    water.rotation.x = -Math.PI / 2
    scene.add(water)
    return water
}

// 事件
function DomEvent(dom, camera, cubes, outlinePass) {
    console.log(dom, camera, cubes, outlinePass)
    // const raycaster = new THREE.Raycaster()
    // const mouse = new THREE.Vector2()
    // const _dom = document.querySelector('.pane')
    // dom.addEventListener(
    //     'mousemove',
    //     event => {
    //         mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    //         mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    //         raycaster.setFromCamera(mouse, camera)
    //         const intersects = raycaster.intersectObjects([cubes], true)
    //         let _arr = []
    //         if (intersects.length > 0) {
    //             _arr = [cubes]
    //             _dom.style.display = 'block'
    //         } else {
    //             _dom.style.display = 'none'
    //         }
    //         outlinePass.selectedObjects = _arr
    //     },
    //     true
    // )
}
export default WindPower
