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
    this.pulseInterval = '';//阈值范围
    this.perMaxValue = '';
    this.cacheAndInterpolateDataByDevId = {};
    this.stepTime = '';
    this.drawnObj = {};
  }

  //接受数据
  addPerceptionData(data, flag) {
    //  console.log(11);
    // this.cachePerceptionQueue.push(data);
    // this.cachePerceptionQueue= new Array();
    // this.cachePerceptionQueue.push(data);
    this.processPerceptionMesage(data, flag);
  }
  receiveData(sideList) {
    sideList.forEach(item => {
      // if(item.devId=='RCU_2046A10433DB_3100000000132000002801'){
          if (!this.devObj[item.devId]) {
              this.devObj[item.devId] = new Array();
          }
          this.devObj[item.devId].push(item);

      // }
    });
  }
  cacheAndInterpolatePerCar(device) {
    let devId = device.devId;
    let cdata = this.cacheAndInterpolateDataByDevId[devId];
    let d = {
      devId: devId,
      devType: device.devType,
      fuselType: device.fuselType,
      gpsTime: device.gpsTime,
      rcuId: device.rcuId,
      batchId: device.gpsTime,
      data: device.data
    };
    if (cdata == null)//没有该车的数据
    {
      cdata = {
        cacheData: new Array(),
        lastRecieveData: null,
        nowRecieveData: null,
      };
      cdata.cacheData.push(d);
      cdata.lastRecieveData = d;
      cdata.nowRecieveData = d;
      this.cacheAndInterpolateDataByDevId[devId] = cdata;
    } else {//存在该路侧杆的数据

      cdata.nowRecieveData = d;

      if (cdata.nowRecieveData.gpsTime < cdata.lastRecieveData.gpsTime || cdata.nowRecieveData.gpsTime == cdata.lastRecieveData.gpsTime) {
        // console.log("到达顺序错误或重复数据");
        return;
      }
      let deltaTime = cdata.nowRecieveData.gpsTime - cdata.lastRecieveData.gpsTime;
      if (deltaTime <= this.stepTime) {
        // cdata.cacheData.push(cdata.nowRecieveData);
      } else {

        //插值处理
        let deltaLon = cdata.nowRecieveData.longitude - cdata.lastRecieveData.longitude;
        let deltaLat = cdata.nowRecieveData.latitude - cdata.lastRecieveData.latitude;
        // let steps = Math.floor(deltaTime / this.stepTime)-1;
        let steps = Math.floor(deltaTime / this.stepTime);
        // let steps = 27;
        // console.log(steps)
        // console.log(cdata.nowRecieveData.gpsTime, cdata.lastRecieveData.gpsTime,deltaTime,steps);
        // let steps = 1;
        let timeStep = deltaTime / steps;
        for (let i = 1; i <= steps; i++) {
          let d2 = {};
          d2.gpsTime = cdata.lastRecieveData.gpsTime + timeStep * i;
          d2.batchId = d.gpsTime;
          d2.data = device.data;
          cdata.cacheData.push(d2);
        }
      }
      //  this.$emit("pcarDataTime",cdata.nowRecieveData.gpsTime,cdata.lastRecieveData.gpsTime);
      cdata.lastRecieveData = cdata.nowRecieveData;
      /*if(vid=='B21E0004'){
          console.log(vid,data.time,"***************")
      }*/
    }
  }
  processPerTrack(time, delayTime) {
    let devList = [];
      let list = [];
      // console.log("-----------");
    for (let devId in this.cacheAndInterpolateDataByDevId) {
      let devCacheData = this.cacheAndInterpolateDataByDevId[devId];
      if (devCacheData && devCacheData.cacheData.length > 0) {
        let devData = this.getMinValue(devId, time, delayTime, devCacheData.cacheData);
        if (!devData){
          // console.log("没有找到相应的值")
          return;
        }
        /*if (this.drawnObj[devId] != '' && devData.batchId == this.drawnObj[devId]) {
          // console.log("重复绘制的点"+devId+"  ,"+DateFormat.formatTime(devData.batchId,'hh:mm:ss'))
          return;
        }*/
        this.drawnObj[devId] = devData.batchId;
        let fusionList = devData.data;
          if(fusionList&&fusionList.length) {
              list.push.apply(list,fusionList);
          }
        // console.log(devData)
        // console.log("*****"+fusionList)
        devList.push(devData);
      }
    }
      // if(!Object.keys(this.drawnObj).length) {
      //     this.clearAllModel();
      // }
    // list.forEach(item=>{
    //   item.vehicleId =Math.random()*1000+"a" ;
    // })
      this.processPerceptionMesage(list);
      // console.log("************")
    return devList;
  }
  getMinValue(devId, time, delayTime, cacheData) {
    /* let minDiff = Math.abs(time-minData.gpsTime-delayTime);*/
    let rangeData = null;
    let startIndex = -1;
    let minIndex = -1;
    let minData = {};
    let minDiff;
    // console.log("找到最小值前："+cacheData.length);
    //找到满足条件的范围
    for (let i = 0; i < cacheData.length; i++) {
      let diff = Math.abs(time - cacheData[i].gpsTime - delayTime);
      // console.log(devId,cacheData.length,time,parseInt(cacheData[i].gpsTime),delayTime,diff,i)
      if (diff < this.pulseInterval) {
        if (startIndex != -1 && i != startIndex + 1) {
          break;
        }
        if (!rangeData || (rangeData && diff < rangeData.delayTime)) {
          startIndex = i;
          let obj = {
            index: i,
            delayTime: diff,
            data: cacheData[i]
          }
            minDiff=diff;
          rangeData = obj;
        } else {
          break;
        }
      } else {
        if (rangeData) {
          break;
        }
      }
    }
    //如果能找到最小范围
    // console.log(rangeData)
    if (rangeData) {
      minIndex = rangeData.index;
      minData = rangeData.data;
    } else {
      // console.log("plat***********************");
      minIndex = 0;
      minData = cacheData[0];
      minDiff = Math.abs(time - minData.gpsTime - delayTime);
      for (let i = 0; i < cacheData.length; i++) {
        let diff = Math.abs(time - parseInt(cacheData[i].gpsTime) - delayTime);
        // let diff = time-cacheData[i].gpsTime-insertTime;
        // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
        if (diff < minDiff) {
          minData = cacheData[i];
          minIndex = i;
          minDiff = diff;
        }

      }
    }
    // console.log("感知车最小索引:",devId,minIndex,cacheData.length,minDiff,DateFormat.formatTime(time,'hh:mm:ss:ms'),DateFormat.formatTime((minData.gpsTime+delayTime),'hh:mm:ss:ms'),DateFormat.formatTime(new Date().getTime(),'hh:mm:ss:ms'));
    // console.log("找到最小值",parseInt(minData.gpsTime),minData.batchId);
    //   minData.data.forEach(item=>{
    //     console.log(parseInt(minData.gpsTime),item.vehicleId);
    //   });
    // console.log("最小索引:"+minIndex);
    if (minDiff && minDiff > this.perMaxValue) {
      // console.log("per找到最小值无效");
    }else{
        this.cacheAndInterpolateDataByDevId[devId].cacheData = this.cacheAndInterpolateDataByDevId[devId].cacheData.filter((item, index) => {
            return index > minIndex;
        });
    }
    //打印出被舍弃的点
    // let lostData = this.cacheAndInterpolateDataByDevId[devId].cacheData.filter((item, index) => {
    //   return index < minIndex;
    // })
    //   if(lostData.length>0){
    //       console.log("丢失数据长度",lostData.length);
    //       lostData.forEach(item => {
    //           let d = Math.abs(time - parseInt(item.gpsTime) - delayTime);
    //           console.log("丢失的数据：",parseInt(item.gpsTime),d,minDiff,item.batchId);
    //           console.log("此帧车辆数据的长度："+item.data.length);
    //           item.data.forEach(data=>{
    //               console.log("车辆数据：",data);
    //           });
    //       })
    //   }
    //找到最小值后，将数据之前的数值清除
    // console.log("找到最小值后"+this.cacheAndInterpolateDataByDevId[devId].cacheData.length);
    //返回距离标尺的最小插值的数据
    return minData;
  }
  //************************************* */ 地图部分******************************
  //绘制感知车
  processPerceptionMesage(fusionList, flag) {
    let _this = this;

    // _this.processPerceptionDataIntervalId = setInterval(() => {
    if (_this.deviceModels == undefined) return;
    this.clearModel(fusionList);
    if (fusionList.length <= 0) return;
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
      if (d.targetType == 0) {//人
        this.addMoveModel(true, d, "person");
      }
      else if (d.targetType == 1) //自行车
      {
        this.addMoveModel(true, d, "bicycle");
      }
      else if (d.targetType == 2) { //感知车
        // console.log(d.vehicleId)
        /////////////处理感知车数据
        this.addMoveModel(false, d, "carbox");
        ///////////////////////////end 
        //移动标签
        var carlabel = this.viewer.entities.getById(d.vehicleId + "label");
        if (carlabel == null || carlabel == undefined) {
          this.addModeCarLabel(d,3);
        }
        else {
          this.moveModelLabel(carlabel, d,3);
        }
      }
      else if (d.targetType == 3) //摩托车
      {
        this.addMoveModel(true, d, "motorbike");
      }
      else if (d.targetType == 5) //公交车
      {
        this.addMoveModel(false, d, "bus");
        //移动标签
        var carlabel = this.viewer.entities.getById(d.vehicleId + "label");
        if (carlabel == null || carlabel == undefined) {
          this.addModeCarLabel(d,5);
        }
        else {
          this.moveModelLabel(carlabel, d,5);
        }
      }
      else if (d.targetType == 7) //卡车
      {
        this.addMoveModel(false, d, "truck");
        //移动标签
        var carlabel = this.viewer.entities.getById(d.vehicleId + "label");
        if (carlabel == null || carlabel == undefined) {
          this.addModeCarLabel(d,5);
        }
        else {
          this.moveModelLabel(carlabel, d,5);
        }
      }

    }
    // },0); //
  }
  //增加移动模型
  addMoveModel(isAnimation, d, name) {
    let carModel = this.getModelForPrimitive(d.vehicleId + name);//this.deviceModels.cars[d.vehicleId+"car"];
    if (carModel == null) {
      //初始化增加车辆 如果没有隐藏车辆的模型
      this.addModeCar(isAnimation, d, name, name);
    }
    else {
      this.moveModel(carModel, d, name);
    }
  }
  clearAllModel() {
    this.removeAllModelPrimitives();
    this.removeAllModelEntities();
  }
  removeAllModelPrimitives() {
    var primitives = this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive.id) {
        if (primitive instanceof Cesium.Model && primitive.id.search("carbox") != -1 || primitive.id.search("person") != -1) {
          this.viewer.scene.primitives.remove(primitive);
        }
      }
    }
  }
  removeAllModelEntities() {
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].id) {
        if (entities[i].id.search("label") != -1) {
          this.viewer.entities.remove(entities[i]);
        }
      }
    }
  }
  clearModel(fusionList) {
    this.clearCar(fusionList, "carbox");
    this.clearCar(fusionList, "person");
    this.clearCar(fusionList, "bicycle");
    this.clearCar(fusionList, "motorbike"); 
    this.clearCar(fusionList, "bus");
    this.clearCar(fusionList, "truck");

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
        if (entitie.id != fusionList[kk].vehicleId + "label" && entitie.id.search("label") != -1) {
          isTrue = true;
          continue;
        }
      }
      if (isTrue) {
        if (entitie.id.search("label") != -1) {
          entitie.show = false;
        }

        countLable++;
      }
    }
    if ((countLable - fusionList.length) >= 100) {
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
        if (primitive.id.indexOf(name) != -1) {
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
  addModeCar(isAnimation, d, name, glbName) {
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
    if (isAnimation) {
      //添加动画
      Cesium.when(model.readyPromise).then(function (model) {
        model.activeAnimations.addAll({
          loop: Cesium.ModelAnimationLoop.REPEAT,//控制重复
          speedup: 0.5, // 速度，相对于clock
          reverse: false // 动画反转
        })
      });
    }


  }
  removeModelPrimitives(name) {
    var primitives = this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive.id) {
        if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search(name) != -1) {
          this.viewer.scene.primitives.remove(primitive);
        }
      }
    }
  }
  removeModelEntities() {
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].id) {
        if (!entities[i].show && entities[i].id.search("label") != -1) {
          this.viewer.entities.remove(entities[i]);
        }
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
  addModeCarLabel(d,height) {
    var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + height);
    ///////////////增加文字
    let h = d.heading.toFixed(1);
    let s = d.speed.toFixed(1);
    let veh = d.vehicleId.substr(0, 4);
    let text = "[" + h + ", " + s + ", " + veh + "]";
    let entityLabel = this.viewer.entities.add({
      id: d.vehicleId + "label",
      position: position,
      point: {
        color: Cesium.Color.RED,    //点位颜色
        pixelSize: 0          //像素点大小
      },
      label: {
        text: text,
        fillColor: Cesium.Color.BLACK,
        backgroundColor: Cesium.Color.fromCssColorString('#fff'),
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
  moveModelLabel(carlabel, d,height) {
    //var carlabel = this.viewer.entities.getById( d.vehicleId + "label");
    carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ +height);
    let h = d.heading.toFixed(1);
    let s = d.speed.toFixed(1);
    let veh = d.vehicleId.substr(0, 4);
    let text = "[" + h + ", " + s + ", " + veh + "]";
    carlabel.show = true;
    carlabel.label.text = text;
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