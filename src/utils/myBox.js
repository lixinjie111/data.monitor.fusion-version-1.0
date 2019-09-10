/**
 * 自定义box
 * @param {x坐标} x
 * @param {y坐标} y
 * @param {y坐标} z
 * @param {线颜色} color
 */
export function addMyBox(x, y, z, color) {
    //判断是否为空
    if (x == null || x == undefined || x == '') {
        x = 1;
    }
    if (y == null || y == undefined || y == '') {
        y = 1;
    }
    if (z == null || z == undefined || z == '') {
        z = 1;
    }
    var geometry = new THREE.BoxBufferGeometry(x, y, z);
    //颜色
    let mesh1 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, opacity:0.5, transparent: true, wireframe: false});
    //let mesh1 = new THREE.MeshStandardMaterial({ color: 0xc3c3c382, wireframe: true,opacity:0.5});
    // var fillMaterial = new THREE.MeshBasicMaterial({
    //     color: 0x0000ff
    // });
    var fillMesh = new THREE.Mesh(geometry, mesh1);
    if (x == null || x == undefined || x == '') {
        x = 1;
    }
    if (color == null || color == undefined || color == '') {
        color = 0x00ffff;
    }
    var boxHelper = new THREE.Outline(fillMesh, color); //立方体边框 
    var group = new THREE.Group();
    group.add(fillMesh);
    group.add(boxHelper);
    //update();
    return group;
}
/**重新绘制立方体方法 */
THREE.Outline = function (object, color) {
    var indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
    var positions = new Float32Array(8 * 3);
    var geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    THREE.LineSegments.call(this, geometry, new THREE.LineBasicMaterial({
        color: color,
        linewidth: 10,
        linecap: 'round',
        linejoin: 'bevel'
    }));
    if (object !== undefined) {
        this.update(object);

    }

};
THREE.Outline.prototype = Object.create(THREE.LineSegments.prototype);
THREE.Outline.prototype.constructor = THREE.Outline;
//更新线数据
THREE.Outline.prototype.update = (function () {
    var outline = new THREE.Box3();
    return function (object) {
        outline.setFromObject(object);
        if (outline.isEmpty()) return;
        var min = outline.min;
        var max = outline.max;
        /*
		  5____4
		1/___0/|
		| 6__|_7
		2/___3/
		0: max.x, max.y, max.z
		1: min.x, max.y, max.z
		2: min.x, min.y, max.z
		3: max.x, min.y, max.z
		4: max.x, max.y, min.z
		5: min.x, max.y, min.z
		6: min.x, min.y, min.z
		7: max.x, min.y, min.z
		*/
        var position = this.geometry.attributes.position;
        var array = position.array;
        array[0] = max.x;
        array[1] = max.y;
        array[2] = max.z;
        array[3] = min.x;
        array[4] = max.y;
        array[5] = max.z;
        array[6] = min.x;
        array[7] = min.y;
        array[8] = max.z;
        array[9] = max.x;
        array[10] = min.y;
        array[11] = max.z;
        array[12] = max.x;
        array[13] = max.y;
        array[14] = min.z;
        array[15] = min.x;
        array[16] = max.y;
        array[17] = min.z;
        array[18] = min.x;
        array[19] = min.y;
        array[20] = min.z;
        array[21] = max.x;
        array[22] = min.y;
        array[23] = min.z;
        position.needsUpdate = true;
        this.geometry.computeBoundingSphere();
    }

})();