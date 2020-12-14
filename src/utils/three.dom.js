import { Raycaster, Vector2 } from 'three'

function DomEvent(dom, camera, cubes) {
    console.log(cubes)
    const raycaster = new Raycaster()
    const mouse = new Vector2()
    dom.addEventListener(
        'mousemove',
        event => {
            console.log('in event')
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects([cubes], true)
            if (intersects.length > 0) {
                intersects.forEach(({ object }) => {
                    addSelectedObject( selectedObject )
                    console.log(object.material)
                })
            }
        },
        true
    )
}

function addSelectedObject(object) {
    selectedObjects = [] //被拾取物体列表
    selectedObjects.push(object) //添加被拾取物体
}

function checkIntersection() {
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects([scene], true)
    if (intersects.length > 0) {
        var selectedObject = intersects[0].object
        addSelectedObject(selectedObject) //添加被拾取物体
        outlinePass.selectedObjects = selectedObjects //被拾取物体显示轮廓效果
    }
}

export default DomEvent
