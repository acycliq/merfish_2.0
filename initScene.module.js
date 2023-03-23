import * as THREE from "./libs/three.js/build/three.module.js";
import make_cells_2 from "./stage_cells.module.js";
import iniLights from "./lights.module.js";

function initScene(data){
    make_cells_2(data.cellData)

    iniLights()

    // all done, remove the preloader
    removePreloader()
}

export default initScene