import { Vector3 } from 'three'

// 加载场景背景图
export const sceneBgImg = [
    require('@/assets/ocean-sky-sunny/SunnyDay_px.jpg'),
    require('@/assets/ocean-sky-sunny/SunnyDay_nx.jpg'),
    require('@/assets/ocean-sky-sunny/SunnyDay_py.jpg'),
    require('@/assets/ocean-sky-sunny/SunnyDay_ny.jpg'),
    require('@/assets/ocean-sky-sunny/SunnyDay_pz.jpg'),
    require('@/assets/ocean-sky-sunny/SunnyDay_nz.jpg')
]

// 船体航行轨迹
export const curvesPoints = [
    // new Vector3(200, -40, -200),
    // new Vector3(200, -50, 200),
    // new Vector3(-200, -50, 200),
    // new Vector3(-200, -40, -200)
    new Vector3(400, -40 - 10, -800),
    new Vector3(-450, -40, 300),
    new Vector3(-550, -40, 500),
    new Vector3(-1000, -40 - 10, 700),
    new Vector3(-1500, -40, 1000)
]
