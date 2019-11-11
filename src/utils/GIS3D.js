class GIS3D {
    constructor() {
        this.cesiumContainer = null;
        this.cesium = { viewer: null };
        this.models = {};
        this.defualtZ = window.defualtZ;
    }
    initload(id, isFXAA) {
        this.cesiumContainer = document.getElementById(id);
        this.initCesium(); // Initialize Cesium renderer  
        if (!isFXAA) { 
            this.cesium.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 60; //距离地形的距离？这个值可以多测试几个值，，我这不太好描述
        } 
    }
    initCesium() {
        this.cesium.viewer = new Cesium.Viewer(this.cesiumContainer, {
            projectionPicker: true, animation: false,  //动画控制不显示     
            timeline: false
            ,    //时间线不显示
            imageryProvider: new Cesium.SingleTileImageryProvider({
                url: 'static/images/2.png'//透明图片
            }),
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            vrButton: false,
            orderIndependentTranslucency: false,
            baseLayerPicker: false, //是否显示图层选择控件

        });
        this.cesium.viewer.scene.globe.depthTestAgainstTerrain = false;
        this.cesium.viewer.scene.postProcessStages.fxaa.enabled = true;
        this.cesium.viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
        this.cesium.viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];
          this.cesium.viewer.imageryLayers.remove(this.cesium.viewer.imageryLayers.get(1));
        var terrainProvider = new Cesium.EllipsoidTerrainProvider();
        this.cesium.viewer.scene.terrainProvider = terrainProvider;
        // this.cesium.viewer.imageryLayers.removeAll();
        // let options = {
        //     camera: this.cesium.viewer.scene.camera,
        //     canvas: this.cesium.viewer.scene.canvas,
        //     clampToGround: true //开启贴
        // } 
          this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/changsha/3.geojson', {
            fill: Cesium.Color.ALICEBLUE.withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#fff'),// Cesium.Color.ORANGE,
            strokeWidth: 0,
            markerSymbol: '?'
          }));
         this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/changsha/2.geojson', {
            stroke: Cesium.Color.ALICEBLUE.withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 2,
            markerSymbol: '?'
        }));
          this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/changsha/1.geojson', {
            stroke: new Cesium.Color(0.5372549019607843, 0.2941176470588235, 0.1686274509803922, 0.996),// Cesium.Color.ALICEBLUE.withAlpha(0.996),
            strokeWidth: 2,
            markerSymbol: '?'
          })); 

        //业务数据
          this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: window.mapUrl,
            maximumLevel: 20,
            id: "layer1"
          }));
        //去除版权信息
          this.cesium.viewer._cesiumWidget._creditContainer.style.display = "none";
        //   var heading = Cesium.Math.toRadians(70);
        //   var pitch = -0.2369132859032279;
        //   var roll = 0.0029627735803421373;
        //   var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        //   this.cesium.viewer.camera.flyTo({
        //     destination: Cesium.Cartesian3.fromDegrees(112.94760914128275, 28.325093927226323, this.defualtZ + 39.142101722743725),
        //     orientation: hpr
        //   });
        let hierarchy = [
            112.953651652808389, 28.329121301607586, 50,
            112.953927670284997, 28.328597820186189, 50,
            112.952570766104373, 28.327743594794072, 50,
            112.952201968003351, 28.328177801283175, 50,
            112.953651652808276, 28.329121301607586, 50
        ];
        this.addPolygon(hierarchy, this.defualtZ);
        // this.initStreetLamp();
        this.initModel_pole();
        // this.add3DInfoLabel("aaa","慢行",112.95003033070373, 28.326432159727982,10)
        // this.remove3DInforLabel("aaa")
        let v = this.cesium.viewer;
        ///////////////
       
        //   this.cesium.viewer.clock.onTick.addEventListener(function () {
        //     if (v.camera.pitch > 0.1338563900681542) {
        //         debugger
        //         v.scene.screenSpaceCameraController.enableTilt = false;
        //     }
        //     else
        //     {
        //         v.scene.screenSpaceCameraController.enableTilt = true;
        //     }
        //   });
        //   var mousePosition, startMousePosition;
        //   var handler = new Cesium.ScreenSpaceEventHandler(v.canvas);
        //   handler.setInputAction(function (movement) {
        //     mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
        //     handler.setInputAction(function (movement) {
        //       mousePosition = movement.endPosition;
        //       var y = mousePosition.y - startMousePosition.y;
        //       if (y > 0) {
        //         v.scene.screenSpaceCameraController.enableTilt = true;
        //       }
        //     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //   }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN); 
        /////////////////////
        this.cesium.viewer.scene.camera.moveEnd.addEventListener(function () {
            if (v.dataSources.length == 0) return;
            var currentMagnitude = v.camera.getMagnitude();
            // console.log('currentMagnitude - ' + currentMagnitude);
            if (currentMagnitude <= 6374956.727578137) {
                if (v.dataSources.length > 0) {
                    if (!v.dataSources._dataSources[0].show) {
                        for (var i = 0; i < v.dataSources.length; i++) {
                            v.dataSources.get(i).show = true;
                        }
                        v.entities.getById("p1").show = true;
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
                        v.entities.getById("p1").show = false;
                    }

                }

                if (v.imageryLayers.length == 2) {
                    if (!v.imageryLayers._layers[1].show) {
                        v.imageryLayers.get(1).show = true;
                    }
                }
            }
        })
    }
    /**
     * 加载感知杆
     */
    initModel_pole()//初始化杆
    {
        var item = sessionStorage.getItem("sideList");
        var itemSide = JSON.parse(item);
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
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 5 + this.defualtZ),
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
            this.cesium.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/model/poleWith2Camera.glb',
                instances: instances
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
        positions.push(Cesium.Cartesian3.fromDegrees(x, y, 0));
        positions.push(Cesium.Cartesian3.fromDegrees(x, y, 20));
        let lableModel = this.cesium.viewer.entities.add({
            id: name,
            position: Cesium.Cartesian3.fromDegrees(x, y, 20),
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
            url: './static/model/car.glb',
            minimumPixelSize: 80,
            show: false,
            maximumScale: 5
        })
        //e.cesium.viewer.entities.add(entity);
        this.cesium.viewer.scene.primitives.add(entity);
    }
    updateCameraPosition(x, y, z, radius, pitch, yaw) {
        var heading = Cesium.Math.toRadians(radius);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, yaw);
        this.cesium.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(x, y, this.defualtZ + 39.142101722743725),
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
    /**
     * 加载灯杆
     */
    initStreetLamp() {
        //添加路灯杆和信息牌
        let itemSide = [[112.95003033070373, 28.326432159727982, 0]]

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
                    text: "sdfsd",
                    font: '20px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0)
                });
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
            this.cesium.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/model/street_lamp_two1.glb',
                instances: instances
            }));
        }
    }
    addPolygon(hierarchy, z) {
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
                url: './static/model/car_close.glb',
                instances: instances,
                scale: 10.0
            }));
        }
    }
}
export default GIS3D