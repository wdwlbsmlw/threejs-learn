<template>
    <div class="wp"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import Stats from 'three/examples/js/libs/stats.min.js'

const stats = new Stats()

const WP = {
    ms_Renderer: null,
    ms_Camera: null,
    ms_Scene: null,
    ms_Controls: null,
    animation: true,
    loader: new FBXLoader(),

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
        const loadModel = (name) => {
            this.loader.load(`/garden/${name}.FBX`, obj => {
                // console.log(obj)
                this.ms_Scene.add(obj)
            })
        }
        const modellist = ["1M_Cube","ABuilding_TypeA_A_Frame","ABuilding_TypeA_B_Frame","ABuilding_TypeA_C_Frame","Balcony","Balcony_Corner","Balcony_Long","Balcony_Long_Rail","Balcony_Rail","Balcony_Rail_Double","Balcony_Ramp","Bogie_mdl","Building_TypeA_A","Building_TypeA_B","Building_TypeA_C","Building_TypeB_A","Building_TypeB_B","Building_TypeB_C","Building_TypeC_A","Building_TypeC_B","Building_TypeC_C","Building_TypeC_D","Building_TypeD_A","Building_TypeD_B","Building_TypeD_C","CargoCar_mdl","CargoContainer_LDoor_mdl","CargoContainer_Long_mdl","CargoContainer_mdl","CargoContainer_RDoor_mdl","CargoContainer_Short_mdl","Ceiling_Pipes_A","Ceiling_Pipes_B","CoalCar_mdl","ConcreteBlock","ConcretePipe_Large","ConcretePipe_Small","ConcretePipeStack_Large","ConcretePipeStack_Small","Curbs","Door1_mdl","Door2_mdl","Doorway1_mdl","Doorway2_mdl","ElectricalBox_A","ElectricalBox_B","ElectricalBox_C","ElectricalBox_D","ElectricalBox_E","ElectricalBox_F","Fence_Chainlink_Gate","Fence_Chainlink_Long","Fence_Chainlink_Long_Barbed","Fence_Chainlink_Post","Fence_Chainlink_Short","Fence_Chainlink_Short_Barbed","Fence_Chainlink_Spline","Fence_Chainlink_Tall","Fence_Chainlink_Tall_Spline","Fence_Constrction_Short_Spline","Fence_Construction_Long_Enclosed","Fence_Construction_Long_Spline","Fence_Construction_Short_Enclosed","Fence_Security","Fence_Short_Spline","Fence_Street","Fence_Wood_90","Fence_Wood_Long_Enclosed","Fence_Wood_Long_Spline","Fence_Wood_Short_Enclosed","Fence_Wood_Short_Spline","Flatbed_mdl","Forklift_mdl","forklift_Raised_mdl","Intersection_2x2_lane","Intersection_4x2_lane","Intersection_4x4_lane","Intersection_T_2x2_lane","Intersection_T_2x4_lane","Intersection_T_4x2_lane","Intersection_T_4x4_lane","Ivy_A","Ivy_B","Ivy_C","Ivy_D","Ivy_F","Ladder_Floating_Long","Ladder_Floating_Short","Ladder_Mounted_Long","Ladder_Mounted_Short","Ladder_RoofAccess","Light_Ceiling","Light_Floor_Base","Light_Floor_Housing","Light_Stand_Base","Light_Stand_Extension","Light_Stand_Housing","Light_Street","Light_Wall_A","Light_Wall_B","Lumber_2x4_Long","Lumber_2x4_Short","Lumber_2x8_Long","Lumber_2x8_Short","Lumber_Platform","Lumber_Plywood_A","Oil_Drum","Outhouse","Pallet","PineTree_A","PineTree_B","PineTree_C","Pipe","Pipe_A_90","Pipe_A_Long","Pipe_A_Mounted","Pipe_A_Short","Pipe_B_90","Pipe_B_Long","Pipe_B_Mounted","Pipe_B_Short","Pipes_Stack_A","Pipes_Stack_B","Pipes_Stack_C","Post","powerlinesD","Rail_A_Double_Corner","Rail_A_Double_End","Rail_A_Double_Mid","Rail_A_Double_Start","Rail_A_Double_T","Rail_A_EndFloating","Rail_A_Single_Corner","Rail_A_Single_End","Rail_A_Single_Mid","Rail_A_Single_Start","Rail_A_Single_T","Rail_B_Double_Corner","Rail_B_Double_End","Rail_B_Double_Mid","Rail_B_Double_Start","Rail_B_Double_T","Rail_B_EndFloating","Rail_B_Single_Corner","Rail_B_Single_End","Rail_B_Single_Mid","Rail_B_Single_Start","Rail_B_Single_T","Road_2L_VarA","Road_2L_VarB","Road_4L_VarA","Road_4L_VarB","RollupDoor_mdl","RollupDoor_Open_mdl","RollupDoor2_mdl","RollupDoor2_Open_mdl","SemiTrailer_Door_mdl","SemiTrailer_mdl","Shelfing_Large","Shelfing_Small","Sign_Beam_mdl","Sign1_mdl","Sign2_mdl","Sign3_mdl","Silo_mdl","Smokestack_mdl","Stairs_Metal_Long","Stairs_Metal_Short","Stairs_Wooden_Long","Stairs_Wooden_Short","SteelBeam_Long","SteelBeam_Short","SteelBeams_CeilingSupport","Stopper_mdl","Tarp_VarA_mdl","Tarp_VarB_mdl","Tarp_VarC_mdl","Tarp_VarD_mdl","Tire_mdl","Track_Gravel_mdl","Tracks_mdl","TrainFlat_mdl","Vent_A","Vent_A_90","Vent_A_Cap","Vent_A_End","Vent_A_Extension","Vent_A_Long","Vent_A_Mounted","Vent_A_Short","Vent_B","Vent_B_90","Vent_B_Cap","Vent_B_Extension","Vent_B_Long","Vent_B_Mounted","Vent_B_Short","Vent_C","Vent_D","Weed_B_A","Weed_B_B","Weed_C_A","Weed_C_B","Weed_D_A","Weed_D_B","Weed_F_A","Weed_F_B"]
        modellist.forEach(el => {
            loadModel(el)
        })
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
    name: 'garden',

    data() {
        return {
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
    }
}
</script>

<style lang="less">
.wp {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
</style>