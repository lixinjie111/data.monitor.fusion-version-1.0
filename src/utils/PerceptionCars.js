class PerceptionCars {
    constructor() {
        this.defualtZ = 3;
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
    }

    //接受数据
    addPerceptionData(data) {
        //  console.log(11);
        // this.cachePerceptionQueue.push(data);
        // this.cachePerceptionQueue= new Array();
        // this.cachePerceptionQueue.push(data);
        this.processPerceptionMesage(data);
    }
    //绘制感知车
    processPerceptionMesage(data) {

        let _this = this;

        // _this.processPerceptionDataIntervalId = setInterval(() => {
        if (_this.deviceModels == undefined) return;
        // let l=Object.getOwnPropertyNames(_this.deviceModels.cars).length;
        // console.log(l)
        // requestAnimationFrame(PerceptionCars.processPerceptionMesage);
        // if (_this.cachePerceptionQueue == null)
        //   return;
        // if (_this.cachePerceptionQueue.length == 0)
        //   return;
        //   _this.lastPerceptionMessage = _this.cachePerceptionQueue.shift();
        // let data = null;
        // if (_this.lastPerceptionMessage == null) {
        //   return;
        // } else {
        //   data = _this.lastPerceptionMessage;
        // }
        if (data == null) return;
        var data2 = JSON.parse(data.data);
        // var data2 = JSON.parse(data);
        let fusionList = data2.result.vehDataDTO;
        // for(var i=0;i<1000;i++)
        // {

        //     var xy=fusionList[0];
        //    xy.latitude=fusionList[0].latitude+0.000001*i;
        //     xy.longitude=fusionList[0].longitude+0.000001*i;
        //     fusionList.push(xy)
        // }


        let count = 0;
        //复位感知车
        if (fusionList.length > 0) {
            var primitives = _this.viewer.scene.primitives;
            for (var i = 0; i < primitives.length; i++) {
                var primitive = primitives.get(i);

                let isTrue = false;
                for (var kk = 0; kk < fusionList.length; kk++) {
                    if (primitive instanceof Cesium.Model && (primitive.id != fusionList[kk].vehicleId + "car")) {
                        isTrue = true;
                        continue;
                    }
                }
                if (isTrue) {
                    primitive.show = false;
                    count++;
                }
            }
            if ((count - fusionList.length) >= 20) {
                this.removeModelPrimitives();
            }
            console.log(fusionList.length + "show" + count)
            // var primitives = this.viewer.scene.primitives;
            // var length = primitives.length;

            // for (var k = 0; k < length; ++k) {
            //   var p = primitives.get(k);
            //   if (p.id == undefined) continue;
            //   if (p.id.search("model") != -1) {
            //     p.show = false;
            //   }
            // }

            // var entities = this.viewer.entities;//  .getById(i + "label");
            // var enlength = entities.values.length;
            // for (var k = 0; k < enlength; ++k) {
            //   var lbl = entities.values[k];
            //   if (lbl.id == undefined) continue;
            //   if (lbl.id.search("label") != -1) {
            //     lbl.show = false;
            //   }
            // }
            // for (var k = 0; k < length; ++k) {
            //   var p = primitives.get(k);
            //   if (p.id == undefined) continue;
            //   if (p.id.search("person") != -1) {
            //     p.show = false;
            //   }
            // }

            // for (let p = 0; p < this.deviceModels.cars.length; p++) {
            //   let carmodel = this.viewer.entities.getById(p + "model");
            //   var position = Cesium.Cartesian3.fromDegrees(-1000, -1000, 0.0);
            //   carmodel.position = position;
            // }

            // for (let q = 0; q < this.deviceModels.persons.length; q++) {
            //     let person = this.deviceModels.persons[q];
            //     person.position.x = 0;
            //     person.position.y = 0;
            //     person.position.z = 0;
            // }
            // for (let q = 0; q < this.deviceModels.texts.length; q++) {
            //     let text = this.deviceModels.texts[q];
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
            if (d.targetType == 0 || d.targetType == 1 || d.targetType == 3) {
                if (i < this.deviceModels.persons.length) {
                    this.moveModel(d, i, "person");
                }
            } else {
                // console.log(d.vehicleId)
                let carModel = this.getModelForPrimitive(d.vehicleId + "car");//this.deviceModels.cars[d.vehicleId+"car"];
                if (carModel == null) {
                    let modelShow = this.getShowModelPrimitive();
                    if (modelShow != null) {
                        this.moveModel(modelShow, d);
                    } else {
                        //初始化增加车辆
                        this.addModeCar(d);
                    }



                }
                else {
                    this.moveModel(carModel, d);
                }

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
        // },0); //
    }
    addModeCar(d)
    {
        var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        //判断如果等或者大于360度，设置红色
        if (d.heading >= 360) {
            carmodel.color = Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1));
        }
        let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)

        let model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
            id: d.vehicleId + "car",
            modelMatrix: modelMatrix,
            url: './static/model/carbox.glb',
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
    removeModelPrimitives() {
        var primitives = this.viewer.scene.primitives;
        for (var i = 0; i < primitives.length; i++) {
            var primitive = primitives.get(i);
            if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search("car") != -1) {
                this.viewer.scene.primitives.remove(primitive);
            }
        }
    }
    //获取没有显示的模型
    getShowModelPrimitive() {
        var primitives = this.viewer.scene.primitives;
        for (var i = 0; i < primitives.length; i++) {
            var primitive = primitives.get(i);
            if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search("car") != -1) {
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
    moveModel(carmodel, d) {
        var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        //carmodel.orientation = orientation;
        carmodel.modelMatrix = orientation;
        carmodel.show = true;
        carmodel.id = d.vehicleId + "car";
        //判断如果等或者大于360度，设置红色
        if (d.heading >= 360) {
            carmodel.color = Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1));
        }
        let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
        Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carmodel.modelMatrix)

        // var carlabel = this.viewer.entities.getById(i + "label");
        // carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 5);
        // let h = d.heading.toFixed(1);
        // let s = d.speed.toFixed(1);
        // carlabel.show = true;
        // carlabel.label.text = "[" + h + ", " + s + "]";
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
            var entity = Cesium.Model.fromGltf({
                id: m + "model",
                modelMatrix: modelMatrix,
                url: './static/model/carbox.glb',
                minimumPixelSize: 1,
                show: false,
                maximumScale: 5,
                color: Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE, parseFloat(1)),
                // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
                colorBlendMode: Cesium.ColorBlendMode.Mix
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
                label: {
                    text: "",
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    font: '12px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 2000, 0)
                }
            });

            if (m <= 50) {
                ////////////////////////////////
                var entityPersons = Cesium.Model.fromGltf({
                    id: m + "person",
                    modelMatrix: modelMatrix,
                    url: './static/model/person.glb',
                    minimumPixelSize: 1,
                    show: false,
                    maximumScale: 5,
                    color: Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE, parseFloat(1)),
                    // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
                    // colorBlendMode : Cesium.ColorBlendMode.Mix
                    // ,
                    scale: 0.5   //放大倍数
                    // debugWireframe:true
                })

                this.deviceModels[deviceid].persons[m] = entityPersons;
                //e.cesium.viewer.entities.add(entity);
                e.scene.primitives.add(entityPersons);
            }

        }
        this.processPerceptionMesage();
        this.viewer = e;
    }
}
export default PerceptionCars