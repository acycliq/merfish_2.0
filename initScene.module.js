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

    clearScreen()

}

const groupBy = (array, key) => {
    // from https://learnwithparam.com/blog/how-to-group-by-array-of-objects-using-a-key/
    // Return the end result
    return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
    }, {}); // empty object is the initial value for result object
};

function onMouseMove(event) {
    const mouse = {
        x: (event.clientX / viewer.renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / viewer.renderer.domElement.clientHeight) * 2 + 1,
    }

    // console.log(mouse)
    const raycaster = new THREE.Raycaster()

    raycaster.setFromCamera(mouse, scene.getActiveCamera())

    const intersects = raycaster.intersectObjects([cells.front_face.instancedMesh])

    if (intersects.length > 0) {
        if (intersects[0].distance < 200){
            var instanceId = cellData[intersects[0].instanceId];
            if (last_visited !== instanceId){
            // remove the lines from the last visited cell and draw the ones over the new cell
            remove_line()
            remove_line()
            cellMouseHover(instanceId.label)
            last_visited = instanceId
            }
        }
        else {
            clearScreen()
        }
    }
    else {
        // if you are now hovering over any cell, remove any lines you have drawn already
        // and map the last_visited variable to 0 (ie the label for the background)
        remove_line()
        last_visited = 0
    }
}

// function clearScreen(){
//     remove_line()
//     $('#dataTableControl').hide();
//     $('#donutChartControl').hide();
// }

function cellMouseHover(label) {
    console.log('Hovering over cell: ' + label)
    // "https://storage.googleapis.com/merfish_data/cellData/"
    d3.json("./py/cellData/" + label + ".json", outer(label));
}


function outer(label){
    return function onCellMouseHover(data) {
        var targetCell = cellData.filter(d => d.label === label)[0]
        var lines = make_line(data, targetCell)
        lines.map(d => viewer.scene.scene.add(d));
        var spots = groupBy(data, 'gene');
        $('#dataTableControl').show();
        renderDataTable(spots, targetCell)
        $('#donutChartControl').show();
        donutchart(targetCell)
    }
}


function make_line(obj, targetCell){
    var arr = Object.entries(obj).map(d => d[1]).flat()
    var out = arr.map(d => {
        return make_line_helper(d, targetCell)
    });
    return out
}

// function remove_line(){
//     var scene = viewer.scene.scene
//     scene.children.filter(d => d.type === "Line").forEach(el => scene.remove(el))
// }

function make_line_helper(spot_coords, targetCell) {
    var points = [];
    points.push(
        new THREE.Vector3(spot_coords.x, spot_coords.y, spot_coords.z),
        new THREE.Vector3(targetCell.x, targetCell.y, targetCell.z)
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