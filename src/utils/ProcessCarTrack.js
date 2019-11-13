class ProcessCarTrack {
    constructor() {
        this.view = null;
        // pCacheModelNum: 200,//感知车数量
        this.stepTime = 60;//处理车缓存时间
        this.recieveCount = 0;
        this.defualtZ = 0.8;
        this.pitch = 0;
        this.yaw = 0;
        this.roll = Math.PI * (10 / 90);
        this.pmodels = {};
        this.models = {};
        this.cacheTrackCarData = null,
            //按照vid缓存插值的小车轨迹
            this.cacheAndInterpolateDataByVid = {},
            this.cameraDefualtZ = 22.86,
            this.cameraDefualtRadius = 10,
            this.cameraDefualtPitch = -0.2,
            this.mainCarVID = "",
            this.isload = false,
            this.x = 0;
            this.processPlatformCarsTrackIntervalId=null;
    }

    //路口视角  平台车
    onCarMessage(data,flag) {
        this.cacheTrackCarData = data;
        this.thisMessage(flag);
    }
    platCarCapture(data,isCar){
        if (isCar == 0) {
            let data2 = data.result.vehDataDTO;
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                //缓存数据
                this.cachePlatformCar(pcar,data.result.vehDataStat);
            }
        }
        else {
            let data2 = data.result.data;
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                //缓存数据
                this.cachePlatformCar(pcar,null);
            }
            let datamain = data.result.selfVehInfo;
            if (datamain != null) {
                this.mainCarVID = datamain.vehicleId;
                this.cachePlatformCar(datamain,null);
            }
        }
    }
    thisMessage(isCar) {
        let data = this.cacheTrackCarData;
        if (isCar == 0) {
            let data2 = data.result.vehDataDTO;
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                //缓存数据
                this.cacheAndInterpolatePlatformCar(pcar,data.result.vehDataStat);
            }
        }
        else {
            let data2 = data.result.data;
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
    //缓存并且插值平台车轨迹
    cacheAndInterpolatePlatformCar(car,data) {
        let vid = car.vehicleId;
        let cdata = this.cacheAndInterpolateDataByVid[vid];

        if (cdata == null)//没有该车的数据
        {
            cdata = {
                cacheData: new Array(),
                intervalid: null,
                lastRecieveData: null,
                nowRecieveData: null,
                lastProcessData: null,
                nowProcessData: null,
                plateNo: null,
                data:data
            };
            let d = {
                vehicleId: vid,
                plateNo: car.plateNo,
                longitude: car.longitude,
                latitude: car.latitude,
                gpsTime: car.gpsTime,
                heading: car.heading
            };
            cdata.cacheData.push(d);
            cdata.lastRecieveData = d;
            cdata.nowRecieveData = d; 
            this.cacheAndInterpolateDataByVid[vid] = cdata;
        } else {//存在该车的数据

            let d = {
                vehicleId: vid,
                longitude: car.longitude,
                latitude: car.latitude,
                gpsTime: car.gpsTime,
                plateNo: car.plateNo,
                heading: car.heading
            };
            cdata.nowRecieveData = d;

            if (cdata.nowRecieveData.gpsTime < cdata.lastRecieveData.gpsTime && cdata.nowRecieveData.gpsTime == cdata.lastRecieveData.gpsTime) {
                console.log("到达顺序错误或重复数据");
                return;
            }

            let deltaTime = cdata.nowRecieveData.gpsTime - cdata.lastRecieveData.gpsTime;
            if (deltaTime <= this.stepTime) {
                cdata.cacheData.push(cdata.nowRecieveData);
            } else {

                //插值处理
                let deltaLon = cdata.nowRecieveData.longitude - cdata.lastRecieveData.longitude;
                let deltaLat = cdata.nowRecieveData.latitude - cdata.lastRecieveData.latitude;
                let steps = Math.ceil(deltaTime / this.stepTime);
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
        }
    }
    cachePlatformCar(pcar){
        let vid = pcar.vehicleId;
        let cdata = this.cacheAndInterpolateDataByVid[vid];

        let position = proj4(this.sourceProject, this.destinatePorject, [
            pcar.longitude,
            pcar.latitude
        ]);

        if(cdata==null)//没有该车的数据
        {
            cdata = {
                cacheData:new Array(),
                intervalid:null,
                lastRecieveData:null,
                nowRecieveData:null,
                lastProcessData:null,
                nowProcessData:null
            };
            let d = {
                vehicleId: vid,
                plateNo:pcar.plateNo,
                longitude: pcar.longitude,
                latitude: pcar.latitude,
                gpsTime: pcar.gpsTime,
                heading: pcar.heading,
            };
            cdata.cacheData.push(d);
            cdata.lastRecieveData = d;
            cdata.nowRecieveData = d;
            this.cacheAndInterpolateDataByVid[vid]=cdata;

            this.addModel(
                'testCar',
                "./static/map3d/map_photo/car.3DS",
                0,
                0,
                this.defualtZ
            );
        }else{//存在该车的数据

            this.models['testCar'].position.set(position[0], position[1], this.defualtZ);
            this.models['testCar'].rotation.set(
                this.pitch,
                this.yaw,
                (-Math.PI / 180) * pcar.heading
            );

            let d = {
                vehicleId: vid,
                longitude: pcar.longitude,
                latitude: pcar.latitude,
                gpsTime: pcar.gpsTime,
                heading: pcar.heading,
            };
            cdata.nowRecieveData = d;
            if(this.mainCarVID == d.vehicleId){
                this.moveCar(d);
            }else{
                this.moveCar2(d);
            }
        }
    }
    processPlatformCarsTrack(e) {
        this.view = e;
        let _this=this;
        // requestAnimationFrame(this.processPlatformCarsTrack);
        _this.processPlatformCarsTrackIntervalId = setInterval(() => {
            for (var vid in _this.cacheAndInterpolateDataByVid) {
                let carCacheData = _this.cacheAndInterpolateDataByVid[vid];
                if (carCacheData != null) {
                    if (carCacheData.cacheData.length > 0) {
                        //缓存数据
                        let cardata = _this.cacheAndInterpolateDataByVid[vid].cacheData.shift();
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
        }, _this.stepTime);//this.stepTime
    }
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
            this.view.scene.primitives.add(Cesium.Model.fromGltf({
                id: vid + "car",
                modelMatrix: modelMatrix,
                url: './static/model/car.glb',
                minimumPixelSize: 1,
                show: true,
                maximumScale: 5,
            }));
            this.models[vid] = vid;


            ////////////////////////
            let entityLabel = this.view.entities.add({
                id: vid + "labelpt",
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
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 2000, 0)
                }
            });


        } else {

            let carpt = null;
            var primitives = this.view.scene.primitives;
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

            var heading = Cesium.Math.toRadians(d.heading);
            var pitch = 0;
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            carpt.modelMatrix = orientation;

            let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carpt.modelMatrix)

            var carlabelpt = this.view.entities.getById(vid + "labelpt");
            carlabelpt.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,4);
            carlabelpt.label.text = plateNo;



        }
    }
    moveTo(d) {
        
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = -0.2369132859032279;
        var roll = 0.0029627735803421373;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);



        this.view.camera.setView({
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
        //     this.view.camera.flyTo({
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



        //             this.view.camera.setView({
        //                 destination : Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,6),
        //                 orientation: hpr
        //             });


        //         }
        //         else
        //         {

        //         }

        //          let vid = d.vehicleId;
        //         var carlabelpt = this.view.entities.getById(vid + "labelpt");
        //         this.view.trackedEntity = carlabelpt; 
        //         this.x=d.heading;
        //         var property = new Cesium.SampledPositionProperty(); 

        //         carlabelpt.orientation=new Cesium.VelocityOrientationProperty(property);
        //     // this.isload=true;
        //     // }
        //     // else
        //     // {
        //         // let vid = d.vehicleId;
        //         // var carlabelpt = this.view.entities.getById(vid + "labelpt");
        //         // this.view.trackedEntity = carlabelpt; 
        //     // }




    }

}
export default ProcessCarTrack;