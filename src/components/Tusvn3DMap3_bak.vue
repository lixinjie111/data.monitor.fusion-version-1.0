<template>
  <div>
    <div
            class="container"
            style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; "
    >
      <div id="dl-shp" style="width: 100%;height: 100%;"></div>
    </div>
  </div>
</template>
<script>
    import _ from "lodash";

    import * as myBox from "../utils/myBox";
    import { getMap } from "@/utils/tusvnMap.js";

    export default {
        name: "Tusvn3DMap2",
        props: [
            "targetId",
            "background",
            "navMode",
            "minX",
            "minY",
            "minZ",
            "maxX",
            "maxY",
            "maxZ",
            "z",
            "waitingtime"
        ],
        data() {
            return {
                viewVector1: { x: this.minX, y: this.minY, z: this.minZ },
                viewVector2: { x: this.maxX, y: this.maxY, z: this.maxZ },
                carColor: 0x80f77a,

                shps: {},
                models: {},
                staticmodels: {},
                infoLabels: { gan: {}, label: {} },
                deviceModels: {},
                mixCars: {},

                modelPersonArr: [],
                cacheModelNum: 200,
                interval: 1,
                count: 0,
                websocketUrl: "ws://192.168.1.68:9982/mon",
                hostWebsocket: null,
                tweens: {},

                mainCarVID: "B21E-00-024",
                carBusinessData: {},
                action: "track", //hostVehicle  track
                vehicleIds:
                    "B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020,B21E-00-021,B21E-00-022,B21E-00-023,B21E-00-024",
                defualtRadius: 100,
                defualtPitch: -0.8,
                defualtZ: this.z == undefined ? 20.5 : this.z,
                rcuId: "2046A1037E1F",

                cameraDefualtZ: 22.86,
                cameraDefualtRadius: 10,
                cameraDefualtPitch: -0.2,

                perceptionParams: null,
                lastPerceptionMessage: null,
                platformCars: null,
                cachePerceptionQueue: new Array(), //缓存感知数据
                processPerceptionDataIntervalId:null,
                processPerceptionInterval: 30, //处理缓存数据的间隔
                waitingProcessPerceptionTime: 0,
                lastPerceptionData: null,
                person: new THREE.MeshStandardMaterial({
                    color: 0xc4b17a,
                    roughness: 1,
                    metalness: 0,
                    opacity: 0.7,
                    transparent: true
                }),

                cacheTrackCarData: null,
                lasttime: 0,
                cacheMainCarTrackData: new Array(),
                lastMainCarData: null,
                lastMainCarData2: null,
                stepTime: 60,
                monitorTag: true,
                time2: 0, //微调移动车的时间间隔
                intervalIds: new Array(),

                //车辆监控
                cartrackwebsocketUrl: "ws://120.133.21.14:49982/mon",
                carid: "B21E-00-024",
                carTrackAction: "fusel_sider_veh", //fusel_sider_veh track
                // ,pmodels:{
                //     "2-2":new Array(),
                //     "2-1":new Array(),
                //     "1-1":new Array(),
                //     "1-2":new Array()
                // }//旁车模型
                pmodels: {},
                pCacheModelNum: 200,

                matStdObjects: new THREE.MeshStandardMaterial({
                    color: 0xef56e4,
                    roughness: 1,
                    metalness: 0,
                    opacity: 0.7,
                    transparent: true
                }),
                matStdObjects_in: new THREE.MeshStandardMaterial({
                    color: 0xef56e4,
                    roughness: 1,
                    metalness: 0,
                    opacity: 0.5,
                    transparent: true
                }),
                person: new THREE.MeshStandardMaterial({
                    color: 0xc4b17a,
                    roughness: 1,
                    metalness: 0,
                    opacity: 0.7,
                    transparent: true
                }),
                fontface: "宋体",
                fontSize: 60,

                pitch: 0,
                yaw: 0,
                roll: Math.PI * (10 / 90),
                tag: true,

                sourceProject: "EPSG:4326",
                // ,destinatePorject:"+proj=utm +zone=50 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"//北京
                destinatePorject:
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs", //上海
                timeA: 0,
                timeB: 0,
                //按照vid缓存插值的小车轨迹
                cacheAndInterpolateDataByVid:{},
                processPlatformCarsTrackIntervalId:null,
                cacheLightData: new Array()
            };
        },
        watch: {},
        methods: {
            initMap: function() {
                // dl.init({ doc: "dl-shp", background:"#000000", navMode: Pt.EarthControls });

                this.initView(
                    this.viewVector1.x,
                    this.viewVector1.y,
                    this.viewVector1.z,
                    this.viewVector2.x,
                    this.viewVector2.y,
                    this.viewVector2.z
                );

                setTimeout(() => {
                    getMap(this);
                    let lights=new Array();
                    let lightObj={
                        id:"276",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights.push(lightObj);
                    let lightObj2={
                        id:"275",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights.push(lightObj2);
                    this.addModel_light(121.17551589465815,31.281617738453047,25,lights)


                    let lights2=new Array();
                    let lightObj3={
                        id:"277",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights2.push(lightObj3);
                    let lightObj4={
                        id:"278",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights2.push(lightObj4);
                    this.addModel_light_y(121.17510881207043,31.281747510005268,25,lights2)
                    //this.addModel_light(121.17510881207043,31.281747510005268,30,lights2)


                    let lights3=new Array();
                    let lightObj5={
                        id:"282",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights3.push(lightObj5);
                    this.addModel_light_x(121.17533995826606,31.282071700494583,25,lights3)

                    //6路口
                    let lights6=new Array();
                    let lightObj6_1={
                        id:"274",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights6.push(lightObj6_1);
                    this.addModel_light_y(121.17073573444654,31.284232094641546,25,lights6)



                    let lights7=new Array();
                    let lightObj7_1={
                        id:"283",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights7.push(lightObj7_1);
                    this.addModel_light(121.17087729460859,31.28414862604421,25,lights7)

                    let lights8=new Array();
                    let lightObj8_1={
                        id:"273",
                        img1: "./static/images/light/left-red.png",
                        img2: "./static/images/light/2.png",
                        img3: "./static/images/light/6.png"
                    };
                    lights8.push(lightObj8_1);
                    this.addModel_light_y_6(121.17120509259806,31.284269933013952,25,lights8)

//this.add3DInfoLabel("1","1",121.17551589465815,31.281617738453047,25);
//this.removeModel("1");
                    this.$emit("mapcomplete", this);
                    // dl.viewer.controls.addEventListener("drop", this.onDrop);
                    // dl.viewer.addEventListener("camera_changed", this.onCameraChanged);
                }, 500);

                //处理缓存队列的数据
                //            console.log("this.waitingtime:"+this.waitingtime);
                if (this.waitingtime != null) {
                    this.waitingProcessPerceptionTime = this.waitingtime;
                }
                setTimeout(() => {
                    //                console.log("1处理感知车辆缓存队列中的数据"+this.cachePerceptionQueue.length);
                    this.processPerceptionData();
                }, this.waitingProcessPerceptionTime);

                // setTimeout(() => {
                //     //                console.log("开始执行小车平滑移动");
                //     let id3 = setInterval(() => {
                //         if (this.monitorTag) {
                //             // console.log("当前缓存数据量："+this.cacheMainCarTrackData.length);
                //             let d = this.cacheMainCarTrackData.shift();
                //             this.moveMainCar(d);
                //         }
                //     }, 2000);
                //     this.intervalIds.push(id3);
                // }, 6000);

                //插值后的平台车处理
                setTimeout(() => {
                    this.processPlatformCarsTrack();
                }, 0);

            },
            /**
             * 地图沿屏幕x,y,z方向移动
             * x,相对屏幕横方向移动距离,单位 米,可选,默认值 0.0
             * y,相对屏幕竖方向移动距离,单位 米,可选,默认值 0.0
             * z,相对屏幕外方向移动距离,单位 米,可选,默认值 0.0
             */
            move: function(x, y, z) {
                dl.translate({ viewer: dl.viewer, x: x, y: z, z: y });
            },
            onCameraChanged: function() {
                this.$emit("CameraChanged", this);
            },
            onDrop: function() {
                this.$emit("mousedrop", this);
            },
            /**
             * 坐标转换
             */
            coordinateTransfer: function(
                sourceProject,
                destinatePorject,
                longitude,
                latitude
            ) {
                let targetCoor = proj4(sourceProject, destinatePorject, [
                    longitude,
                    latitude
                ]);
                return targetCoor;
            },
            /**
             * 三维坐标转平面像素坐标
             */
            worldToScreen: function(x, y, z) {
                let point = new THREE.Vector3(x, y, z == undefined ? this.defualtZ : z);
                return dl.worldToScreen(point, dl.viewer);
            },

            /**
             * 获取三维视窗的二维地理范围
             */
            getExtent: function() {
                return dl.getExtent(dl.viewer);
            },
            /**
             *获取相机参数
             */
            getCamera: function() {
                let obj = {
                    x: dl.viewer.scene.view.position.x,
                    y: dl.viewer.scene.view.position.y,
                    z: dl.viewer.scene.view.position.z,
                    radius: dl.viewer.scene.view.radius,
                    pitch: dl.viewer.scene.view._pitch,
                    yaw: dl.viewer.scene.view.yaw
                };
                return obj;
            },
            initView: function(x1, y1, z1, x2, y2, z2) {
                let bbox = new THREE.Box3(
                    new THREE.Vector3(x1, y1, z1),
                    new THREE.Vector3(x2, y2, z2)
                );
                dl.initView(bbox, dl.viewer);
            },
            addModel: function(name, url, x, y, z) {
                let model = new dl.Model({ url: url });
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                dl.scene.add(model);
                this.models[name] = model;
            },
            addText: function(name, text, x, y, z) {
                var text1 = new dl.Text({
                    text: text,
                    fontsize:this.fontsize,
                    borderThickness: 0,
                    textColor: { r: 0, g: 0, b: 0, a: 1.0 }
                });
                dl.scene.add(text1);
                this.models[name] = text1;
            },
            removeModel: function(name) {
                debugger
                let m = this.getModel(name);
                if (m != null) {
                    try
                    {
                        dl.removeModel(m, dl.viewer);
                        delete this.models[name];
                    }
                    catch(err)
                    {

                    }
                }
            },
            addGeometry: function(geomModel) {
                dl.scene.add(geomModel);
            },
            getModel: function(id) {
                return this.models[id];
            },
            addStaticModel: function(name, url, x, y, z, pitch, yaw, roll) {
                let model = new dl.Model({
                    url: url
                    // ,scale:scale==null?[1,1,1]:scale
                    // scale:[5,5,5]
                });
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                // if(color!=null)
                // {
                //     model.setColor(color);
                // }
                // model.setColor("#ffffff");
                let pitch1 = pitch == null ? 0 : pitch;
                let yaw1 = yaw == null ? 0 : yaw;
                let roll1 = roll == null ? 0 : roll;
                model.rotation.set(pitch1, yaw1, roll1);

                dl.scene.add(model);
                this.staticmodels[name] = model;
            },
            addStaticModel1: function(name, url, x, y, z, pitch, yaw, roll) {
                let model = new dl.Model({
                    url: url
                    // ,scale:scale==null?[1,1,1]:scale
                    // scale:[5,5,5]
                });
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                // if(color!=null)
                // {
                //     model.setColor(color);
                // }
                // model.setColor("#ffffff");
                let pitch1 = pitch == null ? 0 : pitch;
                let yaw1 = yaw == null ? 0 : yaw;
                let roll1 = roll == null ? 0 : roll;
                model.rotation.set(pitch1, yaw1, roll1);

                // model.setScale([0.1,0.1,0.1]);

                dl.scene.add(model);
                this.staticmodels[name] = model;
            },
            addModel_light_x: function(x, y, z,cacheLightData) {
                this.cacheLightData.push(cacheLightData);
                let utm = this.coordinateTransfer(
                    "EPSG:4326",
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                    x,
                    y
                );
                x = utm[0];
                y = utm[1];
                for (var i = 0; i < cacheLightData.length; i++) {
                    var xrotation = 5 * i;
                    var geometry1 = new THREE.CircleGeometry(1, 32);
                    var texture = new THREE.TextureLoader().load(
                        cacheLightData[i].img1
                    );
                    var box_metal1 = new THREE.MeshBasicMaterial({
                        map: texture,
                        opacity: 1
                    });
                    var mesh1 = new THREE.Mesh(geometry1, box_metal1);
                    mesh1.position.x = x + xrotation;
                    mesh1.position.y = y;
                    mesh1.position.z = z;
                    mesh1.rotation.x = (-Math.PI / 180) * 90;
                    mesh1.rotation.z = (Math.PI / 180) * 180;

                    mesh1.rotation.y = (Math.PI / 180) * 180;

                    var geometry2 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture2 = new THREE.TextureLoader().load(
                        cacheLightData[i].img2
                    );
                    var box_metal2 = new THREE.MeshBasicMaterial({
                        map: texture2,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh2 = new THREE.Mesh(geometry2, box_metal2);
                    mesh2.position.x = x + 2 + xrotation;
                    mesh2.position.y = y;
                    mesh2.position.z = z;
                    mesh2.rotation.x = (-Math.PI / 180) * 90;
                    mesh2.rotation.z = (Math.PI / 180) * 180;

                    mesh2.rotation.y = (Math.PI / 180) * 180;

                    var geometry3 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture3 = new THREE.TextureLoader().load(
                        cacheLightData[i].img3
                    );
                    var box_metal3 = new THREE.MeshBasicMaterial({
                        map: texture3,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh3 = new THREE.Mesh(geometry3, box_metal3);
                    mesh3.position.x = x + 3 + xrotation;
                    mesh3.position.y = y;
                    mesh3.position.z = z;
                    mesh3.rotation.x = (-Math.PI / 180) * 90;
                    mesh3.rotation.z = (Math.PI / 180) * 180;

                    mesh3.rotation.y = (Math.PI / 180) * 180;

                    var group = new THREE.Group();
                    group.add(mesh1);
                    group.add(mesh2);
                    group.add(mesh3);




                    group.name = cacheLightData[i].id;

                    // group.rotation.y = (-Math.PI / 180) * 90;

                    dl.scene.add(group);
                }
            },
            addModel_light_y: function(x, y, z,cacheLightData) {
                this.cacheLightData.push(cacheLightData);
                let utm = this.coordinateTransfer(
                    "EPSG:4326",
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                    x,
                    y
                );
                x = utm[0];
                y = utm[1];
                for (var i = 0; i < cacheLightData.length; i++) {
                    var xrotation = 5 * i;
                    var geometry1 = new THREE.CircleGeometry(1, 32);
                    var texture = new THREE.TextureLoader().load(
                        cacheLightData[i].img1
                    );
                    var box_metal1 = new THREE.MeshBasicMaterial({
                        map: texture,
                        opacity: 1
                    });
                    var mesh1 = new THREE.Mesh(geometry1, box_metal1);
                    mesh1.position.y = y + xrotation;
                    mesh1.position.x = x;
                    mesh1.position.z = z;
                    mesh1.rotation.x = (-Math.PI / 180) * 90;
                    mesh1.rotation.z = (Math.PI / 180) * 180;

                    mesh1.rotation.y = (Math.PI / 180) * 90;

                    var geometry2 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture2 = new THREE.TextureLoader().load(
                        cacheLightData[i].img2
                    );
                    var box_metal2 = new THREE.MeshBasicMaterial({
                        map: texture2,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh2 = new THREE.Mesh(geometry2, box_metal2);
                    mesh2.position.y = y + 2 + xrotation;
                    mesh2.position.x = x;
                    mesh2.position.z = z;
                    mesh2.rotation.x = (-Math.PI / 180) * 90;
                    mesh2.rotation.z = (Math.PI / 180) * 180;

                    mesh2.rotation.y= (Math.PI / 180) * 90;

                    var geometry3 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture3 = new THREE.TextureLoader().load(
                        cacheLightData[i].img3
                    );
                    var box_metal3 = new THREE.MeshBasicMaterial({
                        map: texture3,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh3 = new THREE.Mesh(geometry3, box_metal3);
                    mesh3.position.y = y + 3 + xrotation;
                    mesh3.position.x = x;
                    mesh3.position.z = z;
                    mesh3.rotation.x = (-Math.PI / 180) * 90;
                    mesh3.rotation.z = (Math.PI / 180) * 180;

                    mesh3.rotation.y = (Math.PI / 180) * 90;

                    var group = new THREE.Group();
                    group.add(mesh1);
                    group.add(mesh2);
                    group.add(mesh3);
                    group.name = cacheLightData[i].id;
                    dl.scene.add(group);
                }
            },
            addModel_light_y_6: function(x, y, z,cacheLightData) {
                this.cacheLightData.push(cacheLightData);
                let utm = this.coordinateTransfer(
                    "EPSG:4326",
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                    x,
                    y
                );
                x = utm[0];
                y = utm[1];
                for (var i = 0; i < cacheLightData.length; i++) {
                    var xrotation = 5 * i;
                    var geometry1 = new THREE.CircleGeometry(1, 32);
                    var texture = new THREE.TextureLoader().load(
                        cacheLightData[i].img1
                    );
                    var box_metal1 = new THREE.MeshBasicMaterial({
                        map: texture,
                        opacity: 1
                    });
                    var mesh1 = new THREE.Mesh(geometry1, box_metal1);
                    mesh1.position.y = y + xrotation;
                    mesh1.position.x = x;
                    mesh1.position.z = z;
                    mesh1.rotation.x = (-Math.PI / 180) * 90;
                    mesh1.rotation.z = (Math.PI / 180) * 180;

                    mesh1.rotation.y = (-Math.PI / 180) * 90;

                    var geometry2 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture2 = new THREE.TextureLoader().load(
                        cacheLightData[i].img2
                    );
                    var box_metal2 = new THREE.MeshBasicMaterial({
                        map: texture2,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh2 = new THREE.Mesh(geometry2, box_metal2);
                    mesh2.position.y = y - 2 + xrotation;
                    mesh2.position.x = x;
                    mesh2.position.z = z;
                    mesh2.rotation.x = (-Math.PI / 180) * 90;
                    mesh2.rotation.z = (Math.PI / 180) * 180;

                    mesh2.rotation.y= (-Math.PI / 180) * 90;

                    var geometry3 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture3 = new THREE.TextureLoader().load(
                        cacheLightData[i].img3
                    );
                    var box_metal3 = new THREE.MeshBasicMaterial({
                        map: texture3,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh3 = new THREE.Mesh(geometry3, box_metal3);
                    mesh3.position.y = y- 3 + xrotation;
                    mesh3.position.x = x;
                    mesh3.position.z = z;
                    mesh3.rotation.x = (-Math.PI / 180) * 90;
                    mesh3.rotation.z = (Math.PI / 180) * 180;

                    mesh3.rotation.y = (-Math.PI / 180) * 90;

                    var group = new THREE.Group();
                    group.add(mesh1);
                    group.add(mesh2);
                    group.add(mesh3);
                    group.name = cacheLightData[i].id;
                    dl.scene.add(group);
                }
            },
            addModel_light: function(x, y, z,cacheLightData) {
                this.cacheLightData.push(cacheLightData);
//          var ligth = {
//              id: "1",
//              img1: "./static/images/single/000_03.png",
//              img2: "./static/images/single/2.png",
//              img3: "./static/images/single/000_16.png"
//          };
//          var ligth2 = {
//              id: "2",
//              img1: "./static/images/single/000_03.png",
//              img2: "./static/images/single/2.png",
//              img3: "./static/images/single/000_16.png"
//          };
//          this.cacheLightData.push(ligth);
//          this.cacheLightData.push(ligth2);

                //7
                // var img1= "./static/images/single/000_03.png";
                // var img2= "./static/images/single/2.png";
                // var img3="./static/images/single/000_16.png";
                let utm = this.coordinateTransfer(
                    "EPSG:4326",
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                    x,
                    y
                );
                x = utm[0];
                y = utm[1];
                for (var i = 0; i < cacheLightData.length; i++) {
                    var xrotation = 5 * i;
                    var geometry1 = new THREE.CircleGeometry(1, 32);
                    var texture = new THREE.TextureLoader().load(
                        cacheLightData[i].img1
                    );
                    var box_metal1 = new THREE.MeshBasicMaterial({
                        map: texture,
                        opacity: 1
                    });
                    var mesh1 = new THREE.Mesh(geometry1, box_metal1);
                    mesh1.position.x = x + xrotation;
                    mesh1.position.y = y;
                    mesh1.position.z = z;
                    mesh1.rotation.x = (-Math.PI / 180) * 90;
                    mesh1.rotation.z = (Math.PI / 180) * 180;
                    // mesh1.rotation.y = (Math.PI / 180) * 90;

                    var geometry2 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture2 = new THREE.TextureLoader().load(
                        cacheLightData[i].img2
                    );
                    var box_metal2 = new THREE.MeshBasicMaterial({
                        map: texture2,
                        transparent: true,
                        opacity: 1
                    });
                    box_metal2.alphaTest = 0.1;

                    var mesh2 = new THREE.Mesh(geometry2, box_metal2);
                    mesh2.position.x = x - 2 + xrotation;
                    mesh2.position.y = y;
                    mesh2.position.z = z;
                    mesh2.rotation.x = (-Math.PI / 180) * 90;
                    mesh2.rotation.z = (Math.PI / 180) * 180;
                    // mesh2.rotation.y = (Math.PI / 180) * 90;
                    var geometry3 = new THREE.PlaneBufferGeometry(0.8, 1.28, 0);
                    var texture3 = new THREE.TextureLoader().load(
                        cacheLightData[i].img3
                    );
                    var box_metal3 = new THREE.MeshBasicMaterial({
                        map: texture3,
                        transparent: true,
                        opacity: 1
                    });
                    var mesh3 = new THREE.Mesh(geometry3, box_metal3);
                    mesh3.position.x = x - 3 + xrotation;
                    mesh3.position.y = y;
                    mesh3.position.z = z;
                    mesh3.rotation.x = (-Math.PI / 180) * 90;
                    mesh3.rotation.z = (Math.PI / 180) * 180;
                    //mesh3.rotation.y = (Math.PI / 180) * 90;

                    var group = new THREE.Group();
                    group.add(mesh1);
                    group.add(mesh2);
                    group.add(mesh3);
                    group.name = cacheLightData[i].id;

                    dl.scene.add(group);
                }
            },
            addStaticModel_light_1: function(ligth) {

                /* var ligth = {
                     id: "1",
                     img1: "./static/images/single/000_03.png",
                     img2: "./static/images/single/2.png",
                     img3: "./static/images/single/000_16.png"
                 };*/
                for (var i = 0; i < this.cacheLightData.length; i++) {
                    for (var j = 0; j< this.cacheLightData[i].length; j++) {
                        if (this.cacheLightData[i][j].id == ligth.id) {
                            var object = dl.scene.getObjectByName(ligth.id);

                            if (object.children.length > 0) {
                                var texture = new THREE.TextureLoader().load(ligth.img1);
                                object.children[0].material.map = texture;
                            }

                            if (object.children.length > 1) {
                                var texture2 = new THREE.TextureLoader().load(ligth.img2);
                                object.children[1].material.map = texture2;
                            }
                            if (object.children.length > 2) {
                                var texture3 = new THREE.TextureLoader().load(ligth.img3);
                                object.children[2].material.map = texture3;
                            }
                        }
                    }
                }
            },
            addStaticModel_traffic_light: function(name, url, x, y, z, pitch, yaw, roll) {
                let model = new dl.Model({
                    url: url
                    // ,scale:scale==null?[1,1,1]:scale
                    // scale:[5,5,5]
                });
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                // if(color!=null)
                // {
                //     model.setColor(color);
                // }
                // model.setColor("#ffffff");
                let pitch1 = pitch == null ? 0 : pitch;
                let yaw1 = yaw == null ? 0 : yaw;
                let roll1 = roll == null ? 30 : roll;
                model.rotation.set(pitch1, yaw1, roll1);

                dl.scene.add(model);
                this.staticmodels[name] = model;
            },
            getStaticModel: function(id) {
                return this.staticmodels[id];
            },
            remove3DInforLabel: function(name) {
                let gan = this.infoLabels["gan"][name];
                let label = this.infoLabels["label"][name];
                if (gan != null) {
                    dl.removeModel(gan, dl.viewer);
                    delete this.infoLabels["gan"][name];
                }
                if (label != null) {
                    dl.removeModel(label, dl.viewer);
                    delete this.infoLabels["label"][name];
                }
            },
            add3DInfoLabel: function(name, text, x, y, z) {
                var cylinderGeo = new THREE.CylinderGeometry(0.05, 0.05,16, 0, 0);
                var cylinderMat = new THREE.MeshLambertMaterial({
                    //创建材料
                    color: 0xab6503,
                    wireframe: false
                });
                //创建圆柱体网格模型
                var cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);

                let utm = this.coordinateTransfer(
                    "EPSG:4326",
                    "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                    x,
                    y
                );

                cylinderMesh.position.set(utm[0], utm[1],z+8); //设置圆柱坐标
                cylinderMesh.rotation.x = Math.PI / 2;
                //cylinderMesh.position.set(utm[0], utm[1], z);

                //dl.scene.add(cylinderMesh);

                this.infoLabels["gan"][name] = cylinderMesh;

                var text1 = new dl.Text({
                    text: text,
                    fontsize: 200,
                    borderThickness: 1
                });
                text1.setBorderColor({ r: 171, g: 101, b: 3, a: 1.0 });
                text1.setBackgroundColor({ r: 255, g: 255, b: 255, a: 1 });
                text1.setTextColor({ r: 171, g: 101, b: 3, a: 1.0 });
                //text1.setPositon([326299.8136019115,3462328.443327571,34.16186920538662]);

                text1.setPositon([utm[0], utm[1], z + 16]);
                this.infoLabels["label"][name] = text1;

                var group = new THREE.Group();
                group.add(cylinderMesh);
                group.add(text1);
                group.name=name;
                dl.scene.add(group);

                this.models[name] = group;

                // text1.setPositon([x, y, z]);
                //  text1.fontface = this.fontface;
                // text1.update();
            },
            updateModelPostion: function(modelId, x, y, z, heading) {
                let model = this.models[modelId];
                if (model != null) {
                    model.position.x = x;
                    model.position.y = y;
                    model.position.z = z;
                    model.setHeading(heading);
                }
            },
            updateCameraPosition: function(x, y, z, radius, pitch, yaw) {
                dl.moveTo({
                    position: [x, y, z],
                    radius: 0.001,
                    yaw: yaw,
                    pitch: pitch,
                    viewer: dl.viewer
                });
            },
            animate: function(time) {
                // requestAnimationFrame(animate);
                // TWEEN.update(time);
            },
            update: function(e) {
                // console.log("=====================update====================================");
                // console.log(e)
                // model.position.x = lastUtmPosition.x;
                // model.position.y = lastUtmPosition.y;
                // model.setHeading(-Math.PI / 180 * (lastUtmPosition.rotation));
                // dl.moveTo({
                //         position: [lastUtmPosition.x+6,lastUtmPosition.y, 12.816],
                //         radius: 80,
                //         yaw: -Math.PI / 180 * (lastUtmPosition.rotation),
                //         pitch: -0.8
                // });
            },
            resetCamera: function() {
                this.updateCameraPosition(
                    442456.0905737311,
                    4427223.965503679,
                    60.22107514430958,
                    2.4329173138415072,
                    -0.6747685185185206,
                    -0.7853942219746017
                );
            },
            initWebsocket: function(url) {
                if ("WebSocket" in window) {
                    this.hostWebsocket = new WebSocket(url);
                    this.hostWebsocket.onmessage = this.onMessage;
                    this.hostWebsocket.onclose = this.onClose;
                    this.hostWebsocket.onopen = this.onOpen;
                    this.hostWebsocket.onerror = this.onError;
                } else {
                    console.log("该浏览器不支持WebSocket!");
                }
            },
            timetrans: function(timestamp) {
                var date = new Date(timestamp); //如果date为13位不需要乘1000
                var Y = date.getFullYear() + "-";
                var M =
                    (date.getMonth() + 1 < 10
                        ? "0" + (date.getMonth() + 1)
                        : date.getMonth() + 1) + "-";
                var D =
                    (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
                var h =
                    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
                var m =
                    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
                    ":";
                var s =
                    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                var ms = date.getMilliseconds();
                return Y + M + D + h + m + s + "." + ms;
            },

            setInterval: function(interval) {
                this.interval = interval;
                this.count = 0;
            },
            onMessage: function(data) {
                this.models = {};
                this.count++;
                if (this.count % this.interval != 0) {
                    return;
                }
                let rsuDatas = JSON.parse(data.data);
                var deviceid = null;
                if (rsuDatas.result.length > 0) {
                    var time = this.timetrans(rsuDatas.result[0].timestamp);
                    this.$emit("showTimeStamp", time);
                    deviceid = rsuDatas.result[0].deviceId;
                    if (this.deviceModels[deviceid] == null) {
                        this.deviceModels[deviceid] = { cars: [], persons: [], texts: [] };
                        for (let m = 0; m < this.cacheModelNum; m++) {
                            //车
                            //var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                            // var model1 = new THREE.Mesh(geoBox1, this.matStdObjects);

                            var model1 = myBox.addMyBox(0.4, 0.4, 1.7, this.carColor);

                            model1.position.set(0, 0, 0);
                            model1.rotation.set(this.pitch, this.yaw, this.roll);
                            model1.castShadow = true;
                            model1.receiveShadow = true;

                            dl.scene.add(model1);
                            this.deviceModels[deviceid].cars[m] = model1;

                            // var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                            var pmodel1 = new THREE.Mesh(pBox1, this.person);
                            var pmodel1 = myBox.addMyBox(0.4, 0.4, 1.7, this.carColor);

                            pmodel1.position.set(0, 0, 0);
                            pmodel1.rotation.set(0, 0, 0);
                            pmodel1.castShadow = true;
                            pmodel1.receiveShadow = true;

                            this.deviceModels[deviceid].persons[m] = pmodel1;
                            dl.scene.add(pmodel1);

                            var text1 = new dl.Text({
                                text: "11111",
                                fontsize: this.fontSize,
                                borderThickness: 0,
                                textColor: { r: 0, g: 0, b: 0, a: 1.0 }
                            });

                            this.deviceModels[deviceid].texts[m] = text1;
                            dl.scene.add(text1);
                            text1.setPositon([0, 0, 0]);
                            text1.fontface = this.fontface;
                            text1.update();
                        }
                    } else {
                        for (let p = 0; p < this.deviceModels[deviceid].cars.length; p++) {
                            let car = this.deviceModels[deviceid].cars[p];
                            car.position.x = 0;
                            car.position.y = 0;
                            car.position.z = 0;
                        }

                        for (let p = 0; p < this.deviceModels[deviceid].persons.length; p++) {
                            let person = this.deviceModels[deviceid].persons[p];
                            person.position.x = 0;
                            person.position.y = 0;
                            person.position.z = 0;
                        }

                        for (let p = 0; p < this.deviceModels[deviceid].texts.length; p++) {
                            var text1 = this.deviceModels[deviceid].texts[p];
                            text1.setPositon([0, 0, 0]);
                            text1.update();
                        }
                    }
                }
                for (let i = 0; i < rsuDatas.result.length; i++) {
                    let d = rsuDatas.result[i];
                    let dUTM = proj4(this.sourceProject, this.destinatePorject, [
                        d.target.longitude,
                        d.target.latitude
                    ]);

                    if (d.target.type == 0 || d.target.type == 1 || d.target.type == 3) {
                        if (i < this.deviceModels[deviceid].persons.length) {
                            let mdl = this.deviceModels[deviceid].persons[i];
                            mdl.position.x = dUTM[0];
                            mdl.position.y = dUTM[1];
                            mdl.position.z = this.defualtZ + 4;

                            let text = this.deviceModels[deviceid].texts[i];
                            text.setText(d.target.uuid.substr(0, 8));
                            text.setPositon([dUTM[0], dUTM[1], this.defualtZ + 5]);
                        }
                    } else {
                        if (i < this.deviceModels[deviceid].cars.length) {
                            let mdl = this.deviceModels[deviceid].cars[i];
                            mdl.position.x = dUTM[0];
                            mdl.position.y = dUTM[1];
                            mdl.position.z = this.defualtZ + 4;

                            let text = this.deviceModels[deviceid].texts[i];
                            text.setText(d.target.uuid.substr(0, 8));
                            text.setPositon([dUTM[0], dUTM[1], this.defualtZ + 6]);
                        }
                    }
                }
            },
            onPerceptionMessage: function(data) {
                //            console.log("=======================onPerceptionMessage===================");
                //            console.log(new Date().getTime());
                this.lastPerceptionMessage = data;
                var data2 = JSON.parse(data.data);
                if (data2.result.dataFlag == 1) {
                    this.platformCars = data2.result.vehDataDTO;
                }
                return;
                // this.models={};
                // this.count++;
                // if((this.count%this.interval)!=0)
                // {
                //     return;
                // }
            },
            addPerceptionData: function(data) {
                //     console.log("===========addPerceptionData=============");
                //     console.log(new Date().getTime());

                this.cachePerceptionQueue.push(data);
            },

            processPerceptionData: function() {
//      let timeA = new Date().getTime();
                this.processPerceptionDataIntervalId = setInterval(() => {
                    this.timeA = new Date().getTime();
                    //                console.log(this.timeA-this.timeB);
                    //                console.log("2处理感知车辆缓存队列中的数据:"+this.cachePerceptionQueue.length);
                    if (this.cachePerceptionQueue.length > 0) {
                        let data = this.cachePerceptionQueue.shift();
                        let length = 0;
                        if (data != null) {
                            this.lastPerceptionMessage = data;

                            var data2 = JSON.parse(data.data);
                            if (data2.result.dataFlag == 1) {
                                this.platformCars = data2.result.vehDataDTO;
                            }
                            let d2 = null;
                            let d2_vehDataStat = null;
                            try {
                                d2 = data2.result.vehDataDTO[0];
                                d2_vehDataStat=data2.result.vehDataStat;
                                length = data2.result.vehDataDTO.length;
                            } catch (e) {
//              console.log(data2.result);
                            }
                            if (d2 != null) {
                                // if(this.lastPerceptionData!=null&&d2.gpsTime<this.lastPerceptionData.gpsTime)
                                // {
                                //     return;
                                // }
                                let pcarnum = 0;
                                let persons = 0;
                                let zcarnum = 0;
                                for (let i = 0; i < length; i++) {
                                    let obj = data2.result.vehDataDTO[i];
                                    if (obj.type == 1) {
                                        zcarnum++;
                                        continue;
                                    }
                                    if (
                                        obj.targetType == 0 ||
                                        obj.targetType == 1 ||
                                        obj.targetType == 3
                                    ) {
                                        persons++;
                                    } else {
                                        pcarnum++;
                                    }
                                }
                                let nums =
                                    length +
                                    "=" +
                                    zcarnum +
                                    "(自车)+" +
                                    pcarnum +
                                    "(感知)+" +
                                    persons +
                                    "(人)";
                                let ss =
                                    this.timetrans(d2.gpsTime) +
                                    " 当前包数据条数：" +
                                    nums +
                                    "  缓存数:" +
                                    this.cachePerceptionQueue.length +
                                    "  最新数据时间：";
                                if (this.cachePerceptionQueue.length > 0) {
                                    let d3 = this.cachePerceptionQueue[
                                    this.cachePerceptionQueue.length - 1
                                        ];
                                    var data3 = JSON.parse(d3.data);

                                    let d4 = null;
                                    try {
                                        d4 = data3.result.vehDataDTO[0];
                                        ss += this.timetrans(d4.gpsTime);
                                    } catch (e) {
                                        //                                    console.log(data3.result);
                                        ss += "没有感知数据";
                                    }
                                } else {
                                    ss += this.timetrans(d2.gpsTime);
                                }

                                // this.$emit("processPerceptionDataTime",ss)
                                //不丢包
                                this.processPerceptionMesage();
                                this.processPlatformCars();
                                this.timeB = new Date().getTime();

                                let hs = this.timeB - this.timeA;

                                ss += "  耗时：" + hs;


                                this.$emit("processPerceptionDataTime", ss,d2.gpsTime,d2_vehDataStat);
//                                this.$emit("processDataTime",d2.gpsTime)
                                // if(this.lastPerceptionData!=null)
                                // {
                                //     this.processPerceptionInterval = d2.gpsTime- this.lastPerceptionData.gpsTime-(timeB-timeA);
                                // }else{
                                //     this.processPerceptionInterval = 1;
                                // }
                                // if(this.processPerceptionInterval<=0)
                                // {
                                //     this.processPerceptionInterval = 1;
                                // }
                                // if(this.processPerceptionInterval>1000)
                                // {
                                //     this.processPerceptionInterval=200;
                                // }

                                if (d2 != null) {
                                    this.lastPerceptionData = d2;
                                }
                                //                            console.log("处理间隔："+this.processPerceptionInterval);
                            }
                        }
                    }
                    //this.processPerceptionData();
                }, this.processPerceptionInterval); //
            },
            resetModels: function() {
                this.lastPerceptionMessage = null;
                for (var deviceid in this.deviceModels) {
                    for (let p = 0; p < this.deviceModels[deviceid].cars.length; p++) {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;
                    }
                    for (let p = 0; p < this.deviceModels[deviceid].persons.length; p++) {
                        let person = this.deviceModels[deviceid].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }
                }
            },
            processPlatformCars: function() {

                if (this.platformCars != null) {
                    for (let i = 0; i < this.platformCars.length; i++) {
                        //
                        let d = this.platformCars[i];
                        if (d.type == 1) {
                            //平台车
                            // this.animateCar2(d);
                            this.cacheAndInterpolatePlatformCar(d);
                        }
                    }
                }
            },
            processPerceptionMesage: function() {

                let data = null;
                if (this.lastPerceptionMessage == null) {
                    return;
                } else {
                    data = this.lastPerceptionMessage;
                }
                var data2 = JSON.parse(data.data);
                let fusionList = data2.result.vehDataDTO;
                // var deviceid = null;
                if (fusionList.length > 0) {
                    var deviceid = "0";
                    if (this.deviceModels[deviceid] == null) {
                        this.deviceModels[deviceid] = { cars: [], persons: [], texts: [] };
                        this.mixCars[deviceid] = { cars: [] };
                        for (let m = 0; m < this.cacheModelNum; m++) {
                            //车
                            // var geoBox1 = new THREE.BoxBufferGeometry(3.8, 1.6, 1.4);
                            // var model1 = new THREE.Mesh(geoBox1, this.matStdObjects);
                            //感知车
                            // var model1=myBox.addMyBox(3.8, 1.6, 1.4,0xbc2cb2);
                            var model1 = myBox.addMyBox(1.6, 3.8, 1.4, this.carColor);
                            model1.position.set(0, 0, 0);
                            model1.rotation.set(this.pitch, this.yaw, this.roll);
                            model1.castShadow = true;
                            model1.receiveShadow = true;

                            dl.scene.add(model1);
                            this.deviceModels[deviceid].cars[m] = model1;

                            var text1 = new dl.Text({
                                text: "",
                                fontsize: this.fontSize,
                                borderThickness: 0,
                                textColor: { r: 0, g: 0, b: 0, a: 1.0 }
                            });

                            this.deviceModels[deviceid].texts[m] = text1;
                            dl.scene.add(text1);

                            //行人

                            var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                            var pmodel1 = new THREE.Mesh(pBox1, this.person);
                            pmodel1.position.set(0, 0, 0);
                            pmodel1.rotation.set(0, 0, 0);
                            pmodel1.castShadow = true;
                            pmodel1.receiveShadow = true;

                            this.deviceModels[deviceid].persons[m] = pmodel1;
                            dl.scene.add(pmodel1);

                            //融合车辆
                            // var geoBox_out = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                            //var model_out = new THREE.Mesh(geoBox_out, this.matStdObjects);

                            var model_out = myBox.addMyBox(1.7, 4.6, 1.4, this.carColor);

                            //var geoBox_in = new THREE.BoxBufferGeometry(0.85, 2.3, 0.7);
                            // var model_in = new THREE.Mesh(geoBox_in, this.matStdObjects_in);

                            var model_in = myBox.addMyBox(0.85, 2.3, 0.7, this.carColor);

                            model_out.position.set(0, 0, 0);
                            model_out.rotation.set(this.pitch, this.yaw, this.roll);
                            model_out.castShadow = true;
                            model_out.receiveShadow = true;

                            model_in.position.set(0, 0, 0);
                            model_in.rotation.set(this.pitch, this.yaw, this.roll);
                            model_in.castShadow = true;
                            model_in.receiveShadow = true;

                            var mixCar = new THREE.Group();
                            mixCar.add(model_out);
                            mixCar.add(model_in);

                            dl.scene.add(mixCar);
                            this.mixCars[deviceid].cars[m] = mixCar;
                        }
                    } else {
                        for (let p = 0; p < this.deviceModels[deviceid].cars.length; p++) {
                            let car = this.deviceModels[deviceid].cars[p];
                            car.position.x = 0;
                            car.position.y = 0;
                            car.position.z = 0;
                        }
                        for (let q = 0; q < this.mixCars[deviceid].cars.length; q++) {
                            let mixCar = this.mixCars[deviceid].cars[q];
                            mixCar.position.x = 0;
                            mixCar.position.y = 0;
                            mixCar.position.z = 0;
                        }

                        for (let q = 0; q < this.deviceModels[deviceid].persons.length; q++) {
                            let person = this.deviceModels[deviceid].persons[q];
                            person.position.x = 0;
                            person.position.y = 0;
                            person.position.z = 0;
                        }
                        for (let q = 0; q < this.deviceModels[deviceid].texts.length; q++) {
                            let text = this.deviceModels[deviceid].texts[q];
                            text.position.x = 0;
                            text.position.y = 0;
                            text.position.z = 0;
                        }

                    }
                }

                for (let i = 0; i < fusionList.length; i++) {
                    let d = fusionList[i];

                    if (d.type == 1) {
                        //平台车
                        continue;
                    }

                    let dUTM = proj4(this.sourceProject, this.destinatePorject, [
                        d.longitude,
                        d.latitude
                    ]);
                    if (d.targetType == 0 || d.targetType == 1 || d.targetType == 3) {
                        if (i < this.deviceModels[deviceid].persons.length) {
                            let mdl = this.deviceModels[deviceid].persons[i];
                            mdl.position.x = dUTM[0];
                            mdl.position.y = dUTM[1];
                            mdl.position.z = this.defualtZ;
                            //test
                            //  let text = this.deviceModels[deviceid].texts[i];
                            //  text.setText(d.vehicleId.substr(0,8));
                            //  text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                            // let text1 = this.deviceModels[deviceid].texts[i];

                            //        text1.setPositon([dUTM[0],dUTM[1],this.defualtZ+2]);
                            //      text1.update()
                        }
                    } else {
                        if (i < this.deviceModels[deviceid].cars.length) {
                            if (d.fuselStatus == 0) {
                                let mdl = this.deviceModels[deviceid].cars[i];
                                mdl.position.x = dUTM[0];
                                mdl.position.y = dUTM[1];
                                mdl.position.z = this.defualtZ;
                                // mdl.rotation.set(
                                //   0,
                                //  0,
                                //    (Math.PI / 180.0) * (d.heading-180)
                                // );
                                mdl.rotation.set(
                                    0,
                                    0,
                                    -(Math.PI / 180.0) * (d.heading-180)

                                );
                                //         var axis = new THREE.Vector3(0,0,this.defualtZ);//向量axis
                                // mdl.rotateOnAxis(axis,(Math.PI / 180.0) * d.heading);//绕axis轴旋转π/8
                                //mdl.rotateZ((Math.PI / 180.0) * d.heading)

                                this.changeModelColor(d, mdl);
                            }

                            //  let text = this.deviceModels[deviceid].texts[i];
                            //  text.setText(d.vehicleId.substr(0,8));
                            //  text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                            let text1 = this.deviceModels[deviceid].texts[i];
                            let h = d.heading.toFixed(1);
                            let s = d.speed.toFixed(1);
                            text1.setText("[" + h + ", " + s + "]");
                            text1.setPositon([dUTM[0], dUTM[1], this.defualtZ + 2]);
                            text1.update();
                        }
                        if (i < this.mixCars[deviceid].cars.length) {
                            if (d.fuselStatus == 1) {
                                let mixCar = this.mixCars[deviceid].cars[i];
                                mixCar.position.x = dUTM[0];
                                mixCar.position.y = dUTM[1];
                                mixCar.position.z = this.defualtZ;
                                //mixCar.rotateZ((Math.PI / 180.0) * d.heading)

                                //               var axis = new THREE.Vector3(0,0,this.defualtZ);//向量axis
                                // mixCar.rotateOnAxis(axis,(Math.PI / 180.0) * d.heading);//绕axis轴旋转π/8
                                mixCar.rotation.set(
                                    0,
                                    0,
                                    -(Math.PI / 180.0) * (d.heading-180)
                                );
                            }
                        }
                    }
                }
            },
            onClose: function(data) {
                console.log("结束连接");
            },
            reset3DMap: function() {
                for (var key in this.deviceModels) {
                    for (let p = 0; p < this.deviceModels[key].cars.length; p++) {
                        let car = this.deviceModels[key].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;
                    }

                    for (let p = 0; p < this.deviceModels[key].persons.length; p++) {
                        let person = this.deviceModels[key].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }

                    for (let p = 0; p < this.deviceModels[key].texts.length; p++) {
                        var text1 = this.deviceModels[key].texts[p];
                        text1.setPositon([0, 0, 0]);
                        text1.update();
                    }
                }
                if ("WebSocket" in window) {
                    if (window.WebSocket) {
                        if (this.hostWebsocket != null) {
                            if (this.hostWebsocket.readyState == WebSocket.OPEN) {
                                //如果WebSocket是打开状态
                                this.hostWebsocket.close();
                            }
                        }
                        this.hostWebsocket = null;
                    }
                } else {
                    console.log("该浏览器不支持websocket");
                }
            },
            changeRcuId: function(url, rcuid) {
                this.websocketUrl = url;
                this.rcuId = rcuid;
                if ("WebSocket" in window) {
                    if (window.WebSocket) {
                        if (this.hostWebsocket != null) {
                            if (this.hostWebsocket.readyState == WebSocket.OPEN) {
                                //如果WebSocket是打开状态
                                this.hostWebsocket.close();
                            }
                        }
                        this.hostWebsocket = null;
                        this.hostWebsocket = new WebSocket(this.websocketUrl);
                        this.hostWebsocket.onmessage = this.onMessage;
                        this.hostWebsocket.onclose = this.onClose;
                        this.hostWebsocket.onopen = this.onOpen;
                        this.hostWebsocket.onerror = this.onError;
                    }
                } else {
                    console.log("该浏览器不支持websocket");
                }
            },
            changeRcuId2: function(url, params) {
                this.websocketUrl = url;
                // this.rcuId = rcuid;
                this.perceptionParams = params;
                this.deviceModels = {};
                if ("WebSocket" in window) {
                    if (window.WebSocket) {
                        if (this.hostWebsocket != null) {
                            if (this.hostWebsocket.readyState == WebSocket.OPEN) {
                                //如果WebSocket是打开状态
                                this.hostWebsocket.close();
                            }
                        }
                        this.hostWebsocket = null;
                        this.hostWebsocket = new WebSocket(this.websocketUrl);
                        this.hostWebsocket.onmessage = this.onPerceptionMessage;
                        this.hostWebsocket.onclose = this.onClose;
                        this.hostWebsocket.onopen = this.onOpen2;
                        this.hostWebsocket.onerror = this.onError;
                    }
                } else {
                    console.log("该浏览器不支持websocket");
                }
            },
            onOpen: function() {
                var hostVehicle = '{"action":"RCUPer","devId":"' + this.rcuId + '"}';
                this.sendMsg(hostVehicle);
            },
            onOpen2: function() {
                var params = this.perceptionParams;
                this.sendMsg(params);
            },
            sendMsg: function(msg) {
                if (window.WebSocket) {
                    if (this.hostWebsocket.readyState == WebSocket.OPEN) {
                        //如果WebSocket是打开状态
                        this.hostWebsocket.send(msg); //send()发送消息
                        console.log("已发送消息:" + msg);
                    }
                }
            },
            onError: function(e) {
                console.log(e);
            },
            //单车监控改变监控车辆
            changeMainCarId: function(url, carid) {
                this.cartrackwebsocketUrl = url;
                this.carid = carid;
                this.mainCarVID = carid;
                if ("WebSocket" in window) {
                    if (window.WebSocket) {
                        if (this.carTrackWebsocket != null) {
                            if (this.carTrackWebsocket.readyState == WebSocket.OPEN) {
                                //如果WebSocket是打开状态
                                this.carTrackWebsocket.close();
                            }
                        }
                        this.carTrackWebsocket = null;
                        this.carTrackWebsocket = new WebSocket(this.cartrackwebsocketUrl);
                        this.carTrackWebsocket.onmessage = this.onCarTrackMessage;
                        this.carTrackWebsocket.onclose = this.onCarTrackClose;
                        this.carTrackWebsocket.onopen = this.onCarTrackOpen;
                        this.carTrackWebsocket.onerror = this.onError;
                    }
                } else {
                    console.log("该浏览器不支持websocket");
                }
            },

            initCarTrackWebsocket: function(url) {
                if ("WebSocket" in window) {
                    this.carTrackWebsocket = new WebSocket(url);
                    this.carTrackWebsocket.onmessage = this.onCarTrackMessage;
                    this.carTrackWebsocket.onclose = this.onCarTrackClose;
                    this.carTrackWebsocket.onopen = this.onCarTrackOpen;
                    this.carTrackWebsocket.onerror = this.onError;
                } else {
                    console.log("该浏览器不支持WebSocket!");
                }
            },
            onCarTrackClose: function(data) {
                console.log("结束连接");
            },
            onCarTrackOpen: function() {
                console.log("建立连接");
                var hostVehicle = {
                    action: this.carTrackAction,
                    vehicleId: this.carid
                };
                var hostVehicleMsg = JSON.stringify(hostVehicle);
                this.senCarTrackdMsg(hostVehicleMsg);
            },
            senCarTrackdMsg: function(msg) {
                if (window.WebSocket) {
                    if (this.carTrackWebsocket.readyState == WebSocket.OPEN) {
                        //如果WebSocket是打开状态
                        this.carTrackWebsocket.send(msg); //send()发送消息
                        console.log("已发送消息:" + msg);
                    }
                }
            },
            onCarTrackMessage: function(data) {
                // console.log(data);
                // console.log("====================onCarTrackMessage===================");
                // let nowtime = new Date().getTime();
                // console.log(nowtime-this.lasttime);
                // this.lasttime = nowtime;
                this.cacheTrackCarData = data;
                this.processCarTrackMessage();
            },
            processCarTrackMessage: function() {
                // console.log("processCarTrackMessage:================>"+this.cacheMainCarTrackData.length);
                if (this.cacheTrackCarData == null) {
                    return;
                }
                let data = this.cacheTrackCarData;
                let json = JSON.parse(data.data);
                // console.log(json);
                //处理旁车信息
                let pcars = json.result.data;
                if (pcars != null) {

                    if (Object.getOwnPropertyNames(this.pmodels).length==1) {
                        // if (this.pmodels.length == 0) {
                        for (let m = 0; m < this.pCacheModelNum; m++) {
                            let mesh1 = new THREE.MeshStandardMaterial({
                                color: 0xab6604,
                                roughness: 1,
                                metalness: 0,
                                opacity: 0.7,
                                transparent: true
                            });
                            // var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                            //var model1 = new THREE.Mesh(geoBox1, mesh1);
                            var model1 = myBox.addMyBox(1.7, 4.6, 1.4, this.carColor);

                            model1.position.set(0, 0, this.defualtZ);
                            model1.rotation.set(this.pitch, this.yaw, this.roll);
                            model1.castShadow = true;
                            model1.receiveShadow = true;
                            dl.scene.add(model1);
                            // this.pmodels.push(model1);
                            this.pmodels["gzc"+m]=model1;
                        }
                    }
                    for (let i = 0; i < this.pCacheModelNum; i++) {
                        let model = this.pmodels["gzc"+i];
                        model.position.set(0, 0, this.defualtZ);
                    }

                    for (let n = 0; n < pcars.length; n++) {
                        let pcar = pcars[n];
                        if (pcar.type != 1) {
                            let dUTM = proj4(this.sourceProject, this.destinatePorject, [
                                pcar.longitude,
                                pcar.latitude
                            ]);
                            let model = this.pmodels["gzc"+n];
                            model.position.set(dUTM[0], dUTM[1], this.defualtZ);
                            model.rotation.set(
                                this.pitch,
                                this.yaw,
                                (-Math.PI / 180) * pcar.heading
                            );
                            // this.changeModelColor(pcar, model);
                        } else {
                            //type=1  平台注册的车
                            // this.animateCar(pcar);
                            //缓存数据
                            this.cacheAndInterpolatePlatformCar(pcar);
                        }
                    }
                }
                // return ;
                //处理自车信息
                let data2 = json.result.selfVehInfo;

                if (data2 != null) {
                    this.mainCarVID = data2.vehicleId;
                    this.cacheAndInterpolatePlatformCar(data2);
                    return;
                    // console.log(data2);
                    // data2.gpsTime = new Date().getTime();
                    // this.animateCar(data2);
                    if (data2.vehicleId == this.mainCarVID) {
                        // console.log(this.cacheMainCarTrackData.length);
                        // this.cacheMainCarTrackData.push(data2);
                        // if(this.cacheMainCarTrackData.length<=2)
                        // {
                        //     let data3 = this.cacheMainCarTrackData.shift();
                        //     this.animateCar3(data3);
                        // }
                        //
                        if (this.cacheMainCarTrackData.length == 0) {
                            this.cacheMainCarTrackData.push(data2);
                        } else {
                            if (data2.gpsTime <= this.lastMainCarData.gpsTime) {
                                return;
                            }
                            let deltaTime = data2.gpsTime - this.lastMainCarData.gpsTime;
                            if (deltaTime <= this.stepTime) {
                                this.cacheMainCarTrackData.push(data2);
                            } else {
                                //插值处理
                                let deltaLon = data2.longitude - this.lastMainCarData.longitude;
                                let deltaLat = data2.latitude - this.lastMainCarData.latitude;
                                let steps = Math.ceil(deltaTime / this.stepTime);
                                let timeStep = deltaTime / steps;
                                let lonStep = deltaLon / steps;
                                let latStep = deltaLat / steps;
                                for (let i = 1; i <= steps; i++) {
                                    let d = {};
                                    d.longitude = this.lastMainCarData.longitude + lonStep * i;
                                    d.latitude = this.lastMainCarData.latitude + latStep * i;
                                    d.gpsTime = this.lastMainCarData.gpsTime + timeStep * i;
                                    d.heading = data2.heading;
                                    d.vehicleId = data2.vehicleId;

                                    this.cacheMainCarTrackData.push(d);
                                }
                            }
                        }
                        this.lastMainCarData = data2;
                    } else {
                        // this.animateCar(data2);
                    }
                }
            },
            //缓存并且插值平台车轨迹
            cacheAndInterpolatePlatformCar:function(pcar){
                let vid = pcar.vehicleId;
                let cdata = this.cacheAndInterpolateDataByVid[vid];
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
                        longitude: pcar.longitude,
                        latitude: pcar.latitude,
                        gpsTime: pcar.gpsTime,
                        heading: pcar.heading,
                    };
                    cdata.cacheData.push(d);
                    cdata.lastRecieveData = d;
                    cdata.nowRecieveData = d;
                    this.cacheAndInterpolateDataByVid[vid]=cdata;
                }else{//存在该车的数据
                    let d = {
                        vehicleId: vid,
                        longitude: pcar.longitude,
                        latitude: pcar.latitude,
                        gpsTime: pcar.gpsTime,
                        heading: pcar.heading,
                    };
                    cdata.nowRecieveData = d;

                    if (cdata.nowRecieveData.gpsTime < cdata.lastRecieveData.gpsTime) {
                        console.log("到达顺序错误");
                        return;
                    }
                    let deltaTime = cdata.nowRecieveData.gpsTime - cdata.lastRecieveData.gpsTime;
                    if (deltaTime <= this.stepTime) {
                        cdata.cacheData.push(cdata.nowRecieveData);
                    } else {
                        //插值处理
                        let deltaLon =  cdata.nowRecieveData.longitude -  cdata.lastRecieveData.longitude;
                        let deltaLat =  cdata.nowRecieveData.latitude -  cdata.lastRecieveData.latitude;
                        let steps =  Math.ceil(deltaTime / this.stepTime);
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
                            cdata.cacheData.push(d2);
                        }
                    }
                    cdata.lastRecieveData=cdata.nowRecieveData;
                }
            },
            processPlatformCarsTrack:function(){
                this.processPlatformCarsTrackIntervalId=setInterval(() => {
                    for(var vid in this.cacheAndInterpolateDataByVid)
                    {
                        let carCacheData = this.cacheAndInterpolateDataByVid[vid];
                        if(carCacheData!=null)
                        {
                            if(carCacheData.cacheData.length>0)
                            {
                                let cardata = this.cacheAndInterpolateDataByVid[vid].cacheData.shift();
                                if(this.mainCarVID == cardata.vehicleId)
                                {
                                    this.moveCar(cardata);
                                }else{
                                    this.moveCar2(cardata);
                                }

                            }
                        }
                    }
                }, this.stepTime);//this.stepTime
            },

            moveMainCar: function(data) {
                // console.log(
                //   "当前缓存数据量moveMainCar：" + this.cacheMainCarTrackData.length
                // );
                if (data == null) {
                    return;
                }
                let a = new Date().getTime();
                if (this.lastMainCarData2 == null) {
                    this.lastMainCarData2 = data;
                    return;
                } else {
                    let time = Math.floor(data.gpsTime - this.lastMainCarData2.gpsTime);

                    setTimeout(
                        () => {
                            this.moveCar(data);
                            this.lastMainCarData2 = data;

                            let b = new Date().getTime();
                            // temptime = temptime - (b-a);
                            this.time2 = b - a;

                            let d = this.cacheMainCarTrackData.shift();
                            if (d != null) {
                                this.moveMainCar(d);
                            }
                            if (this.cacheMainCarTrackData.length > 0) {
                                this.monitorTag = false;
                            } else {
                                this.monitorTag = true;
                            }

                            console.log("time:" + time);
                            console.log("time2:" + this.time2);
                            console.log(time - this.time2);
                        },
                        time - this.time2 <= 0 ? 1 : time - this.time2
                    ); //time-this.time2
                }
            },
            moveCar: function(data) {
                let vid = data.vehicleId;
                let carModel = this.models[vid];
                let position = proj4(this.sourceProject, this.destinatePorject, [
                    data.longitude,
                    data.latitude
                ]);
                if (carModel == null) {
                    this.addModel(
                        vid,
                        "./static/map3d/map_photo/car.3DS",
                        position[0],
                        position[1],
                        this.defualtZ
                    );

                } else {
                    this.models[vid].position.set(position[0], position[1], this.defualtZ);
                    this.models[vid].rotation.set(
                        this.pitch,
                        this.yaw,
                        (-Math.PI / 180) * data.heading
                    );


                }

                dl.moveTo({
                    position: [position[0], position[1], this.cameraDefualtZ],
                    radius: this.cameraDefualtRadius + 10,
                    yaw: (-Math.PI / 180) * data.heading,
                    pitch: this.cameraDefualtPitch
                });
            },
            moveCar2: function(data) {
                let vid = data.vehicleId;
                let carModel = this.models[vid];
                let position = proj4(this.sourceProject, this.destinatePorject, [
                    data.longitude,
                    data.latitude
                ]);
                if (carModel == null) {
                    this.addModel(
                        vid,
                        "./static/map3d/map_photo/car.3DS",
                        position[0],
                        position[1],
                        this.defualtZ
                    );

                    ///ceshi
                    this.addText(vid+"text",vid,position[0],
                        position[1],
                        this.defualtZ)


                } else {
                    this.models[vid].position.set(position[0], position[1], this.defualtZ);
                    this.models[vid].rotation.set(
                        this.pitch,
                        this.yaw,
                        (-Math.PI / 180) * data.heading
                    );


                    ////////////ceshi
                    this.models[vid+"text"].position.set(position[0], position[1], this.defualtZ+2);
                    this.models[vid+"text"].rotation.set(
                        this.pitch,
                        this.yaw,
                        (-Math.PI / 180) * data.heading
                    );
                }
            },
            changeModelColor: function(data, model) {
                //ef56e4
                if (model.type != "Group") {
                    if (data.fuselType == 2 && data.fuselLevel == 1) {
                        model.material.color.setStyle("#ffbf64");
                    }
                    if (data.fuselType == 2 && data.fuselLevel == 2) {
                        model.material.color.setStyle("#ab6604");
                    }
                    if (data.fuselType == 1 && data.fuselLevel == 1) {
                        model.material.color.setStyle("#a257d1");
                    }
                    if (data.fuselType == 1 && data.fuselLevel == 2) {
                        model.material.color.setStyle("#651399");
                    }
                    model.material.color.setStyle("#bc2cb2");
                }
            },
            pageResize() {
                const borwserHeight =
                    window.innerHeight ||
                    document.documentElement.clientHeight ||
                    document.body.clientHeight;
                this.pageHeight = borwserHeight - 64;
                // console.log('pageHeight : ' + this.pageHeight)
            },
            resize: function(size) {},
            /**
             * 初始化shp数据
             */
            initShp: function() {
                this.addShape(
                    "road_boundary",
                    "./static/map3d/dl_shcsq_zc/road_boundary.shp",
                    "#ffffff"
                );
                this.addShape(
                    "intersection",
                    "./static/map3d/dl_shcsq_zc/Intersection.shp",
                    "#351906"
                );
                this.addShape(
                    "Crosswalk",
                    "./static/map3d/dl_shcsq_zc/Crosswalk.shp",
                    "#023c2d"
                );
                this.addShape(
                    "lane_marking",
                    "./static/map3d/dl_shcsq_zc/Lane_marking.shp",
                    dl.styles.lane_marking.color
                );
                this.addShape(
                    "lane_arrow",
                    "./static/map3d/dl_shcsq_zc/Direction_arrow.shp",
                    "#06c2ff"
                );
                this.addShape(
                    "lane_boundary",
                    "./static/map3d/dl_shcsq_zc/Lane_boundary.shp",
                    "#fefefe"
                );
                this.addShape(
                    "lane_centerline",
                    "./static/map3d/dl_shcsq_zc/Lane_centerline.shp",
                    "#153641"
                );
            },
            /**
             * name:矢量数据的名字 可选
             * url:矢量数据的url路径 必须
             * color:矢量数据的颜色类型，默认是 #fff，数据接受多种类型，比如 "rgb(255, 0, 0)"、"hsl(0, 100%, 50%)"、'#ff0000' 可选
             */
            addShape: function(name, url, color) {
                let shp = new dl.Shape({
                    url: url,
                    name: name,
                    color: color == null ? "#fff" : color
                });
                dl.scene.add(shp);
            },
            addShape1:function(name,url,color,width,size,visible,map,proj,z){
                let shp = new dl.Shape({
                    url: url,
                    name: name,
                    color: color==null?"#fff":color,
                    width: width==null?1.0:width,
                    size: size==null?6.0:size,
                    visible: visible==null?true:visible,
                    map: map==null?null:map,
                    proj: proj,
                    z:z
                });
                dl.scene.add(shp);

                this.shps[name]=shp;
            }
            // addStaticModel: function(dl, name, url, x, y, z, pitch, yaw, roll) {
            //   let model = new dl.Model({
            //     url: url
            //     // ,scale:scale==null?[1,1,1]:scale
            //     // scale:[5,5,5]
            //   });
            //   model.position.x = x;
            //   model.position.y = y;
            //   model.position.z = z;
            //   // if(color!=null)
            //   // {
            //   //     model.setColor(color);
            //   // }
            //   // model.setColor("#ffffff");
            //   let pitch1 = pitch == null ? 0 : pitch;
            //   let yaw1 = yaw == null ? 0 : yaw;
            //   let roll1 = roll == null ? 0 : roll;
            //   model.rotation.set(pitch1, yaw1, roll1);
            //   dl.scene.add(model);
            // },
        },
        created() {},
        mounted() {
            this.pageResize();
            window.onresize = () => {
                this.pageResize();
            };

            dl.init({
                doc: "dl-shp",
                background: "#8c8c8c",
                navMode: Pt.EarthControls
            });
            // //初始化地图
            setTimeout(() => {
                this.initMap();
            }, 1000);
        },
        destroyed() {
            if ("WebSocket" in window) {
                if (window.WebSocket) {
                    if (this.carTrackWebsocket != null) {
                        if (this.carTrackWebsocket.readyState == WebSocket.OPEN) {
                            //如果WebSocket是打开状态
                            this.carTrackWebsocket.close();
                        }
                    }
                    this.carTrackWebsocket = null;
                }
            } else {
                console.log("该浏览器不支持websocket");
            }
            this.cacheMainCarTrackData = new Array();
            for (let i = 0; i < this.intervalIds.length; i++) {
                clearInterval(this.intervalIds[i]);
            }
            this.intervalIds = new Array();

            if(this.processPlatformCarsTrackIntervalId!=null)
            {
                clearInterval(this.processPlatformCarsTrackIntervalId);
                this.processPlatformCarsTrackIntervalId=null;
            }

            this.cacheAndInterpolateDataByVid = {};

            if(this.processPerceptionDataIntervalId!=null)
            {
                clearInterval(this.processPerceptionDataIntervalId);
                this.processPerceptionDataIntervalId=null;
            }
            this.cachePerceptionQueue = new Array();
        }
    };
</script>
<style>
  #map {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
  }
  canvas {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
