<template>
    <div class="wp"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Ocean } from 'three/examples/jsm/misc/Ocean'
import Stats from 'three/examples/js/libs/stats.min.js'
import { Loading } from 'element-ui'

let _vm = null

const stats = new Stats()
let lastTime = ( new Date() ).getTime();
const WP = {
    ms_Renderer: null,
    ms_Camera: null,
    ms_Scene: null,
    ms_Controls: null,
    ms_Mixer: null,
    ms_Ocean: null,
    ms_Crc: null,
    moduleType: 'GLTF',
    progress: 0,
    loading: null,
    currentModule: null,

    Initialize: function () {
        this.loading = Loading.service({
            spinner: 'el-icon-loading',
            text: '模型加载中...',
            background: 'rgba(0, 0, 0, 0.5)'
        })
        this.ms_Renderer = new THREE.WebGLRenderer({ antialias: true })
        this.ms_Renderer.setPixelRatio(window.devicePixelRatio)
        document.querySelector('.wp').appendChild(this.ms_Renderer.domElement)

        this.ms_Scene = new THREE.Scene()
        this.ms_Scene.add(new THREE.AmbientLight(0xcccccc, 0.8))
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(-1, 500, 500)
        this.ms_Scene.add(directionalLight)

        this.ms_Camera = new THREE.PerspectiveCamera(35.0, window.innerWidth / window.innerHeight, 0.5, 300000)
        this.ms_Camera.position.set(0, 100, 300)
        this.ms_Camera.lookAt(0, 0, 0)

        // 加载环境三位贴图
        new THREE.CubeTextureLoader().load([
            require('@/assets/ocean-sky-sunny/SunnyDay_px.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_nx.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_py.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_ny.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_pz.jpg'),
            require('@/assets/ocean-sky-sunny/SunnyDay_nz.jpg')
        ], texture => {
            texture.encoding = THREE.sRGBEncoding
            this.ms_Scene.background = texture
        })

        // Initialize Orbit control
        this.ms_Controls = new OrbitControls(this.ms_Camera, this.ms_Renderer.domElement)
        this.ms_Controls.enablePan = false
        
        this.ms_Controls.userPanSpeed = 0.0
        this.ms_Controls.minDistance = 100
        this.ms_Controls.maxDistance = 500.0
        this.ms_Controls.minPolarAngle = 0
        this.ms_Controls.maxPolarAngle = Math.PI * 0.495

        const gsize = 1024
        const res = 1024
        const gres = res / 2
        const origx = -gsize / 2
        const origz = -gsize / 2

        this.ms_Ocean = new Ocean(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
            USE_HALF_FLOAT: false,
            INITIAL_SIZE: 1000.0,
            INITIAL_WIND: [8.0, 8.0],
            INITIAL_CHOPPINESS: 0.8,
            CLEAR_COLOR: [1.0, 1.0, 1.0, 0.0],
            GEOMETRY_ORIGIN: [origx, origz],
            SUN_DIRECTION: [-1.0, 1.0, 1.0],
            OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
            SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
            EXPOSURE: 0.35,
            GEOMETRY_RESOLUTION: gres,
            GEOMETRY_SIZE: gsize,
            RESOLUTION: res,
        })

        this.ms_Ocean.materialOcean.uniforms['u_projectionMatrix'] = { value: this.ms_Camera.projectionMatrix }
        this.ms_Ocean.materialOcean.uniforms['u_viewMatrix'] = { value: this.ms_Camera.matrixWorldInverse }
        this.ms_Ocean.materialOcean.uniforms['u_cameraPosition'] = { value: this.ms_Camera.position }
        this.ms_Scene.add(this.ms_Ocean.oceanMesh)

        this._loadShip()
    },

    // 加载张謇号模型
    _loadShip: function () {
        _vm.setPercent(-1)
        if (this.currentModule) this.ms_Scene.remove(this.currentModule)
        this.ms_Mixer = null
        if (this.moduleType === 'GLTF') {
            new GLTFLoader().load('/module/zhangjian/SHIP.gltf', object => {
                // object.scene.position.set(0, -1, 0)
                object.scene.rotateZ(THREE.MathUtils.degToRad(1))
                this.currentModule = object.scene
                this.ms_Scene.add(this.currentModule)
                this.ms_Mixer = new THREE.AnimationMixer(this.currentModule)
                object.animations.forEach(a => {
                    this.ms_Mixer.clipAction(a).play()
                })
                setTimeout(() => {
                    _vm.setPercent(-1)
                }, 3000)
                this._crc()
                this.loading.close()
            }, xhr => {
                _vm.setPercent(xhr.loaded / xhr.total * 100)
            }, error => {
                console.log(error)
                this.loading.close()
            })
        }
        if (this.moduleType === 'GLB') {
            new GLTFLoader().load('/module/zhangjian/SHIP.glb', object => {
                object.scene.scale.set(0.001, 0.001, 0.001)
                object.scene.position.set(0, -1, 0)
                this.currentModule = object.scene
                this.ms_Scene.add(this.currentModule)
                this.ms_Mixer = new THREE.AnimationMixer(this.currentModule)
                object.animations.forEach(a => {
                    this.ms_Mixer.clipAction(a).play()
                })
                setTimeout(() => {
                    _vm.setPercent(-1)
                }, 3000)
                this._crc()
                this.loading.close()
            }, xhr => {
                _vm.setPercent(xhr.loaded / xhr.total * 100)
                this.loading.close()
            })
        }
        if (this.moduleType === 'FBX') {
            new FBXLoader().load('/module/zhangjian/SHIP.FBX', object => {
                object.scale.set(0.001, 0.001, 0.001)
                object.rotation.x = THREE.MathUtils.degToRad(-90)
                object.position.set(0, -1, 0)
                this.currentModule = object
                this.ms_Scene.add(this.currentModule)
                this.ms_Mixer = new THREE.AnimationMixer(this.currentModule)
                object.animations.forEach(a => {
                    this.ms_Mixer.clipAction(a).play()
                })
                setTimeout(() => {
                    _vm.setPercent(-1)
                }, 3000)
                this._crc()
                this.loading.close()
            }, xhr => {
                _vm.setPercent(xhr.loaded / xhr.total * 100)
                this.loading.close()
            })
        }
    },
    // 初始化船的行走路线
    _crc: function () {
        this.ms_Crc = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-100, -1, 0),
            new THREE.Vector3(-50, -2, 0),
            new THREE.Vector3(0, -3, 0),
            new THREE.Vector3(100, 0, 0),
        ], false)
    },

    changeModuleType: function (val) {
        this.moduleType = val
        this._loadShip()
    },

    Display: function () {
        this.ms_Renderer.render(this.ms_Scene, this.ms_Camera)
    },

    Update: function () {
        const currentTime = new Date().getTime()
        this.ms_Ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0
        lastTime = currentTime
        this.ms_Ocean.render(this.ms_Ocean.deltaTime)
        this.ms_Ocean.overrideMaterial = this.ms_Ocean.materialOcean

        if (this.ms_Ocean.changed) {
            this.ms_Ocean.materialOcean.uniforms['u_size'].value = this.ms_Ocean.size
            this.ms_Ocean.materialOcean.uniforms['u_sunDirection'].value.set(this.ms_Ocean.sunDirectionX, this.ms_Ocean.sunDirectionY, this.ms_Ocean.sunDirectionZ)
            this.ms_Ocean.materialOcean.uniforms['u_exposure'].value = this.ms_Ocean.exposure
            this.ms_Ocean.changed = false
        }

        this.ms_Ocean.materialOcean.uniforms['u_normalMap'].value = this.ms_Ocean.normalMapFramebuffer.texture
        this.ms_Ocean.materialOcean.uniforms['u_displacementMap'].value = this.ms_Ocean.displacementMapFramebuffer.texture
        this.ms_Ocean.materialOcean.uniforms['u_projectionMatrix'].value = this.ms_Camera.projectionMatrix
        this.ms_Ocean.materialOcean.uniforms['u_viewMatrix'].value = this.ms_Camera.matrixWorldInverse
        this.ms_Ocean.materialOcean.uniforms['u_cameraPosition'].value = this.ms_Camera.position
        this.ms_Ocean.materialOcean.depthTest = true

        if (this.ms_Mixer) this.ms_Mixer.update(this.ms_Ocean.deltaTime)

        if (this.currentModule && this.ms_Crc) {
            if (this.progress < 1) {
                let _p = this.ms_Crc.getPointAt(this.progress)
                this.currentModule.position.copy(_p)
                this.progress += 1 / 2000
            } else {
                this.progress = 0
            }
        }
        this.Display()
    },

    Resize: function (inWidth, inHeight) {
        this.ms_Camera.aspect = inWidth / inHeight
        this.ms_Camera.updateProjectionMatrix()
        this.ms_Renderer.setSize(inWidth, inHeight)
        this.Display()
    },
}

export default {
    name: 'Ocean',

    data() {
        return {
            percent: -1,
            moduleType: 'GLTF',
            visible: false
        }
    },

    mounted() {
        _vm = this
        document.querySelector('.wp').appendChild(stats.dom)
        WP.Initialize()

        window.addEventListener('resize', function () {
            WP.Resize(window.innerWidth, window.innerHeight)
        })

        WP.Resize(window.innerWidth, window.innerHeight)

        function render() {
            requestAnimationFrame(render)
            WP.Update()
            stats.update()
        }

        render()
    },

    methods: {
        setPercent(val = -1) {
            this.percent = val
        },

        onSelectChange() {
            WP.changeModuleType(this.moduleType)
        }
    }
}
</script>

<style lang="less">
.wp {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    &-oper {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1;
    }

    &-preview {
        position: fixed;
        z-index: 2;
        min-width: 100%;
        min-height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    &-percent {
        position: fixed;
        right: 10px;
        bottom: 10px;
        z-index: 1;
        color: #ffffff;
    }

    &-select {
        position: fixed;
        right: 10px;
        top: 10px;
        z-index: 1;
        color: #ffffff;
    }
}
</style>