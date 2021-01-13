<template>
    <div class="wp">
        <div class="wp-oper">
            <button class="wp-btn" :class="{'active': isLine}" @click="onLineToggle">线框模式</button>
            <button class="wp-btn" :class="{'active': animate}" @click="onStatusToggle">风机启停</button>
        </div>
    </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import Stats from 'three/examples/js/libs/stats.min.js'

const stats = new Stats()

const WP = {
    ms_Renderer: null,
    ms_Camera: null,
    ms_Scene: null,
    ms_Controls: null,
    mtlloader: new MTLLoader(),
    groupWhite: new THREE.Group(),
    groupGrid: new THREE.Group(),
    groupInside: new THREE.Group(),
    rotateGrup: [],
    animation: true,

    Initialize: function () {
        // 初始化渲染器
        this.ms_Renderer = new THREE.WebGLRenderer({ antialias: true })
        this.ms_Renderer.setPixelRatio(window.devicePixelRatio)
        this.ms_Renderer.setSize(window.innerWidth, window.innerHeight)
        document.querySelector('.wp').appendChild(this.ms_Renderer.domElement)
        // 初始化场景
        this.ms_Scene = new THREE.Scene()
        // 初始化相机
        this.ms_Camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 100000)
        this.ms_Camera.position.set(2000, 2000, 2000)
        // this.ms_Camera.lookAt(0, 0, 0)
        // 场景光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        this.ms_Scene.add(ambientLight)
        // 灯光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(1000, 1000, 2000)
        this.ms_Scene.add(directionalLight)
        // 初始化轨道控制器
        this.ms_Controls = new OrbitControls(this.ms_Camera, this.ms_Renderer.domElement)
        this.ms_Controls.enableKeys = true
        this.ms_Controls.minDistance = 1
        this.ms_Controls.maxDistance = 100000
        this.ms_Controls.enablePan = true

        // 加载模型
        this.groupInside.translateX(-11000)
        this.ms_Scene.add(this.groupInside)
        this.groupGrid.translateX(-11000)
        this.ms_Scene.add(this.groupGrid)
        this.groupWhite.translateX(20435)
        this.ms_Scene.add(this.groupWhite)
        const loadModel = (name, group, config = {}) => {
            config = Object.assign({}, {
                clone: false,
                animate: '',
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0
            }, config)
            this.mtlloader.load(`/wp/${name}.mtl`, materials => {
                materials.opacity = 1
                materials.preload()
                new OBJLoader().setMaterials(materials).load(`/wp/${name}.obj`, obj => {
                    obj.translateX(config.offsetX)
                    obj.translateY(config.offsetY)
                    obj.translateZ(config.offsetZ) 
                    if (config.animate) {
                        obj.children[0].geometry.center()
                        obj.translateX(11010)
                        obj.translateY(370)
                        obj.translateZ(450)
                        this.rotateGrup.push(obj)
                    }
                    if (config.clone) {
                        if (name.includes('_white_')) obj.translateX(-31440)
                        const clone1 = obj.clone(true)
                        clone1.rotateZ(THREE.MathUtils.degToRad(120))
                        const clone2 = obj.clone(true)
                        clone2.rotation.z = THREE.MathUtils.degToRad(-120)
                        group.add(clone1)
                        group.add(clone2)
                        this.rotateGrup.push(clone1, clone2)
                    }
                    group.add(obj)
                })
            })
        }
        loadModel('HTground_sciencefiction_2001', this.groupInside)
        // white
        loadModel(`windpowergenerator_white_2001_01`, this.groupWhite)
        loadModel(`windpowergenerator_white_2001_02`, this.groupWhite)
        loadModel(`windpowergenerator_white_2001_03`, this.groupWhite, { offsetX: -31440, offsetZ: 60, animate: 'z' })
        loadModel(`windpowergenerator_white_2001_04`, this.groupWhite, { clone: true, animate: 'z' })
        // grid
        loadModel(`windpowergenerator_grid_2001_01`, this.groupGrid)
        loadModel(`windpowergenerator_grid_2001_02`, this.groupGrid)
        loadModel(`windpowergenerator_grid_2001_03`, this.groupGrid, { offsetZ: 50, animate: 'z' })
        loadModel(`windpowergenerator_grid_2001_04`, this.groupGrid, { clone: true, animate: 'z' })
        // inside
        loadModel('windpowergenerator_inside_2001_01', this.groupInside, { animate: 'z' })
        loadModel('windpowergenerator_inside_2001_02', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_03', this.groupInside, { animate: 'z' })
        loadModel('windpowergenerator_inside_2001_04', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_05', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_06', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_07', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_08', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_09', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_10', this.groupInside, { offsetX: 31440 })
        loadModel('windpowergenerator_inside_2001_11', this.groupInside, { offsetX: 31440 })

        this.ToggleIsLine(true)
    },

    Display: function () {
        this.ms_Renderer.render(this.ms_Scene, this.ms_Camera)
    },

    Update: function () {
        this.Display()
        if (this.rotateGrup && this.rotateGrup.length && this.animation) {
            this.rotateGrup.forEach(item => {
                item.rotation.z = item.rotation.z +  - 0.009
            })
        }
    },

    ToggleIsLine: function (isLine) {
        this.groupWhite.visible = !isLine
        this.groupGrid.visible = isLine
    },
    TogglePlay: function (val) {
        this.animation = val
    },

    Resize: function (inWidth, inHeight) {
        this.ms_Camera.aspect = inWidth / inHeight
        this.ms_Camera.updateProjectionMatrix()
        this.ms_Renderer.setSize(inWidth, inHeight)
        this.Display()
    },
}

export default {
    name: 'wp2',

    data() {
        return {
            isLine: true,
            animate: true
        }
    },

    mounted() {
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
        onLineToggle() {
            this.isLine = !this.isLine
            WP.ToggleIsLine(this.isLine)
        },
        onStatusToggle() {
            this.animate = !this.animate
            WP.TogglePlay(this.animate)
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
        bottom: 20px;
        left: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &-btn {
        width: 100px;
        height: 30px;
        line-height: 28px;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid #ccc;
        color: #ccc;
        cursor: pointer;
        margin: 0 10px;

        &.active {
            border-color: rgb(82, 186, 226);
            background-color: rgb(82, 186, 226);
            color: #fff;
        }
    }
}
</style>