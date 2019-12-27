import DateFormat from '@/utils/date.js'
class PerceptionCars {
    constructor() {
      this.defualtZ = window.defualtZ;
      this.cacheModelNum = 200,//初始化车辆总数
        this.carColor = 0x80f77a,//感知车颜色
        this.pitch = 0,
        this.yaw = 0,
        this.roll = Math.PI * (10 / 90);
      this.deviceModels = { cars: {}, persons: [], texts: [] };
      this.cachePerceptionQueue = new Array(); //缓存感知数据
      this.lastPerceptionMessage = null;
      this.viewer = null;
      this.processPerceptionDataIntervalId = null;
      this.devObj = {};
      this.pulseInterval='';//阈值范围
      this.cacheAndInterpolateDataByDevId={};
      this.stepTime='';
      this.drawObj = {};
    }
  
    //接受数据
    addPerceptionData(data,flag) {
        //  console.log(11);
        // this.cachePerceptionQueue.push(data);
        // this.cachePerceptionQueue= new Array();
        // this.cachePerceptionQueue.push(data);
        this.processPerceptionMesage(data,flag);
    }
    receiveData(sideList){
        sideList.forEach(item=>{
          if(!this.devObj[item.devId]){
            this.devObj[item.devId]=new Array();
          }
          item.gpsTimeFormat = DateFormat.formatTime(item.gpsTime, "yy-mm-dd hh:mm:ss:ms");
          item.updateTimeFormat = DateFormat.formatTime(item.updateTime, "yy-mm-dd hh:mm:ss:ms");
          this.devObj[item.devId].push(item);
      });
    }
    processPerTrack(time){
        let _drawObj = {};
        for (let devId in this.devObj) {
            let devCacheData = this.devObj[devId];
            if(devCacheData&&devCacheData.length>0){
              let devData = this.getMinValue(devId,time,devCacheData);
                if(!devData.data){
                    console.log("没有找到相应的值")
                    return;
                }
                let fusionList = devData.data.data;
                if(fusionList.length) {
                  _drawObj[devId] = fusionList;
                  this.processPerceptionMesage(devData.data.data,false,time);
                }
                // return devData;
            }else{
                console.log("缓存队列里没有值")
            }
        }
        this.drawObj = _drawObj;
        console.log("过滤数据--------------");
        console.log(this.drawObj);
        if(!Object.keys(this.drawObj).length) {
          this.clearAllModel();
        }

    }
    getMinValue(devId,time,cacheData){
           let rangeData=null;
           let startIndex=-1;
           //找到满足条件的范围
           for(let i=0;i<cacheData.length;i++){
               let diff = Math.abs(time-cacheData[i].gpsTime);
               // console.log(devId,cacheData.length,time,parseInt(cacheData[i].gpsTime),diff,i)
               if(diff<this.pulseInterval){
                   if(startIndex !=-1 && i != startIndex+1) {
                       break;
                   }
                   if(!rangeData || (rangeData && diff < rangeData.delayTime)) {
                       startIndex=i;
                       let obj={
                           index:i,
                           delayTime: diff,
                           data:cacheData[i]
                       }
                       rangeData = obj;
                   }else {
                       break;
                   }
               }else {
                   if(rangeData) {
                       break;
                   }
               }
           }
           let minIndex=-1;
           let minData = {};
           let minDiff;
           //如果能找到最小范围
           // console.log(rangeData)
           if(rangeData){
               minIndex = rangeData.index;
               minData = rangeData.data;
           }else{
               minIndex = 0;
               minData = cacheData[0];
               minDiff = Math.abs(time-minData.gpsTime);
               for(let i=0;i<cacheData.length;i++){
                   let diff = Math.abs(time-parseInt(cacheData[i].gpsTime));
                   if(diff<minDiff){
                       minData = cacheData[i];
                       minIndex = i;
                   }

               }
           }

           console.log("最小索引:"+minIndex);
           if(minDiff&&minDiff>this.perMaxValue){
               console.log("per找到最小值无效")
               return;
           }
           //返回距离标尺的最小插值的数据
           return {
            index: minIndex,
            data: minData
           };
    }
    //绘制感知车
    processPerceptionMesage(fusionList,flag,time) {
        let _this = this;

        // _this.processPerceptionDataIntervalId = setInterval(() => {
        if (_this.deviceModels == undefined) return;
        this.clearModel(fusionList);
        if (fusionList.length<=0) return;
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
        if (d.targetType == 0 || d.targetType == 1 || d.targetType == 3) {
          let carModel = this.getModelForPrimitive(d.vehicleId + "person");//this.deviceModels.cars[d.vehicleId+"car"];
          if (carModel == null) {
            let modelShow = this.getShowModelPrimitive("person");
            if (modelShow != null) {
              this.moveModel(modelShow, d, "person");
            } else {
              //初始化增加车辆
              this.addModeCar(d, "person", "person");
            }
          }
          else {
            this.moveModel(carModel, d, "person");
          }
        } else {
          if (d.fuselStatus == 0) {
            // console.log(d.vehicleId)
            /////////////处理感知车数据
            let carModel = this.getModelForPrimitive(d.vehicleId + "carbox");//this.deviceModels.cars[d.vehicleId+"car"];
            if (carModel == null) {
              let modelShow = this.getShowModelPrimitive("carbox");
              if (modelShow != null) {
                this.moveModel(modelShow, d, "carbox");
              } else {
                  //判断如果等或者大于360度，设置红色
                //初始化增加车辆 如果没有隐藏车辆的模型
                this.addModeCar(d, "carbox", "carbox");
              }
            }
            else {
              this.moveModel(carModel, d, "carbox");
            }
            ///////////////////////////end
  
            //移动标签
            var carlabel = this.viewer.entities.getById(d.vehicleId + "label");
            if (carlabel == null || carlabel == undefined) {
              let modelLabelshow = this.getShowModelLabelEntitie();
              if (modelLabelshow) {
                this.moveModelLabel(modelLabelshow, d, time);
              }
              else {
                this.addModeCarLabel(d, time);
              }
            }
            else {
              this.moveModelLabel(carlabel, d, time);
            }
            ///////////////
  
            // if (i < this.deviceModels.cars.length) {
            //   if (d.fuselStatus == 0) {
            //     this.moveModel(d, i, "model");
            //     var carlabel = this.viewer.entities.getById(i + "label");
            //     carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 5);
            //     let h = d.heading.toFixed(1);
            //     let s = d.speed.toFixed(1);
            //     carlabel.show = true;
            //     carlabel.label.text = "[" + h + ", " + s + "]";
  
            //   }
            // }
          }
        }
      }
      // },0); //
    }
    clearAllModel(){
        this.removeAllModelPrimitives();
        this.removeAllModelEntities();
    }
    removeAllModelPrimitives() {
      var primitives = this.viewer.scene.primitives;
      for (var i = 0; i < primitives.length; i++) {
        var primitive = primitives.get(i);
        if(primitive.id) {
          if (primitive instanceof Cesium.Model && primitive.id.search("carbox") != -1 || primitive.id.search("person") != -1) {
            this.viewer.scene.primitives.remove(primitive);
          }
        }
      }
    }
    removeAllModelEntities() {
      var entities = this.viewer.entities._entities._array;
      for (var i = 0; i < entities.length; i++) {
        if(entities[i].id) {
          if (entities[i].id.search("label") != -1) {
            this.viewer.entities.remove(entities[i]);
          }
        }
      }
    }
    clearModel(fusionList){
        this.clearCar(fusionList, "carbox");
        this.clearCar(fusionList, "person");
        this.clearCarLabel(fusionList);
    }
    clearCarLabel(fusionList) {
      /////////////////////////
      let countLable = 0;
      var entities = this.viewer.entities._entities._array;
      for (var i = 0; i < entities.length; i++) {
        var entitie = entities[i];
        let isTrue = false;
        for (var kk = 0; kk < fusionList.length; kk++) {
          if (entitie.id != fusionList[kk].vehicleId + "label"&& entitie.id.search("label") != -1) {
            isTrue = true;
            continue;
          }
        }
        if (isTrue) {
            if(entitie.id.search("label") != -1)
            {
                entitie.show = false;
            }

          countLable++;
        }
      }
      if ((countLable - fusionList.length) >= window.count) {
        this.removeModelEntities();
      }
      // console.log(fusionList.length + "空闲文字" + countLable)
    }
    clearCar(fusionList, name) {
      let _this = this;
      //复位感知车 
      let count = 0;
      var primitives = _this.viewer.scene.primitives;
      for (var i = 0; i < primitives.length; i++) {
        var primitive = primitives.get(i);
        let isTrue = false;
        for (var kk = 0; kk < fusionList.length; kk++) {
          if (primitive instanceof Cesium.Model && (primitive.id != fusionList[kk].vehicleId + name)) {
            isTrue = true;
            continue;
          }
        }
        if (isTrue) {
            if(primitive.id.indexOf(name) != -1) {
                primitive.show = false;
            }
          count++;
        }
      }
      if ((count - fusionList.length) >= window.count) {
        this.removeModelPrimitives(name);
      }
      // console.log(fusionList.length + "空闲车" + count)
    }
    /**
     * 增加车辆
     * @param {数据} d 
     */
    addModeCar(d, name, glbName) {
      var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
      var heading = Cesium.Math.toRadians(d.heading);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
      var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)
  
      let model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
        id: d.vehicleId + name,
        modelMatrix: modelMatrix,
        url: './static/map3d/model/' + glbName + '.glb',
        minimumPixelSize: 1,
        show: true,
        maximumScale: 5,
        // color : Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE  , parseFloat(1)),
        // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
        colorBlendMode: Cesium.ColorBlendMode.Mix
        //   ,
        //   scale : 3.0     //放大倍数
        // debugWireframe:true
      }));
  
    }
    removeModelPrimitives(name) {
      var primitives = this.viewer.scene.primitives;
      for (var i = 0; i < primitives.length; i++) {
        var primitive = primitives.get(i);
        if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search("carbox") != -1 || primitive.id.search(name) != -1) {
          this.viewer.scene.primitives.remove(primitive);
        }
      }
    }
    removeModelEntities() {
      var entities = this.viewer.entities._entities._array;
      for (var i = 0; i < entities.length; i++) {
        if (!entities[i].show && entities[i].id.search("label") != -1) {
          this.viewer.entities.remove(entities[i]);
        }
      }
    }
    //获取没有显示的模型
    getShowModelPrimitive(name) {
      var primitives = this.viewer.scene.primitives;
      for (var i = 0; i < primitives.length; i++) {
        var primitive = primitives.get(i);
        if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search(name) != -1) {
          return primitive;
        }
      }
    }
    getModelForPrimitive(id) {
      var primitives = this.viewer.scene.primitives;
      for (var i = 0; i < primitives.length; i++) {
        var primitive = primitives.get(i);
        if (primitive instanceof Cesium.Model && primitive.id === id) {
          return primitive;
        }
      }
    }
    //移动模型
    moveModel(carmodel, d, name) {
      var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
      var heading = Cesium.Math.toRadians(d.heading);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      //carmodel.orientation = orientation;
      carmodel.modelMatrix = orientation;
      carmodel.show = true;
      carmodel.id = d.vehicleId + name;
      //判断如果等或者大于360度，设置红色
      if (d.heading >= 360) {
        carmodel.color = Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1));
      }
      let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
      Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carmodel.modelMatrix)
  
    }
    addModeCarLabel(d, time) {
      var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 3);
      ///////////////增加文字
      let h = d.heading.toFixed(1);
      let s = d.speed.toFixed(1);
      let veh = d.vehicleId.substr(0,4)+"_"+d.vehicleId.substring(d.vehicleId.length-4);
      let devId = d.devId;
      let gpsTime = d.gpsTime;
      let updateTime = d.updateTime;
      let handleTime = d.updateTime-d.gpsTime;
      let entityLabel = this.viewer.entities.add({
        id: d.vehicleId + "label",
        position: position,
        // point: {
        //   color: Cesium.Color.RED,    //点位颜色
        //   pixelSize: 0          //像素点大小
        // }, 
        label: {
          // text: "[航向角:" + h + ", 速度:" + s +", 车辆ID:"+ veh+", 设备ID:"+ devId+", gpsTime:"+ gpsTime+", updateTime:"+updateTime+", 处理时间:"+handleTime+", 当前绘制的gpsTime:"+time+", 当前绘制的gpsTime-gpsTime:"+(time-gpsTime)+"]",
          text: veh,
          fillColor: Cesium.Color.BLACK,
          backgroundColor: Cesium.Color.fromCssColorString('#2ea7d4'),
          font: '14px sans-serif',
          showBackground: true,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0.0, 0),
          // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
          scaleByDistance: new Cesium.NearFarScalar(100, 1, 2000, 0)
        }
      });
    }
    /**
     * 移动文字标签
     */
    moveModelLabel(carlabel, d, time) {
      //var carlabel = this.viewer.entities.getById( d.vehicleId + "label");
      carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 3);
      let h = d.heading.toFixed(1);
      let s = d.speed.toFixed(1);
      let veh = d.vehicleId.substr(0,4)+"_"+d.vehicleId.substring(d.vehicleId.length-4);
      let devId = d.devId;
      let gpsTime = d.gpsTime;
      let updateTime = d.updateTime;
      let handleTime = d.updateTime-d.gpsTime;
      carlabel.show = true;
      // carlabel.label.text = "[航向角:" + h + ", 速度:" + s +", 车辆ID:"+ veh+", 设备ID:"+ devId+", gpsTime:"+ gpsTime+", updateTime:"+updateTime+", 处理时间:"+handleTime+", 当前绘制的gpsTime:"+time+", 当前绘制的gpsTime-gpsTime:"+(time-gpsTime)+"]";
      text: veh;
    }
    getShowModelLabelEntitie() {
      var entities = this.viewer.entities._entities._array;
      for (var i = 0; i < entities.length; i++) {
        if (!entities[i].show && entities[i].id.search("label") != -1) {
          return this.viewer.entities.getById(entities[i].id);
        }
      }
    }
  
  
  }
  export default PerceptionCars