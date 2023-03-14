import * as THREE from "./libs/three.js/build/three.module.js";

export function getAllPointsOfPointCloud(pointCloud) {
    var list = [];
    var array = pointCloud.pcoGeometry.root.geometry.attributes.position.array;
    var index = 0;
    for (var i = 0; i < pointCloud.pcoGeometry.root.geometry.attributes.position.count;i=i+3) {
        var x = array[i + 0];
        var y = array[i+ 1];
        var z = array[i + 2];
        let position = new THREE.Vector3(x, y, z);
        position.applyMatrix4(pointCloud.matrixWorld);
        list[index] = position;
        index++;
    }
    return list;
}