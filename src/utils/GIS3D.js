class GIS3D {
  constructor() {
    this.cesiumContainer = null;
    /*this.maxWGS84 = [112.95003033070373, 28.326432159727982];
    this.minWGS84 = [112.94760914128275, 28.325093927226323];*/
    this.cesium = { viewer: null };
    this.models={};
  }
  initload(id,isFXAA) {
 
    this.cesiumContainer = document.getElementById(id);
    this.initCesium(); // Initialize Cesium renderer  
    if(isFXAA)
    {
      this.cesium.viewer.scene.postProcessStages.fxaa.enabled = isFXAA;
    }
    // PerceptionCars.initPerceptionCount(this);
    // PerceptionCars.processPerceptionMesage(this);
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
      vrButton: false

        });

    this.cesium.viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
    this.cesium.viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];

    // this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    //               url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    //   //            layer: "tdtAnnoLayer",
    //   //            style: "default",
    //   //            format: "image/jpeg",
    //   //            tileMatrixSetID: "GoogleMapsCompatible"，
    //   maximumLevel: 24
    //           })); 
    //增加谷歌影像底图
    // this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    //   url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}',
    //   tilingScheme: new Cesium.WebMercatorTilingScheme()
    // })
    // );


    // this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    //   url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}',
    //   tilingScheme: new Cesium.WebMercatorTilingScheme()
    // })
    // );

 
    // // //上海数据
    this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/3.geojson', {
      fill: Cesium.Color.ALICEBLUE, 
      markerSymbol: '?'
    }));
    this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/2.geojson', {
      stroke: Cesium.Color.fromCssColorString('#894b2b'),// Cesium.Color.ORANGE,
      strokeWidth: 2,
      markerSymbol: '?'
    }));
    this.cesium.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/data/1.geojson', {
      stroke: Cesium.Color.ALICEBLUE,
      strokeWidth: 2,
      markerSymbol: '?'
    }));
   
    //   this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    //   url: 'http://47.94.231.163:8088/geoserver/gwc/service/wmts/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
    //     '&LAYER=yz:YZ_hdmap_base&STYLE=&FORMAT=image/png&TILEMATRIXSET=EPSG:900913&TileMatrix=EPSG:900913:{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}', //服务地址
    //   maximumLevel: 24
    // }));




    // //增加业务图层
    // this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    //   url: 'http://10.0.1.22:8080/geoserver/gwc/service/wmts/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
    //     '&LAYER=shanghai_qcc:dl_shcsq_wgs84_zc_0708&STYLE=&FORMAT=image/png&TILEMATRIXSET=EPSG:900913&TileMatrix=EPSG:900913:{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}', //服务地址
    //   maximumLevel: 20
    // }));

    //长沙
    this.cesium.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
      url: 'http://218.76.44.22:48080/geoserver/gwc/service/wmts/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
        '&LAYER=shanghai_qcc:dl_shcsq_wgs84_zc_0709&STYLE=&FORMAT=image/png&TILEMATRIXSET=EPSG:900913&TileMatrix=EPSG:900913:{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}', //服务地址
      maximumLevel: 20
    }));
    //去除版权信息
    this.cesium.viewer._cesiumWidget._creditContainer.style.display = "none";


    //////////////世界坐标转换为经纬度

    // var ellipsoid=this.cesium.viewer.scene.globe.ellipsoid;
    // var cartesian3=new Cesium.Cartesian3( -2190690.3979744054,5174092.211871381,3008286.1630493593);
    // // var cartesian3=new Cesium.Cartesian3(this.cesium.viewer.camera.position["x"],this.cesium.viewer.camera.position["y"],this.cesium.viewer.camera.position["z"]);
    // var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
    // var lat=Cesium.Math.toDegrees(cartographic.latitude);
    // var lng=Cesium.Math.toDegrees(cartographic.longitude);
    // var alt=cartographic.height; 
    /////////////////

   /* var heading = Cesium.Math.toRadians(70);
    var pitch = -0.2369132859032279;
    var roll = 0.0029627735803421373;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    this.cesium.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(this.minWGS84[0], this.minWGS84[1], 39.142101722743725),
      orientation: hpr
    });*/
    // this.initStreetLamp();
    this.initModel_pole();
    
    this.add3DInfoLabel("aaa","慢行",112.95003033070373, 28.326432159727982,10)

    // this.remove3DInforLabel("aaa")


    let v = this.cesium.viewer;
    this.cesium.viewer.scene.camera.moveEnd.addEventListener(function () { 
      if (v.dataSources.length == 0) return;
      var currentMagnitude = v.camera.getMagnitude();
      // console.log('currentMagnitude - ' + currentMagnitude);
      if (currentMagnitude <= 6373393.152436117) { 
        v.dataSources.get(0).show = true;
        if (v.dataSources.length == 2) {
          v.dataSources.get(1).show = true;
        } 
        if (v.imageryLayers.length == 2) {
          v.imageryLayers.get(1).show = false;
        } 
        // v.scene.postProcessStages.fxaa.enabled = true;
      }
      else {
        if (v.dataSources.get(0).show) {
          v.dataSources.get(0).show = false;
          if (v.dataSources.length == 2) {
            v.dataSources.get(1).show = false;
          }; 
          if (v.imageryLayers.length == 2) {
            v.imageryLayers.get(1).show = true;
          } 
        }
        // v.scene.postProcessStages.fxaa.enabled = false;
      }
    })


    ////////////////////


    this.cesium.viewer.scene.screenSpaceCameraController.minimumZoomDistance =6; //距离地形的距离？这个值可以多测试几个值，，我这不太好描述
    //  this.cesium.viewer.clock.onTick.addEventListener(function () {
    //    if(v.camera.pitch > 0){
    //      v.scene.screenSpaceCameraController.enableTilt = false;
    //     }
    //  })
    //  var startMousePosition;
    //  var mousePosition;
    //  var handler = new Cesium.ScreenSpaceEventHandler(canvas);
    //  handler.setInputAction(function(movement) {
    //      mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
    //      handler.setInputAction(function(movement) {
    //          mousePosition = movement.endPosition;
    //          var y = mousePosition.y - startMousePosition.y;
    //          if(y>0){
    //              scene.screenSpaceCameraController.enableTilt = true;
    //          }
    //      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //  }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN); 
    ///////////////////////
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
          fillColor  :Cesium.Color.BLACK ,
          backgroundColor: Cesium.Color.fromCssColorString('#fff'),
          position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 5),
          text: itemSide[i].devName,
          font: '14px sans-serif',
          showBackground: true,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0.0, 0),
          // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
            scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
        });
        var position = Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 0);
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
        positions.push(new Cesium.Cartesian3(radius * Math.cos(radians), radius * Math.sin(radians),10));
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
  add3DInfoLabel(name, text, x, y, z) 
    { 
     let positions = []; 
      positions.push(Cesium.Cartesian3.fromDegrees(x,y,0));
      positions.push(Cesium.Cartesian3.fromDegrees(x,y,10));
     let lableModel= this.cesium.viewer.entities.add({
        id: name,
        position: Cesium.Cartesian3.fromDegrees(x,y,10),
        // point: {
        //   color: Cesium.Color.RED,    //点位颜色
        //   pixelSize: 10          //像素点大小
        // },  
        polyline : {
            positions : positions,
            width :3,
            material:Cesium.Color.fromCssColorString('#ab6503')
            // material : new Cesium.PolylineGlowMaterialProperty({
            //     color : Cesium.Color.fromCssColorString('#ab6503')
            //     // ,//Cesium.Color.DEEPSKYBLUE, 0xab6503
            //     // glowPower : 0.25
            // })
        },
        label: {
          text:  text,
        
          // fillColor  :Cesium.Color.BLACK ,
          backgroundColor: Cesium.Color.fromCssColorString('#894b2b'),
          font: '30px sans-serif',
          showBackground: true,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0.0, 0),
          // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
            scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
        }
      }); 

      this.models[name] =lableModel;
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
                  z:this.cesium.viewer.camera.position.z,
                  radius: this.cesium.viewer.camera.heading,
                  pitch: this.cesium.viewer.camera.pitch,
                  yaw: this.cesium.viewer.camera.roll
              };
              return obj;
          }
       addModel(name, url, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x,y, z); 
        var heading = Cesium.Math.toRadians(0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        var entity =Cesium.Model.fromGltf({
          id: name,
          modelMatrix: modelMatrix,
          url: './static/model/car.glb',
          minimumPixelSize: 80,
          show:false,
          maximumScale:5
        //   ,
        //   scale : 3.0     //放大倍数
          // debugWireframe:true
        })
        //e.cesium.viewer.entities.add(entity);
        this.cesium.viewer.scene.primitives.add(entity);
          }
    updateCameraPosition(x, y, z, radius, pitch, yaw)
    {
      var heading = Cesium.Math.toRadians(radius);
      // var pitch = -0.2369132859032279;
      // var roll = 0.0029627735803421373;

        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, yaw);
        this.cesium.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(x, y, 39.142101722743725),
            orientation: hpr
        });

    }
    updatePosition(minx,miny,maxx,maxy){
        var rectangle = new Cesium.Rectangle.fromDegrees(minx,miny,maxx,maxy);
        this.cesium.viewer.camera.flyTo({
            destination: rectangle
        });
    }


    /**
     * 加载灯杆
     */
    initStreetLamp() {
        debugger
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
    textCar() {
        debugger
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
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1],5);
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