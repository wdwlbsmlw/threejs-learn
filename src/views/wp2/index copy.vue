<template>
    <div class="wp"></div>
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
    objloader: new OBJLoader(),
    isLine: true,

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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.ms_Scene.add(ambientLight)
        // 灯光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(20000, 20000, 20000)
        this.ms_Scene.add(directionalLight)
        // 初始化轨道控制器
        this.ms_Controls = new OrbitControls(this.ms_Camera, this.ms_Renderer.domElement)
        this.ms_Controls.enableKeys = true
        this.ms_Controls.minDistance = 1
        this.ms_Controls.maxDistance = 40000
        this.ms_Controls.enablePan = false

        // 初始化地面
        function initGrid(scene) {
            const material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }) //创建一个材质
            const color1 = new THREE.Color(0x444444)
            const color2 = new THREE.Color(0xff0000)
            const geometry = new THREE.Geometry() //创建点的集合
            const p1 = new THREE.Vector3(-500, 0, 0)
            const p2 = new THREE.Vector3(500, 0, 0)
            geometry.vertices.push(p1)
            geometry.vertices.push(p2)
            geometry.colors.push(color1, color2)
            for (let i = 0; i <= 20; i++) {
                let line = new THREE.Line(geometry, material, THREE.LineSegments)
                line.position.z = i * 50 - 500
                scene.add(line)
                line = new THREE.Line(geometry, material, THREE.LineSegments)
                line.position.x = i * 50 - 500
                line.rotation.y = (90 * Math.PI) / 180
                scene.add(line)
            }
        }
        initGrid(this.ms_Scene)

        const models = new THREE.Group()
        // 加载模型
        const loadModel = (name, config = {}) => {
            this.mtlloader.load(`/wp/${name}.mtl`, materials => {
                materials.preload()
                new OBJLoader().setMaterials(materials).load(`/wp/${name}.obj`, obj => {
                    // obj.children[0].geometry.computeBoundingBox()
                    if (config.scale) {
                        obj.scale.set(config.scale, config.scale, config.scale)
                        obj.children[0].scale.set(config.scale, config.scale, config.scale)
                    }
                    // if (name === 'HTground_sciencefiction_2001') obj.children[0].geometry.center()
                    // if (config.position) obj.position.set(...config.position)
                    // if (config.rotation) obj.rotation.set(...config.rotation)
                    if (name.includes('_inside_')) obj.children[0].translateX(31440)
                    // obj.children[0].translateX(-11000)
                    // obj.children[0].translateY(-360)
                    // this.ms_Scene.add(obj)
                    models.add(obj)
                })
            })
        }

        // let _name = this.isLine ? 'grid' : 'white'
        loadModel('HTground_sciencefiction_2001', { position: [0, 0, 0] })
        loadModel(`windpowergenerator_grid_2001_01`, { position: [0, 4500, 0] })
        loadModel(`windpowergenerator_grid_2001_02`, { position: [0, 9330, 0] })
        loadModel(`windpowergenerator_grid_2001_03`, { position: [0, 9300, 500] })
        loadModel(`windpowergenerator_grid_2001_04`, { position: [-50, 9300, 435] })
        loadModel('windpowergenerator_inside_2001_01', { position: [13, 9300, 450] })
        loadModel('windpowergenerator_inside_2001_02', { position: [-70, 9245, -840] })
        loadModel('windpowergenerator_inside_2001_03', { position: [0, 9300, 260] })
        loadModel('windpowergenerator_inside_2001_04', { position: [0, 9205, 3] })
        loadModel('windpowergenerator_inside_2001_05', { position: [0, 9300, 20] })
        loadModel('windpowergenerator_inside_2001_06', { position: [0, 9300, -320] })
        loadModel('windpowergenerator_inside_2001_07', { position: [-65, 9265, -520] })
        loadModel('windpowergenerator_inside_2001_08', { position: [-70, 9400, -450] })
        loadModel('windpowergenerator_inside_2001_09', { position: [-70, 9400, -805] })
        loadModel('windpowergenerator_inside_2001_10', { position: [35, 9270, -890] })
        loadModel('windpowergenerator_inside_2001_11', { position: [0, 9140, -380] })
        models.translateX(-11000)
        models.translateY(-360)
        this.ms_Scene.add(models)
    },

    Display: function () {
        this.ms_Renderer.render(this.ms_Scene, this.ms_Camera)
    },

    Update: function () {
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
    name: 'wp2',

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
    }
}
</script>

<style lang="less">
.wp {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    #wp {
        width: 100%;
        height: 100%;
    }

    &-oper {
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 1;
    }

    .pane {
        position: fixed;
        top: 10px;
        left: 100px;
        z-index: 1;
        display: none;
    }
}
</style>