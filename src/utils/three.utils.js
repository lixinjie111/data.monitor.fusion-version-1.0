let THREEUtls = {
    AddShpToScene(scene,features,color) {
        var material = new THREE.LineBasicMaterial({
            color: color
        });
        var geometry = new THREE.BufferGeometry();
        var mapfeatures = features.features;
        var group = new THREE.Group();
        //mapfeatures.length
        for (var i = 0; i < mapfeatures.length; i++) {
            var g = new THREE.BufferGeometry();
          //  for (var j = 0; j < mapfeatures[i].geometry.paths[0].length; j++) {
                ////////////// 计算点
                var j = [];
                var I;
                for (var D = 0; D < mapfeatures[i].geometry.paths[0].length; D++) {
                    var G = mapfeatures[i].geometry.paths[0][D];
                    if(D==0)
                    {
                        I = new THREE.Vector3(G[0], G[1], null != G[2] ? G[2] : 20);
                    }
                    var N = [G[0], G[1], null != G[2] ? G[2] : 20];
                    I.x = Math.min(I.x,N[0]);
                    I.y = Math.min(I.y,N[1]);
                    I.z = Math.min(I.z,N[2]);
                    if(D==0||D== mapfeatures[i].geometry.paths[0].length)
                    {
                        j.push(G[0]);
                        j.push(G[1]);
                        j.push(20);
                    }
                    else
                    {
                        j.push(G[0]);
                        j.push(G[1]);
                        j.push(20);
                        j.push(G[0]);
                        j.push(G[1]);
                        j.push(20);
                    }
                }
                for (var W = 0; W < j.length; W +=3)
                {
                    j[W+0] =  j[W+0] - I.x;
                        j[W+1] =j[W+1] - I.y;
                        j[W+2] =j[W+2] - I.z;
                }
                var U = new Float32Array(j);
                g.addAttribute('position', new THREE.BufferAttribute(U,3));
                var line = new THREE.LineSegments(g,material);
                line.position.x=I.x;
                line.position.y=I.y;
                line.position.z=I.z;
                group.add(line);

        }
        scene.add(group);
    }
}
export default  THREEUtls;