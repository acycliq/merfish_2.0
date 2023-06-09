import * as THREE from "./libs/three.js/build/three.module.js";

function make_cells_2(data) {
    var front_props = {
            side: THREE.FrontSide,
            opacity: 0.4,
            name: 'front_mesh'
        },
        back_props = {
            side: THREE.BackSide,
            opacity: 0.9,
            name: 'back_mesh'
        };

    // remove the zero class cells. No need to plot them
    var NON_ZERO_CELLS = data.filter(d => d.topClass !== 'ZeroXXX');
    // NON_ZERO_CELLS = NON_ZERO_CELLS.filter(d => d.topClass.startsWith('Calb2'))
    // data = [data[0]]
    var front_face = ellipsoids_2(NON_ZERO_CELLS, front_props),
        back_face = ellipsoids_2(NON_ZERO_CELLS, back_props);
        var cells = {};
    cells.front_face = front_face;
    cells.back_face = back_face;
    return cells
}

function ellipsoids_2(data, props) {
    var counts = data.length,
        loader = new THREE.TextureLoader();

    const flakesTexture = loader.load('./src/flakes.png')
    const base_props = {
        clearcoat: 1.0,
        clearcoatRoughness: 0,
        metalness: 0.065,
        roughness: 0.3,
        normalMap: flakesTexture,
        normalScale: new THREE.Vector2(0.3, 0.3),
        transmission: 0.0,
        transparent: true,
        // envMap: true,
    };
    var material = new THREE.MeshPhysicalMaterial(base_props);

    material.side = props.side;
    material.color = props.color;
    material.opacity = props.opacity;
    material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping;
    material.normalMap.repeat = new THREE.Vector2(30, 30)


    var uScale = 0;
    var widthSegments = 16,
        heightSegments = 0.5 * widthSegments;
    var geometry =  new THREE.SphereBufferGeometry(1, widthSegments, heightSegments);
    var _n = geometry.index.count/3;
    console.log('triangles: ' + (_n * counts).toLocaleString());
    var INSTANCEDMESH = new THREE.InstancedMesh(
        //provide geometry
        geometry,

        //provide material
        material,

        //how many instances to allocate
        counts,

        //is the scale known to be uniform, will do less shader work, improperly applying this will result in wrong shading
        !!uScale
    );

    // var dummy = new THREE.Object3D();
    var bbox_items = [];
    console.log('tic')
    var temp_obj = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
    for (var i = 0; i < counts; i++) {
        var coords = data[i],
            scales = {x:10, y:10, z:10},
            rot = {x:0, y:0, z:0},
            rgb = {r: data[i].r, g: data[i].g, b: data[i].b};
        // topClass = data[i].topClass,
        // color =  data[i].color;
        var dummy = new THREE.Object3D();
        dummy.position.set(coords.x, coords.y, coords.z);
        dummy.scale.set(scales.x*0.99, scales.y*0.99, scales.z*0.99);
        dummy.rotation.set(rot.x, rot.y, rot.z);
        dummy.updateMatrix();
        INSTANCEDMESH.name = props.name;
        INSTANCEDMESH.setMatrixAt(i, dummy.matrix);
        INSTANCEDMESH.setColorAt(i, new THREE.Color( rgb.r/255.0, rgb.g/255.0, rgb.b/255.0 ));
        temp_obj.applyMatrix4(dummy.matrix)
    }
    console.log('toc')
    INSTANCEDMESH.instanceColor.needsUpdate = true;
    INSTANCEDMESH.visible = true;
    INSTANCEDMESH.castShadow = true;
    INSTANCEDMESH.receiveShadow = false;

    function LOD_ramp() {
        // camera.position.distanceTo(scene.position) < 300? mesh_LOD(): null
        if (camera.position.distanceTo(scene.position) < 300) {
            console.log('Less than 300')
        }

    }


    // viewer.scene.scene.add(new THREE.AmbientLight(0x666666));

    var ellipsoidData = {};
    ellipsoidData.instancedMesh = INSTANCEDMESH;
    ellipsoidData.LOD_ramp = LOD_ramp;


    return ellipsoidData
}

function count_triangles(m){
    // input m is the mesh
    var _n = m.geometry.index.count/3;
    var count = m.count;
    console.log('triangles: ' + (_n * count).toLocaleString());
}

export default make_cells_2