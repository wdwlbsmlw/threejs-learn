<template>
    <div class="home">
        <canvas id="container" />
    </div>
</template>

<script>
import * as THREE from 'three'
// FBX 模型加载插件
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/js/libs/stats.min.js'

var statsObj = null
var mixer = null
var clock = new THREE.Clock()
export default {
    name: 'Test',

    data() {
        return {
            renderer: null,
            camera: null,
            scene: null,
            controls: null,
            fbxObj: null
        }
    },

    mounted() {
        this.initScene()
    },

    methods: {
        initScene() {
            let container = document.getElementById('container')
            this.renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true, alpha: true })
            this.renderer.setSize(container.offsetWidth, container.offsetHeight)
            this.camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 1, 2000)
            this.camera.position.set(50, 1000, 1500)
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(0xa0a0a0)
            // LIGHTS
            this.scene.add(new THREE.AmbientLight(0xffffff))
            const light = new THREE.DirectionalLight(0xffffff, 1)
            light.position.set(-100, 100, 0)
            this.scene.add(light)

            const light2 = new THREE.DirectionalLight(0xffffff, 1)
            light2.position.set(0, 0, 0)
            this.scene.add(light2)

            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.minDistance = 5
            this.controls.maxDistance = 200
            this.controls.enablePan = true
            this.controls.target.set(0, 1, 0)

            // const loader = new FBXLoader()
            // let _s = Date.now()
            // loader.load('/module/byq/BYQ.FBX', object => {
            //     console.log(object)
            //     this.fbxObj = object
            //     this.scene.add(object)
            //     console.log(Date.now() - _s)
            //     this.initAnimate()
            // })
            // const loader = new GLTFLoader()
            // let _s = Date.now()
            // loader.load('/module/byqgltf/transformer.gltf', object => {
            //     console.log(object)
            //     this.fbxObj = object.scene
            //     this.scene.add(object.scene)
            //     console.log(Date.now() - _s)
            //     this.initAnimate()
            // })
            const loader = new GLTFLoader()
            let _s = Date.now()
            loader.load('/module/scene2/Unity2GLTF.gltf', object => {
                console.log(object)
                this.fbxObj = object.scene
                this.scene.add(object.scene)
                console.log(Date.now() - _s)
                mixer = new THREE.AnimationMixer(object.scene)
                //同时将这个外部模型的动画全部绑定到动画混合器里面
                for (var i = 0; i < object.animations.length; i++) {
                    mixer.clipAction(object.animations[i]).play()
                }
                this.initAnimate()
            })

            statsObj = new Stats() // 创建一个性能监视器
            statsObj.domElement.style.position = 'absolute' // 样式， 坐标
            statsObj.domElement.style.left = '0px'
            statsObj.domElement.style.top = '0px'
            document.body.appendChild(statsObj.domElement) // 添加到canvas-frame

            window.addEventListener('resize', () => {
                const wrapper = document.querySelector('.home')
                const threeWidth = wrapper.offsetWidth * 0.35
                const threeHeight = wrapper.offsetHeight * 0.775
                this.camera.aspect = threeWidth / threeHeight
                this.camera.updateProjectionMatrix()
                this.renderer.setSize(threeWidth, threeHeight)
            })
        },

        // 初始化动态渲染模型
        initAnimate() {
            if (!this.renderer) return
            if (!this.renderer.autoClear) this.renderer.clear()
            requestAnimationFrame(this.initAnimate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            if (this.fbxObj) {
                // this.fbxObj.rotation.y = this.fbxObj.rotation.y + 0.005
            }
            var time = clock.getDelta()
            if (mixer) {
                mixer.update(time)
            }
            if (statsObj) statsObj.update()
        },

        // 初始化静态渲染模型
        initStatic() {
            if (!this.renderer.autoClear) this.renderer.clear()
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
            // if (this.fbxObj) this.fbxObj.rotation.y = this.fbxObj.rotation.y + 0.06
        }
    }
}
</script>

<style lang="less">
.home {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
#container {
    width: 100%;
    height: 100%;
    z-index: 99;
}
</style>
