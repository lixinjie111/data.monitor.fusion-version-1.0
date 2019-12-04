

import GisData from '@/utils/GIS/GisData.js'
import light3D from '@/utils/GIS/light3D.js'
/**
 * 地图基础库
 */
class GIS3D {
    constructor() {
        this.cesiumContainer = null;
        this.cesium = { viewer: null };
        this.models = {};
        this.defualtZ = window.defualtZ;
        this.light3DList=[];//灯集合
    }
    initload(id, isFXAA) {
        this.cesiumContainer = document.getElementById(id);
        this.initCesium(); // Initialize Cesium renderer  
        if (!isFXAA) {
            this.cesium.viewer.scene.screenSpaceCameraController.minimumZoomDistance = this.defualtZ + 5; //距离地形的距离？这个值可以多测试几个值，，我这不太好描述
        }
    }
    initCesium() {
        this.cesium.viewer = new Cesium.Viewer(this.cesiumContainer, {
            projectionPicker: true, 
            animation: false,  //动画控制不显示     
            timeline: false
            ,    //时间线不显示
            imageryProvider: new Cesium.SingleTileImageryProvider({
                url: 'static/map3d/images/back.png'//透明图片
            }),
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            vrButton: false,
            // orderIndependentTranslucency: false,
            baseLayerPicker: false, //是否显示图层选择控件
            infoBox: false, //是否显示点击要素之后显示的信息
            
        });
        this.cesium.viewer.scene.globe.depthTestAgainstTerrain = false;
        // this.cesium.viewer.scene.postProcessStages.fxaa.enabled = true;
        this.cesium.viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
        this.cesium.viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];
        this.cesium.viewer.imageryLayers.remove(this.cesium.viewer.imageryLayers.get(1));
        //   var terrainProvider = new Cesium.EllipsoidTerrainProvider();
        // this.cesium.viewer.scene.terrainProvider = terrainProvider;
         //解决面的问题
         this.cesium.viewer.scene.logarithmicDepthBuffer = false; 
        // this.cesium.viewer.scene.skyBox.show = false
        // this.cesium.viewer.scene.backgroundColor =Cesium.Color.fromCssColorString('#758152').withAlpha(0.1);

        //去除版权信息
        this.cesium.viewer._cesiumWidget._creditContainer.style.display = "none";
      
        let v = this.cesium.viewer; 
           this.cesium.viewer.scene.camera.moveEnd.addEventListener(function () { 
            if (v.dataSources.length == 0) return;  
            var currentMagnitude = v.camera.getMagnitude(); 
            if (currentMagnitude <= 6372507.256225062) {
                if (v.dataSources.length > 0) {
                    if (!v.dataSources._dataSources[0].show) {
                        for (var i = 0; i < v.dataSources.length; i++) {
                            v.dataSources.get(i).show = true;
                        }
                    }
                } 
                if (v.imageryLayers.length == 2) {
                    if (v.imageryLayers._layers[1]) {
                        v.imageryLayers.get(1).show = false;
                    }
                }
            }
            else {
                if (v.dataSources.length > 0) {
                    if (v.dataSources._dataSources[0].show) {
                        for (var i = 0; i < v.dataSources.length; i++) {
                            v.dataSources.get(i).show = false;
                        }
                    } 
                }
                if (v.imageryLayers.length == 2) {
                    if (!v.imageryLayers._layers[1].show) {
                        v.imageryLayers.get(1).show = true;
                    }
                }
            }
        })
        this.initAllDate(); 
    }
    /**
     * 初始化所有数据
     */
    initAllDate() {
        //初始化地图数据
        GisData.initDate(this.cesium.viewer);
        //初始化模型数据
        GisData.initModeData(this.cesium.viewer);
        var item = sessionStorage.getItem("sideList");
        
        this.initModel_pole(item,this.cesium.viewer); 
        this.initlight();
    }
    updateLight(light)
    { 
        debugger
        if(light.id==277)
        {
            this.light3DList[0].idd=light.id;
            this.light3DList[0].img1=light.img1; 
            this.light3DList[0].img2=light.img2; 
            this.light3DList[0].img3=light.img3;  
        } 
                   
    }
    /**
     * 初始化红绿灯
     */
    initlight()
    {
        let l1=new  light3D(); 
        l1.addLight(this.cesium.viewer,"277",121.17533995826606,31.282071700494583,60,90,90,90);
        this.light3DList.push(l1);
    }


     /**
     * 加载感知杆
     */
    initModel_pole(item,viewer)//初始化杆
    { 
        var itemSide = JSON.parse(item);
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            var labels = viewer.scene.primitives.add(new Cesium.LabelCollection());
            for (var i = 0; i < itemSide.length; i++) {
                labels.add({
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 10 + this.defualtZ),
                    text: itemSide[i].devName,
                    font: '14px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
                });
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, this.defualtZ);
                //  
                var heading = Cesium.Math.toRadians(itemSide[i].heading + 90);
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/map3d/model/poleWith2Camera.glb',
                instances: instances,
            }));
        }
    }
    computeCircle(radius) {
        var positions = [];
        for (var i = 0; i < 360; i++) {
            var radians = Cesium.Math.toRadians(i);
            positions.push(new Cesium.Cartesian3(radius * Math.cos(radians), radius * Math.sin(radians), 10));
        }
        return positions;
    }
    remove3DInforLabel(name) {

        let label = this.models[name];
        if (label != null) {
            this.cesium.viewer.entities.remove(label);
            delete this.models[name];
        }
    }
    add3DInfoLabel(name, text, x, y, z) {
        let positions = [];
        positions.push(Cesium.Cartesian3.fromDegrees(x, y, this.defualtZ + 0));
        positions.push(Cesium.Cartesian3.fromDegrees(x, y, this.defualtZ + 10));
        let lableModel = this.cesium.viewer.entities.add({
            id: name,
            position: Cesium.Cartesian3.fromDegrees(x, y, this.defualtZ + 10),
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.fromCssColorString('#ab6503')
            },
            label: {
                text: text,
                backgroundColor: Cesium.Color.fromCssColorString('#894b2b'),
                font: '30px sans-serif',
                showBackground: true,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0.0, 0),
                scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
            }
        });

        this.models[name] = lableModel;
    }
    getExtent() {
        // this.cesium.viewer
    }
    /**
            *获取相机参数
            */
    getCamera() {
        let obj = {
            x: this.cesium.viewer.camera.position.x,
            y: this.cesium.viewer.camera.position.y,
            z: this.cesium.viewer.camera.position.z,
            radius: this.cesium.viewer.camera.heading,
            pitch: this.cesium.viewer.camera.pitch,
            yaw: this.cesium.viewer.camera.roll
        };
        return obj;
    }
    addModel(name, url, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x, y, z);
        var heading = Cesium.Math.toRadians(0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        var entity = Cesium.Model.fromGltf({
            id: name,
            modelMatrix: modelMatrix,
            url: './static/map3d/model/car.glb',
            minimumPixelSize: 80,
            show: false,
            maximumScale: 5
        })
        //e.cesium.viewer.entities.add(entity);
        this.cesium.viewer.scene.primitives.add(entity);
    }
    updateCameraPosition(x, y, z, radius, pitch, yaw) {
        var heading = radius;// Cesium.Math.toRadians(radius);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, yaw);
        this.cesium.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(x, y,z),
            orientation: hpr
        });

    }
    //二三维切换
    updatePosition(minx, miny, maxx, maxy) {
        var rectangle = new Cesium.Rectangle.fromDegrees(minx, miny, maxx, maxy);
        this.cesium.viewer.camera.flyTo({
            destination: rectangle
        });
    }
   
    addPolygon(hierarchy, z) {
        // new Cesium.ImageMaterialProperty({
        //     image:'./static/images/3.png',
        //     color: Cesium.Color.fromCssColorString('#fff').withAlpha(0.8),
        //     repeat : new Cesium.Cartesian2(4,4)
        // })
        this.cesium.viewer.entities.add({
            id: "p1",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(hierarchy),
                extrudedHeight: z,
                perPositionHeight: true,
                material: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.8),
                outline: false
            }
        });
    }
    textCar() {
        //添加路灯杆和信息牌
        let itemSide = [[112.95003033070373, 28.326432159727982, 0]]
        var h1 = 360;
        var h = -90 + h1;
        var heading = Cesium.Math.toRadians(h);
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            var labels = this.cesium.viewer.scene.primitives.add(new Cesium.LabelCollection());
            for (var i = 0; i < itemSide.length; i++) {
                labels.add({
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 5),
                    text: "航向角" + h1,
                    font: '20px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0)
                });
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 5);
                //  

                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            this.cesium.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/map3d/model/car_close.glb',
                instances: instances,
                scale: 10.0
            }));
        }
    }
}
export default GIS3D