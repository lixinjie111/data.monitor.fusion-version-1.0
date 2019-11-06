class PerceptionCars   {
  constructor() { 
    this.defualtZ= 0.8;
    this.cacheModelNum=200,//初始化车辆总数
    this.carColor= 0x80f77a,//感知车颜色
    this.pitch= 0,
    this.yaw= 0,
    this.roll= Math.PI * (10 / 90);
    this.deviceModels={};
    this.cachePerceptionQueue= new Array(); //缓存感知数据
    this.lastPerceptionMessage= null;
    this.viewer= null;
    this.processPerceptionDataIntervalId=null;
  }
  
    //接受数据
    addPerceptionData(data) {
  //  console.log(11);
      this.cachePerceptionQueue.push(data);
    }
    //绘制感知车
    processPerceptionMesage() {
      
      
      this.processPerceptionDataIntervalId = setInterval(() => {
  // requestAnimationFrame(PerceptionCars.processPerceptionMesage); 
      if (this.cachePerceptionQueue == null)
        return;
      if (this.cachePerceptionQueue.length == 0)
        return;
      this.lastPerceptionMessage = this.cachePerceptionQueue.shift();
      let data = null;
      if (this.lastPerceptionMessage == null) {
        return;
      } else {
        data = this.lastPerceptionMessage;
      }
      // var data2 = JSON.parse(data);
      let fusionList = data.result.vehDataDTO;
      // for(var i=0;i<1000;i++)
      // {
  
      //     var xy=fusionList[0];
      //    xy.latitude=fusionList[0].latitude+0.000001*i;
      //     xy.longitude=fusionList[0].longitude+0.000001*i;
      //     fusionList.push(xy)
      // }
  
  
      //复位感知车
      if (fusionList.length > 0) {
        var primitives = this.viewer.scene.primitives;
        var length = primitives.length;
         
        for (var k = 0; k < length; ++k) { 
            var p = primitives.get(k); 
            if(p.id==undefined)continue;
            if(p.id.search("model") != -1)
              {
              p.show=false;
              }
          }
         
          var entities = this.viewer.entities;//  .getById(i + "label");
          var enlength=entities.values.length;
          for (var k = 0; k < enlength; ++k) { 
            var lbl = entities.values[k]; 
            if(lbl.id==undefined)continue;
            if(lbl.id.search("label") != -1)
              {
                lbl.show=false;
              }
          }

        // for (let p = 0; p < this.deviceModels["0"].cars.length; p++) {
        //   let carmodel = this.viewer.entities.getById(p + "model");
        //   var position = Cesium.Cartesian3.fromDegrees(-1000, -1000, 0.0);
        //   carmodel.position = position;
        // }
  
        // for (let q = 0; q < this.deviceModels["0"].persons.length; q++) {
        //     let person = this.deviceModels["0"].persons[q];
        //     person.position.x = 0;
        //     person.position.y = 0;
        //     person.position.z = 0;
        // }
        // for (let q = 0; q < this.deviceModels["0"].texts.length; q++) {
        //     let text = this.deviceModels["0"].texts[q];
        //     text.position.x = 0;
        //     text.position.y = 0;
        //     text.position.z = 0;
        // }
      }
   
      for (let i = 0; i < fusionList.length; i++) {
        let d = fusionList[i];
  
        if (d.type == 1) {
          //平台车
          continue;
        }
        // if (d.heading >=360) {
        //     // 不处理大于360的的数据
        //     continue;
        // }
        if (d.heading < 0) {
          // 不处理小于0的的数据
          continue;
        }
        // let dUTM = this.webMercatorUtils.lngLatToXY(d.longitude, d.latitude)
  
        if (d.targetType == 0 || d.targetType == 1 || d.targetType == 3) {
          if (i < this.deviceModels["0"].persons.length) {
            let mdl = this.deviceModels["0"].persons[i];
            mdl.position.x = dUTM[0];
            mdl.position.y = dUTM[1];
            mdl.position.z = this.defualtZ;
          }
        } else {
  
          if (i < this.deviceModels["0"].cars.length) {
            if (d.fuselStatus == 0) {
              //let carmodel = this.deviceModels["0"].cars[i];
              let carmodel = null;
              var primitives = this.viewer.scene.primitives;
              var length = primitives.length;
               
              // for (var k = 0; k < length; ++k) {
                 
              //     var p = primitives.get(k); 
              //     if(p.id==undefined)continue;
              //     if(p.id.search("model") != -1)
              //       {
              //       p.show=false;
              //       }
              //   }
              for (var k = 0; k < length; ++k) {
                var p = primitives.get(k); 
                if(p.id==undefined)continue; 
                // if(p.id.search("model") != -1)
                // {
                // p.show=false;
                // }
                if (p.id == i + "model") {
                  carmodel = p; 
                  //break;
                }
               
              }


              if (carmodel == null) return;
              //    let carmodel = this.viewer.entities.getById(i + "model");
              var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 0.0);
  
              var heading = Cesium.Math.toRadians(d.heading);
              var pitch = 0;
              var roll = 0;
              var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
              var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
              //carmodel.orientation = orientation;
              carmodel.modelMatrix = orientation;
              carmodel.show=true;

              // carmodel.readyPromise.then(function(carmodel) {
              //   debugger
              // var m=  carmodel.getMesh(0)
              //   var textureIndexToReplace = 0;
              //   var textures = carmodel._rendererResources.textures;
              //   var texture = textures[textureIndexToReplace];
              //   Cesium.Resource.fetchImage({
              //       url : ""
              //   }).then(function(image) {
              //       texture.copyFrom(image);
              //       texture.generateMipmap(); // Also replaces textures in mipmap
              //   });
              // });


              let hpRoll = new Cesium.HeadingPitchRoll()
              let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
              Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carmodel.modelMatrix)
   
              var carlabel = this.viewer.entities.getById(i + "label");
              carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,5);
              let h = d.heading.toFixed(1);
              let s = d.speed.toFixed(1); 
              carlabel.show=true;
              carlabel.label.text="[" + h + ", " + s + "]";
  
            } 
          }
        }
      }
    }, 50); //
    }
    /**
     * 初始化感知车数量
     */
    initPerceptionCount(e) {
  
      var deviceid = "0";
      this.deviceModels[deviceid] = { cars: [], persons: [], texts: [] }; 
      for (let m = 0; m < this.cacheModelNum; m++) { 
        var position = Cesium.Cartesian3.fromDegrees(-1000, -1000, 0.0); 
  
       
  
        var heading = Cesium.Math.toRadians(0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        var entity =Cesium.Model.fromGltf({
          id: m + "model",
          modelMatrix: modelMatrix,
          url: './static/model/carbox.glb',
          minimumPixelSize: 80,
          show:false,
          maximumScale:5,
          color : Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE  , parseFloat(.3)),
          // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
          colorBlendMode : Cesium.ColorBlendMode.Mix,
        //   ,
        //   scale : 3.0     //放大倍数
          // debugWireframe:true
        })
        
        this.deviceModels[deviceid].cars[m] = entity;
        //e.cesium.viewer.entities.add(entity);
        e.scene.primitives.add(entity);
  
        ////////////////////////
        let entityLabel = e.entities.add({
          id: m + "label",
          position: position,
          point: {
            color: Cesium.Color.RED,    //点位颜色
            pixelSize: 0          //像素点大小
          },
        //   box : {
        //     dimensions : new Cesium.Cartesian3(1, 1, 1),
        //     outline : true,
        //     outlineColor : Cesium.Color.WHITE,
        //     outlineWidth : 5,
        //     material : Cesium.Color.fromRandom({alpha : 0})
        // },
          label: {
            text: "",
            // fillColor  :Cesium.Color.BLACK ,
            // backgroundColor: Cesium.Color.fromCssColorString('#fff'),
            font: '12px sans-serif',
            showBackground: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0.0, 0),
            // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
            scaleByDistance : new Cesium.NearFarScalar(2000, 1, 8000, 0)//new Cesium.NearFarScalar(1.5e2, 1.5, 1.0e5, 0.0)
          }
        }); 
  
      } 
      this.processPerceptionMesage();
      this.viewer = e;

 
    } 
  }
  export default PerceptionCars