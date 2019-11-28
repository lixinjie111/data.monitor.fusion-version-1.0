import DateFormat from '@/utils/date.js'
class ProcessCarTrack {
    constructor() {
        this.viewer = null;
        // pCacheModelNum: 200,//感知车数量
        this.stepTime = '';//处理车缓存时间
        this.pulseInterval='';//阈值范围
        this.recieveCount = 0;
        this.defualtZ = 0.8;
        this.pitch = 0;
        this.yaw = 0;
        this.roll = Math.PI * (10 / 90);
        this.pmodels = {};
        this.testCar = {};
        this.models = {};
        this.cacheTrackCarData = [];
        //按照vid缓存插值的小车轨迹
        this.cacheAndInterpolateDataByVid = {};
        this.cameraDefualtZ = 22.86,
        this.cameraDefualtRadius = 10,
        this.cameraDefualtPitch = -0.2,
        this.mainCarVID = "";
        this.isload = false;
        this.x = 0;
        this.processPlatformCarsTrackIntervalId=null;
        this.platObj={};
    }

    //路口视角  平台车
    onCarMessage(data,flag) {
        console.log('----------')
        console.log(data.time);
        // this.cacheTrackCarData=data;
        this.thisMessage(flag,data);
    }
    thisMessage(isCar,data) {
        let data2 = data.result.data;
        if (isCar == 0) {
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                if (pcar.vehicleId == "B21E0003")
                //缓存数据
                this.cacheAndInterpolatePlatformCar(pcar,data);
            }
        }
        else {
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                //缓存数据
                this.cacheAndInterpolatePlatformCar(pcar,null);
            }
            let datamain = data.result.selfVehInfo;
            if (datamain != null) {
                this.mainCarVID = datamain.vehicleId;
                this.cacheAndInterpolatePlatformCar(datamain,null);
            }
        }


        // if (Object.getOwnPropertyNames(this.pmodels).length != 1) {
        //     // console.log("thisMessage:================>"+this.cacheMainCarTrackData.length);
        //     if (this.cacheTrackCarData == null) {
        //         return;
        //     }
        //     let data = this.cacheTrackCarData;
        //     let json = JSON.parse(data.data);
        //     // console.log(json);
        //     //处理旁车信息
        //     let pcars = null;// json.result.data;
        //     if (isCar == 1) {
        //         pcars = json.result.data;//单车界面
        //     }
        //     else {
        //         pcars = json.result.vehDataDTO;//路口界面
        //     }
        //     if (pcars != null) {
        //         for (let i = 0; i < this.pCacheModelNum; i++) {
        //             let model = this.pmodels["gzc" + i];
        //             if (model == undefined)
        //                 break;
        //             if (typeof (model) != undefined) {
        //                 model.position.set(0, 0, this.defualtZ);
        //             }
        //         }
        //         for (let n = 0; n < pcars.length; n++) {
        //             let pcar = pcars[n];
        //             if (pcar.heading < 0) {
        //                 // 不处理小于0的的数据
        //                 continue;
        //             }
        //             if (pcar.type != 1) {
        //                 let dUTM = this.webMercatorUtils.lngLatToXY(pcar.longitude, pcar.latitude)
        //                 let model = this.pmodels["gzc" + n];
        //                 model.position.set(dUTM[0], dUTM[1], this.defualtZ);
        //                 model.rotation.set(
        //                     this.pitch,
        //                     this.yaw,
        //                     (-Math.PI / 180) * pcar.heading
        //                 );
        //             } else {
        //                 //缓存数据
        //                 this.cacheAndInterpolatePlatformCar(pcar);
        //             }
        //         }
        //     }
        //     // return ;
        //     //处理自车信息

        //     let data2 = json.result.selfVehInfo;
        //     if (data2 != null) {
        //         this.mainCarVID = data2.vehicleId;
        //         this.cacheAndInterpolatePlatformCar(data2);
        //     }
        // }
    }

    //接受数据
    recieveData(json,time){
        let data = json.result.data;
        for(let vehicleId in data){
            // if(vehicleId=='B21E0002'){
            //     let diff = json.time - data[vehicleId][0].gpsTime;
            //     let diff1 = time - json.time;
                let diff = new Date().getTime()-data[vehicleId][0].gpsTime;
                let diff1 = json.time-data[vehicleId][0].gpsTime;
                let diff2 = new Date().getTime()-json.time
            // console.log("vehicleId:"+vehicleId+",send:"+DateFormat.formatTime(json.time,'hh:mm:ss')+",gpsTime:"+DateFormat.formatTime(data[vehicleId][0].gpsTime,'hh:mm:ss')+",pulseTime"+DateFormat.formatTime(time,'hh:mm:ss')+",local："+DateFormat.formatTime(new Date().getTime(),'hh:mm:ss')+",'local-send'"+diff2+",'local-gps:'"+diff+",'send-gps:'"+diff1)
                let vehList = data[vehicleId];
                let cdata = this.platObj[vehicleId];
                if(cdata==null){
                    cdata=new Array();
                }
                vehList.forEach(item=>{
                    cdata.push(item);
                })
                this.platObj[vehicleId]=cdata;
            // }
        }
        // console.log(vehicleId,this.platObj[vehicleId].length);
    }
    //缓存并且插值平台车轨迹
    cacheAndInterpolatePlatformCar(car) {
        let vid = car.vehicleId;
        let cdata = this.cacheAndInterpolateDataByVid[vid];

        if (cdata == null)//没有该车的数据
        {
            cdata = {
                cacheData: new Array(),
                intervalid: null,
                lastRecieveData: null,
                nowRecieveData: null,
                // lastProcessData: null,
                // nowProcessData: null,
                plateNo: null
            };
            let d = {
                vehicleId: vid,
                plateNo: car.plateNo,
                longitude: car.longitude,
                latitude: car.latitude,
                gpsTime: car.gpsTime,
                heading: car.heading,
            };
            cdata.cacheData.push(d);
            cdata.lastRecieveData = d;
            cdata.nowRecieveData = d;
            this.cacheAndInterpolateDataByVid[vid] = cdata;

            // var position = Cesium.Cartesian3.fromDegrees(car.longitude, car.latitude, 0.0);
            // var heading = Cesium.Math.toRadians(0);
            // var pitch = Cesium.Math.toRadians(0);
            // var roll = 0;
            // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            // var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
            // //e.cesium.viewer.entities.add(entity);
            // this.testCar = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
            //     id: "testcar",
            //     modelMatrix: modelMatrix,
            //     url: './static/model/car.glb',
            //     minimumPixelSize: 1,
            //     show: true,
            //     maximumScale: 5,
            // }));
        } else {//存在该车的数据

            let d = {
                vehicleId: vid,
                longitude: car.longitude,
                latitude: car.latitude,
                gpsTime: car.gpsTime,
                plateNo: car.plateNo,
                heading: car.heading,
            };
            cdata.nowRecieveData = d;
            // console.log("积压长度")
            //     console.log(cdata.cacheData.length,d.vehicleId)
            // var position = Cesium.Cartesian3.fromDegrees(car.longitude, car.latitude, 0.0);
            //
            // var heading = Cesium.Math.toRadians(car.heading);
            // var pitch = 0;
            // var roll = 0;
            // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            // var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            // this.testCar.modelMatrix = orientation;
            //
            // let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            // Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, this.testCar.modelMatrix)


            if (cdata.nowRecieveData.gpsTime < cdata.lastRecieveData.gpsTime ||cdata.nowRecieveData.gpsTime == cdata.lastRecieveData.gpsTime) {
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
                let steps = Math.ceil(deltaTime / this.stepTime);
                // let steps = 27;
                // console.log(steps)
                // console.log(cdata.nowRecieveData.gpsTime, cdata.lastRecieveData.gpsTime,deltaTime,steps);
                // let steps = 1;
                let timeStep = deltaTime / steps;
                let lonStep = deltaLon / steps;
                let latStep = deltaLat / steps;
                for (let i = 1; i <= steps; i++) {
                    let d2 = {};
                    d2.longitude = cdata.lastRecieveData.longitude + lonStep * i;
                    d2.latitude = cdata.lastRecieveData.latitude + latStep * i;
                    d2.gpsTime = cdata.lastRecieveData.gpsTime + timeStep * i;
                    d2.heading = cdata.nowRecieveData.heading;
                    d2.vehicleId = cdata.nowRecieveData.vehicleId;
                    d2.plateNo = cdata.nowRecieveData.plateNo,
                    d2.steps=i;
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
    processPlatformCarsTrack(time,delayTime) {
        // console.log("-------")
        let _this=this;
        for (var vid in _this.cacheAndInterpolateDataByVid) {
            let carCacheData = _this.cacheAndInterpolateDataByVid[vid];
            // console.log(carCacheData.nowRecieveData.gpsTime)
            if (carCacheData != null) {
                if (carCacheData.cacheData.length > 0) {
                    //缓存数据
                    let cacheData = _this.cacheAndInterpolateDataByVid[vid].cacheData;
                    // console.log(cacheData.length);
                    let cardata = this.getMinValue(vid,time,delayTime);
                    // let cardata = cacheData.shift();
                    if(!cardata){
                        return;
                    }
                    if (_this.mainCarVID == cardata.vehicleId) {
                        _this.moveCar(cardata);
                        _this.moveTo(cardata);
                        //主车
                    } else {
                        _this.moveCar(cardata);
                    }
                }
            }
        }
    }
    getMinValue(vid,time,delayTime){
        let cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData;
        let rangeData=null;
        let startIndex=-1;
        // console.log("找到最小值前："+cacheData.length);
        //找到满足条件的范围
        for(let i=0;i<cacheData.length;i++){
            let diff = Math.abs(time-cacheData[i].gpsTime-delayTime);
            console.log(vid,cacheData.length,time,parseInt(cacheData[i].gpsTime),delayTime,diff,i)
            if(diff<this.pulseInterval){
                // if(startIndex == -1) {
                //     startIndex=i;
                // }else {
                //     if(i == startIndex+1) {
                //         startIndex = i;
                //     }else {
                //         break;
                //     }
                // }
                // console.log("++++++++++++++")
               /* minData = cacheData[i];
                minIndex = i;*/
               //起始位置并且判断是否连续
               //  startIndex=i;
               //  let obj={
               //      index:i,
               //      delayTime: diff,
               //      data:cacheData[i]
               //  }
               //  rangeData.push(obj);
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
        let obj={};
        //如果能找到最小范围
        console.log(rangeData)
        if(rangeData){
            minIndex = rangeData.index;
            minData = rangeData.data;
           /* minIndex = 0;
            minData = rangeData[0].data;
            let minDiff = Math.abs(time-minData.gpsTime-delayTime);
            for(let i=0;i<rangeData.length;i++){
                let diff = Math.abs(time-parseInt(rangeData[i].data.gpsTime)-delayTime);
                // console.log(vid,rangeData.length, time, parseInt(rangeData[i].data.gpsTime) , diff)
                if(diff<minDiff){
                    minData = rangeData[i].data;
                    minIndex = rangeData[i].index;
                }
            }*/
        }else{
            console.log("plat***********************");
            minIndex = 0;
            minData = cacheData[0];
            let minDiff = Math.abs(time-minData.gpsTime-delayTime);
            for(let i=0;i<cacheData.length;i++){
                let diff = Math.abs(time-parseInt(cacheData[i].gpsTime)-delayTime);
                // let diff = time-cacheData[i].gpsTime-insertTime;
                // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
                if(diff<minDiff){
                    minData = cacheData[i];
                    minIndex = i;
                }

            }
        }
        console.log("最小索引:"+minIndex);
        //打印出被舍弃的点
        let lostData = this.cacheAndInterpolateDataByVid[vid].cacheData.filter((item,index)=>{
            return index<minIndex;
        })
        /*if(lostData.length>0){
            debugger
        }*/
        lostData.forEach(item=>{
            let minDiff = Math.abs(time-cacheData[minIndex].gpsTime);
            // console.log("插值最小的索引"+minIndex,minDiff);
            let d =  Math.abs(time-item.gpsTime);
            // console.log("##"+d);
        })


        //找到最小值后，将数据之前的数值清除
        this.cacheAndInterpolateDataByVid[vid].cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData.filter((item,index)=>{
            return index>minIndex;
        })
        console.log("找到最小值后"+this.cacheAndInterpolateDataByVid[vid].cacheData.length);

        //返回距离标尺的最小插值的数据
        return minData;
    }
   /* getMinValue(vid,time,insertTime){
        let cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData;
        let minData = cacheData[0];
        let minDiff = Math.abs(time-minData.recieveTime);
        let minIndex =0;
        // console.log("找到最小值前："+cacheData.length);
        // console.log("---------------------------------------");
        //找到最小值
        for(let i=0;i<cacheData.length;i++){
            let diff = Math.abs(time-parseInt(cacheData[i].recieveTime));
            // let diff = time-cacheData[i].gpsTime-insertTime;
            // console.log(vid,cacheData.length,time,insertTime,cacheData[i].gpsTime,diff)
            console.log(vid,cacheData.length, time, parseInt(cacheData[i].recieveTime) , diff)
            if(diff<minDiff){
                minData = cacheData[i];
                minIndex = i;
            }

        }
        console.log("插值最小的索引"+minIndex);
        //打印出被舍弃的点
        /!*  let lostData = this.cacheAndInterpolateDataByVid[vid].cacheData.slice(0,minIndex+1);
         console.log(lostData)*!/
        /!* lostData.forEach(item=>{
             console.log("##"+item.vehicleId);
         })*!/
        //找到最小值后，将数据之前的数值清除
        this.cacheAndInterpolateDataByVid[vid].cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData.filter((item,index)=>{
            return index>minIndex;
        })
        // console.log("找到最小值后"+this.cacheAndInterpolateDataByVid[vid].cacheData.length);

        //返回距离标尺的最小插值的数据
        return minData;
    }*/
    destroyed() {
        clearInterval(this.processPlatformCarsTrackIntervalId);
    }
    moveCar(d) {
        let vid = d.vehicleId;
        let plateNo = d.plateNo;
        let carModel = this.models[vid];
        if (carModel == null) {

            var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 0.0);
            var heading = Cesium.Math.toRadians(0);
            var pitch = Cesium.Math.toRadians(0);
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
            //e.cesium.viewer.entities.add(entity);
            this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
                id: vid + "car",
                modelMatrix: modelMatrix,
                url: './static/map3d/model/car.glb',
                minimumPixelSize: 1,
                show: true,
                maximumScale: 300,
            }));
            this.models[vid] = vid;


            ////////////////////////
            let entityLabel = this.viewer.entities.add({
                id: vid + "lblpt",
                position: position,
                point: {
                    color: Cesium.Color.RED,    //点位颜色
                    pixelSize: 0              //像素点大小
                },
                label: {
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    text: "sdfsdf",
                    font: '14px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 20000, 0)
                }
            });


        } else {

            let carpt = null;
            var primitives = this.viewer.scene.primitives;
            var length = primitives.length;
            for (var k = 0; k < length; ++k) {
                var p = primitives.get(k);

                if (p.id == vid + "car") {
                    carpt = p;

                    break;
                }
            }
            if (carpt == null) return;
            var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 0.0);

            // console.log(d.longitude);
            var heading = Cesium.Math.toRadians(d.heading);
            var pitch = 0;
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            carpt.modelMatrix = orientation;

            let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carpt.modelMatrix)

            var carlabelpt = this.viewer.entities.getById(vid + "lblpt");
            carlabelpt.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,4);
            carlabelpt.label.text = plateNo;



        }
    }
    moveTo(d) {
        
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = -0.2369132859032279;
        var roll = 0.0029627735803421373;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);



        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 10),
            orientation: hpr
        });

        //     debugger
        //      if(!this.isload)
        //      {
        //     var heading = Cesium.Math.toRadians(70);
        //     var pitch = -0.2369132859032279;
        //     var roll = 0.0029627735803421373;
        //     var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        //     this.viewer.camera.flyTo({
        //       destination: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,0),
        //       orientation: hpr
        //     });

        //     this.isload=true;
        // }
        // else
        // {

        // }


        //     // viewer.trackedEntity = undefined;
        //     // viewer.scene.camera.flyTo(homeCameraView);

        //     // if(!this.isload)
        //     // {
        //         if((d.heading-this.x)>3)
        //         {
        //               var heading = Cesium.Math.toRadians(d.heading);
        //             var pitch = -0.2369132859032279;
        //             var roll =0.0029627735803421373;
        //             var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);



        //             this.viewer.camera.setView({
        //                 destination : Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,6),
        //                 orientation: hpr
        //             });


        //         }
        //         else
        //         {

        //         }

        //          let vid = d.vehicleId;
        //         var carlabelpt = this.viewer.entities.getById(vid + "labelpt");
        //         this.viewer.trackedEntity = carlabelpt; 
        //         this.x=d.heading;
        //         var property = new Cesium.SampledPositionProperty(); 

        //         carlabelpt.orientation=new Cesium.VelocityOrientationProperty(property);
        //     // this.isload=true;
        //     // }
        //     // else
        //     // {
        //         // let vid = d.vehicleId;
        //         // var carlabelpt = this.viewer.entities.getById(vid + "labelpt");
        //         // this.viewer.trackedEntity = carlabelpt; 
        //     // }




    }

}
export default ProcessCarTrack;