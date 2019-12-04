/**
 * 地图数据及模型初始化
 */
let GisData = {
    //地图矢量数据初始化
    initDate(viewer) {
        //业务数据
        viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: window.mapUrl,
            maximumLevel: 22,
            id: "layer1",
            show: false
        }));
        //标识（箭头）
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/bs.geojson', {
            fill: Cesium.Color.ALICEBLUE.withAlpha(1).withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#fff').withAlpha(0.996),// Cesium.Color.ORANGE, 
            markerSymbol: '?',
            show: false
        }));
        //绿化带
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/lhd.geojson', {
            fill: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),// Cesium.Color.ORANGE, 
            markerSymbol: '?',
            zIndex: 1,
            show: false
        }));

        //斑马线
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/bmx.geojson', {
            fill: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),
            stroke: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),// Cesium.Color.ORANGE, 
            markerSymbol: '?',
            zIndex: 2,
            show: false
        }));
        //感知区域
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/gzqy.geojson', {
            fill: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),//'static/images/login-bg.jpg',//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),// Cesium.Color.ORANGE,  
            markerSymbol: '?',
            zIndex: 0,
            show: false
        }));
        //道路马路牙子

        let dlwbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/mlyz.geojson', {
            fill: Cesium.Color.fromCssColorString('#c0c7c5').withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#c0c7c5').withAlpha(0.996),// Cesium.Color.ORANGE, 
            markerSymbol: '?',
            zIndex: 1,
            show: false
        }));
        // dlwbk.then(function (dataSource) {
        //     var entities = dataSource.entities.values;
        //     for (var i = 0; i < entities.length; i++) {
        //         var entity = entities[i];
        //         entity.polygon.material =   new Cesium.ImageMaterialProperty({
        //                 image:'./static/images/36.png',
        //                 color: Cesium.Color.fromCssColorString('#fff').withAlpha(0.8),
        //                 repeat : new Cesium.Cartesian2(4,4)
        //             })
        //     }
        // }).otherwise(function (error) {
        //     //Display any errrors encountered while loading.
        //     //window.alert(error);
        // }); 
        // //道路面
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlm.geojson', {
            fill: Cesium.Color.fromCssColorString('#626669').withAlpha(1),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#626669').withAlpha(1),// Cesium.Color.ORANGE, 
            markerSymbol: '?',
            zIndex: 0,
            show: false
        }));
        //道路 长虚线
        let dcdx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlcxx.geojson', {
            stroke: Cesium.Color.ALICEBLUE.withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1) 
            strokeWidth: 1,
            markerSymbol: '?',
            show: false
        }));
        dcdx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {

                var entity = entities[i];
                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.ALICEBLUE.withAlpha(0.996),
                    dashLength: 10.0
                });
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });

        //道路短虚线
        let dcxx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dldxx.geojson', {
            stroke: Cesium.Color.ALICEBLUE.withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 1,
            markerSymbol: '?',
            show: false
        }));
        dcxx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.ALICEBLUE.withAlpha(0.996),
                    dashLength: 25.0
                })
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //停止线
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/step.geojson', {
            stroke: Cesium.Color.fromCssColorString('#c0c0c0').withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 2,
            markerSymbol: '?',
            show: false
        }));
        //道路直线
        let dlzx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlzx.geojson', {
            stroke: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 1,
            markerSymbol: '?',
            zIndex: 1,
            show: false
        }));
        dlzx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //道路外边框
        let dlbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlwbk.geojson', {
            stroke: Cesium.Color.fromCssColorString('#516b03').withAlpha(0.996),// Cesium.Color.ALICEBLUE.withAlpha(0.996),
            strokeWidth: 5,
            markerSymbol: '?',
            show: false
        }));
        dlbk.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 500);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //   dlbk.then(function(dataSource) {  
        //     var entities = dataSource.entities.values;  
        //     for (var i = 0; i < entities.length; i++) { 
        //         var entity = entities[i]; 
        //         entity.polyline.material=  new Cesium.PolylineGlowMaterialProperty({
        //             color : Cesium.Color.fromCssColorString('#954e2a').withAlpha(0.996),
        //             glowPower : 0.5
        //         }) 
        //     }
        // }).otherwise(function(error){
        //     //Display any errrors encountered while loading.
        //     //window.alert(error);
        // });
    },
    //初始化模型
    initModeData(viewer) {
      
        this.initStreetLamp(viewer);
        let itemSide = [[121.176068601690872, 31.281041974946387, 0.0],
        [121.175931201921159, 31.281250056281117, 0.0],
        [121.175837702684291, 31.281487401763044, 0.0],
        [121.175813087267912, 31.2816111623093, 0.0],
        [121.175611665192832, 31.282257492880102, 0.0],
        [121.175497224299534, 31.282427712036352, 0.0],
        [121.175337043107362, 31.282664109785724, 0.0],
        [121.175211304071553, 31.282843715072929, 0.0],
        [121.175096493983929, 31.283033022439465, 0.0],
        [121.174881663509254, 31.283220908383839, 0.0],
        [121.174499028463089, 31.283463690527348, 0.0],
        [121.174351611833018, 31.283614345983018, 0.0],
        [121.173866000554327, 31.283741467662288, 0.0],
        [121.173833405186315, 31.28396976197995, 0.0],
        [121.173249618392489, 31.284266961457959, 0.0],
        [121.172702114293713, 31.284411923636036, 0.0],
        [121.172256103095194, 31.28448195247546, 0.0],
        [121.17135536077636, 31.284497771337545, 0.0],
        [121.171766742741383, 31.28449408114853, 0.0],
        [121.171275666122668, 31.284019290594859, 0.0],
        [121.171675379950926, 31.284044075270536, 0.0],
        [121.171920611539534, 31.284009378396298, 0.0],
        [121.1721556504164, 31.283926801374037, 0.0],
        [121.172367725557535, 31.283882084824867, 0.0],
        [121.172613693022171, 31.283809209384724, 0.0],
        [121.172882070965642, 31.283727105357038, 0.0],
        [121.173016719970065, 31.283662192359401, 0.0],
        [121.173352329453124, 31.283552402910384, 0.0],
        [121.173689042254054, 31.283385346689286, 0.0],
        [121.173994253714966, 31.283122372405515, 0.0],
        [121.17421000540557, 31.282886766432771, 0.0],
        [121.174357421059057, 31.282736111088415, 0.0],
        [121.174583732446223, 31.282529295321826, 0.0],
        [121.174675948629186, 31.282358761172443, 0.0],
        [121.174902993916788, 31.282113767495673, 0.0],
        [121.175053716740138, 31.281791313488778, 0.0],
        [121.175112040334909, 31.281648938192287, 0.0],
        [121.175307214051344, 31.281327115392596, 0.0],
        [121.175412011314023, 31.281080383884685, 0.0],
        [121.175483101239593, 31.280852267323176, 0.0],
        [121.170266006802962, 31.283918988001886, 0.0],
        [121.169979640450777, 31.283781251074039, 0.0],
        [121.169734515887995, 31.283854978979488, 0.0],
        [121.169626594912316, 31.283642563258436, 0.0],
        [121.169372648122319, 31.283553021619475, 0.0],
        [121.16920908405163, 31.283388392578498, 0.0],
        [121.168877714287675, 31.28327865248448, 0.0],
        [121.168623400205504, 31.283208197992156, 0.0],
        [121.16820427265607, 31.283612738132362, 0.0],
        [121.168412842302857, 31.283749369510783, 0.0],
        [121.16879996438999, 31.283850358843985, 0.0],
        [121.169109109270764, 31.28395978234775, 0.0],
        [121.169428261626706, 31.284126629255461, 0.0],
        [121.170094029334649, 31.284220353128656, 0.0],
        [121.170290129099087, 31.284396677546386, 0.0],
        [121.170444426761023, 31.284465704094789, 0.0],
        [121.17053093793713, 31.284591046384609, 0.0],
        [121.17053093793713, 31.284591046384609, 0.0],
        [121.171248337685839, 31.284859030398891, 0.0],
        [121.171384463381287, 31.284717764861796, 0.0],
        [121.171686369500321, 31.28462659388898, 0.0],
        [121.172364291233194, 31.284636242844559, 0.0],
        [121.173055167590178, 31.284550603263469, 0.0]
        ]
        this.initTree(itemSide, viewer, "Htree");

        let itemSide2 = [[121.17551589465815, 31.281617738453047, 0.0]]

        this.initTree(itemSide2, viewer, "traffic_light_yellow");
      
 

        

        //         var billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection());
        // billboards.add({
        //   position : new Cesium.Cartesian3(121.17551589465815,31.281617738453047, 10.0),
        //   image : 'static/map3d/images/1.png'
        // });
        // billboards.add({
        //   position : new Cesium.Cartesian3(121.17551589465815,31.281617738453047, 10.0),
        //   image : 'static/map3d/images/1.png'
        // });

    },
    /**
     * 加载灯杆
     */
    initStreetLamp(viewer) {
        //添加路灯杆和信息牌
        let itemSide = [[121.17070961131611, 31.285431834985424],
        [121.17073199482752, 31.285150145980502],
        [121.17096459641984, 31.285168614731074],
        [121.17101335020133, 31.284874000996314],
        [121.17216565958867, 31.284348054967808],
        [121.17132056475575, 31.284276048390208],
        [121.17062888598159, 31.284216686156945],
        [121.17207633906403, 31.284239285633543],
        [121.17033359249672, 31.284157141256838],
        [121.1724246115773, 31.284181289535567],
        [121.17273228554805, 31.28410708290532],
        [121.17014346973389, 31.28410722054608],
        [121.17127629880481, 31.284068493485837],
        [121.16975107570983, 31.283968732825787],
        [121.17071496967101, 31.284011572973593],
        [121.17889298098785, 31.284066496892297],
        [121.17308388024266, 31.283994517255138],
        [121.17513316747507, 31.28202608387663],
        [121.17507200103864, 31.2820481296404],
        [121.17643623104242, 31.28201254302679],
        [121.17608145380935, 31.28192863389644],
        [121.17571194801135, 31.281806498814234],
        [121.17554428210079, 31.281528392645594],
        [121.17551565124025, 31.28127144704202],
        [121.17596714717831, 31.280635936312137],
        [121.1757986743549, 31.280924816290394],
        [121.17617058471296, 31.280354153655722],
        [121.17639732682561, 31.280095618450176],
        [121.17656592321617, 31.279932812971882],
        [121.17673851919542, 31.279782646028156],
        [121.17626731462425, 31.279858345912515],
        [121.17710489311077, 31.279497024499808],
        [121.17692052173562, 31.27963787124529],
        [121.17750680578966, 31.27916958914152],
        [121.1775359306423, 31.27919272313663],
        [121.17778939558842, 31.278952815954426],
        [121.17781590654938, 31.2789796944684],
        [121.1666703978575, 31.282784858344815],
        [121.17477219004144, 31.28290573394953],
        [121.17760398758145, 31.28286933091194],
        [121.16578527647836, 31.282646589044464]]

        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            // var labels = viewer.scene.primitives.add(new Cesium.LabelCollection());
            for (var i = 0; i < itemSide.length; i++) {
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 0);
                //  
                var heading = Cesium.Math.toRadians(30);
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/map3d/model/street_lamp_two.glb',
                instances: instances
            }));
        }
    },
  
    /**
    * 加载灯杆
    */
    initTree(itemSide, viewer, name) {
        //添加路灯杆和信息牌 
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            for (var i = 0; i < itemSide.length; i++) {
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 0);
                //  
                var heading = Cesium.Math.toRadians(30);
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/map3d/model/' + name + '.glb',
                instances: instances
            }));
        }
    },

}
export default GisData;