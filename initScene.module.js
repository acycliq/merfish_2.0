import * as THREE from "./libs/three.js/build/three.module.js";
import make_cells_2 from "./stage_cells.module.js";
import iniLights from "./lights.module.js";

function initScene(data){
    cellData = data.cellData
    cells = make_cells_2(data.cellData)
    viewer.scene.scene.add(cells.front_face.instancedMesh);

    iniLights()

    viewer.renderer.domElement.addEventListener('mousemove', onMouseMove, false)

    // all done, remove the preloader
    removePreloader()
}

function onMouseMove(event) {
    const mouse = {
        x: (event.clientX / viewer.renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / viewer.renderer.domElement.clientHeight) * 2 + 1,
    }

    console.log(mouse)
    const raycaster = new THREE.Raycaster()

    raycaster.setFromCamera(mouse, scene.getActiveCamera())

    const intersects = raycaster.intersectObjects([cells.front_face.instancedMesh])

    if (intersects.length > 0) {
        var instanceId = cellData[intersects[0].instanceId];
        if (instanceId) {
            console.log('Hovering over cell: ' + instanceId.label)
        }

    }
}

export default initScene