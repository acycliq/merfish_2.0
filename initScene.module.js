import * as THREE from "./libs/three.js/build/three.module.js";
import make_cells_2 from "./stage_cells.module.js";
import iniLights from "./lights.module.js";

var last_visited = 0
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
        if (last_visited !== instanceId){
            // remove the lines from the last visited cell and draw the ones over the new cell
            remove_line()
            cellMouseHover(instanceId.label)
            last_visited = instanceId
        }
    }
    else {
        // if you are now hovering over any cell, remove any lines you have drawn already
        // and map the last_visited variable to 0 (ie the label for the background)
        remove_line()
        last_visited = 0
    }
}

function cellMouseHover(label) {
    console.log('Hovering over cell: ' + label)
    d3.json("py/" + label + ".json", outer(label));
}


function outer(label){
    return function onCellMouseHover(data) {
        var centroid = cellData.filter(d => d.label === label)[0]
        var lines = make_line(data, centroid)
        lines.map(d => viewer.scene.scene.add(d));
    }
}


function make_line(obj, centroid){
    var arr = Object.entries(obj).map(d => d[1]).flat()
    var out = arr.map(d => {
        return make_line_helper(d, centroid)
    });
    return out
}

function remove_line(){
    var scene = viewer.scene.scene
    scene.children.filter(d => d.type === "Line").forEach(el => scene.remove(el))
}

function make_line_helper(spot_coords, centroid) {
    var points = [];
    points.push(
        new THREE.Vector3(spot_coords.x, spot_coords.y, spot_coords.z),
        new THREE.Vector3(centroid.x, centroid.y, centroid.z)
    )
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    // CREATE THE LINE
    var line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
            // color: getColor(d.Gene)
            color: '#00FF00'
        })
    );
    return line
}

export default initScene