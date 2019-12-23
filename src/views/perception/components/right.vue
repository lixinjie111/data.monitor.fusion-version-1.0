<template>
    <div class="fusion-right-style" id="fusionRight">
        <!--<div style="position: absolute;top: 200px;right: 500px;z-index: 5;color: red;cursor: pointer" @click="shutDown">关闭</div>-->
        <!--<div style="position: absolute;top: 300px;right: 500px;z-index: 5;color: red;cursor: pointer" @click="open">开启</div>-->
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap(0)" v-show="param==-1"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap(-1)" v-show="param!=-1&&mapShow"/>
        <div class="c-pulse-time map-time" v-show="isShow=='true'">{{statisticData}}</div>
        <div class="c-pulse-time">{{processDataTime|dateFormat}} </div>
        <div class="video-style">
            <div v-for="(item,index) in camList"  v-if="camList.length>0" :class="[item.magnify?'magnify-style':'video-position']">
                <div class="style">
                    <div class="video-mask" @click="screenMagnify(item)"></div>
                    <live-player
                            :requestVideoUrl="requestVideoUrl"
                            :params="item.params"
                            type="flvUrl"
                            :autoplay="false"
                            :ref="'player'+index"
                    >
                        <div class="video-num" @click="changeMap(index)">
                            <span class="device-num">摄像头编号:{{item.devId}}</span>
                            <span class="active-circle" :class="{'active-style':isActive==index}"></span>
                            <span>{{item.rsPtName}}</span>
                        </div>
                        <!--<a class="title" href="javascript:;" @click="jumpLink">路测点：{{params.serialNum}}</a>-->
                    </live-player>
                </div>
            </div>
            <div v-for="item in new Array(2)" class="video-position style" v-if="camList.length==0">
                <div class="c-video-16-9 ">
                    <div class="video-tip">
                        暂无数据
                    </div>
                </div>
            </div>
        </div>
        <div class="c-fusion-right map-right">
            <div class="perception-road" id="mapRoad">
                <tusvn-map
                        ref="tusvnMap"
                        targetId="tusvnMap"
                        overlayContainerId="overlay"
                        :isMasker='false'
                        :isCircle='false'
                        @MapInitComplete='mapInitComplete'>
                </tusvn-map>
            </div>
        </div>
        <div class="map-left"></div>
        <div id="cesiumContainer" class="c-map">
        </div>
    </div>
</template>
<script>
    import TusvnMap from './TusvnMap.vue';
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData,getCameraByRsId,getAreaByRsId} from '@/api/fusion'
    import WebSocketObj from '@/assets/js/webSocket.js'

    import GIS3D from '@/utils/GIS3D.js' 
    import PerceptionCars from '@/utils/PerceptionCars.js'
    import ProcessCarTrack from '@/utils/ProcessCarTrack.js'
    import ProcessData from '@/utils/ProcessData.js'
    let gis3d;
    let perceptionCars ;
    let platCars;
    let processData;
    export default {
        data() {
            return {
                center:[],
                platformWebsocke:null,
                perceptionWebsocket:null,
                spatWebsocket:null,
                warningWebsocket:null,
                cancelWarningWebsocket:null,
                pulseWebsocket:null,
                param:1, //平面 俯视
                statisticData:'',
                x:0,
                y:0,
                isActive:0,
                vehData:[],
                alertCount:0,
                warningData:{},
                warningCount:0,
                lastLightObj:{},
                processDataTime:'',
                mapShow:false,
                mapInitTime:'',
                currentExtent:[],
                mapParam:{}, //参数待定
                camList:[],
                requestVideoUrl:getVideoByNum,
                tabIsExist:true,

                warningObj:{}, // 参数待定
                pulseNowTime:'',
                delayTime:'',
                pulseInterval:40,

                pulseCount:0,
                spatPulseCount:0,
                warningPulseCount:0,
                staticPulseCount:0,
                perPulseCount:0,
                staticCacheCount:0,
                warningCacheCount:0,
                perCacheCount:0,



                staticWarning:[],
                dynamicWarning:[],
                removeWarning:[],

                isShutDown:false
            }
        },
        props:{
            realData:{
                type:Object,
                default() {
                    return {

                    };
                }
            },
            warningSign:{
                type:Object,
                default(){
                    return {

                    };
                }
            },
        },
        components: {TusvnMap,LivePlayer},
        watch: {
            '$route':{
                handler(newValue, oldValue) {
                    this.isShow = newValue.query.isShow;
                },
                immediate: true,
//                deep: true
            }
        },
        filters: {
            dateFormat: function (value) {
                if(value!=''){
                    let time = DateFormat.formatTime(value,'yy-mm-dd hh:mm:ss:ms');
                    return time;
                }
            }
        },
        mounted() {
            let _this = this;
            gis3d=new GIS3D();
            perceptionCars = new PerceptionCars();
            platCars = new ProcessCarTrack();
            processData = new ProcessData();

            gis3d.initload("cesiumContainer",false);
            perceptionCars.viewer=gis3d.cesium.viewer;

            platCars.models={};
            platCars.viewer=gis3d.cesium.viewer;

            _this.rsId = _this.$route.params.crossId;

            let longitude=parseFloat(_this.$route.query.lng);
            let latitude=parseFloat(_this.$route.query.lat);
            let extend = parseFloat(_this.$route.params.extend);
            _this.delayTime= parseFloat(_this.$route.params.delayTime).toFixed(3)*1000;
            //设置地图的中心点
            if(longitude||latitude) {
                _this.x = longitude;
                _this.y = latitude;
                _this.currentExtent = _this.getExtend(longitude,latitude,extend);
                console.log(_this.currentExtent)
                _this.center=[longitude ,latitude];
            }
            _this.getCameraByRsId();
            _this.getAreaByRsId();
            _this.onMapComplete();
            //判断当前标签页是否被隐藏
            document.addEventListener("visibilitychange",this.processTab);
        },
        methods: {
            formatTime(value){
                let time = DateFormat.formatTime(value,'hh:mm:ss:ms');
                return time;
            },
            onMapComplete(){

                //初始化车辆步长以及平台车阀域范围
                platCars.stepTime = this.pulseInterval;
                platCars.pulseInterval = this.pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
                platCars.platMaxValue = this.pulseInterval*1.5;

                perceptionCars.stepTime = this.pulseInterval;
                perceptionCars.pulseInterval = parseInt(this.pulseInterval)*2*0.8;
                perceptionCars.perMaxValue = this.pulseInterval*2*1.5;

                let spatPulse = this.pulseInterval*10;
                processData.pulseInterval = spatPulse*0.8;
                processData.spatMaxValue =  spatPulse*1.5;

                let warnPulse = this.pulseInterval*10;
                processData.warnPulseInterval = warnPulse*0.8;
                processData.warnMaxValue = warnPulse*1.5;

                let cancelPulse = this.pulseInterval;
                processData.cancelPulseInterval = cancelPulse*0.8;
                processData.cancelMaxValue = cancelPulse*1.5;

                let count=0;
                let camParam;
                gis3d.addRectangle(this.currentExtent[3][0],this.currentExtent[3][1],this.currentExtent[1][0],this.currentExtent[1][1]);

//                debugger
                if(this.camList.length>0&&this.camList[0].camParam){
                    camParam = this.camList[0].camParam;
                        camParam = this.camList[0].camParam;
//                        let {x, y, z, radius, pitch, yaw} = camParam;
                         let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                    this.getData();
                    this.mapShow=true;
                    return;
                }

                this.mapInitTime = setInterval(()=>{
                    if(this.camList.length>0&&this.camList[0].camParam){
                        camParam = this.camList[0].camParam;
//                        let {x, y, z, radius, pitch, yaw} = camParam;
                         let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                        this.getData();
                        clearInterval(this.mapInitTime);
                        this.mapShow=true;
                        return;
                    }
                    count++;
                    if(count==10){
                        let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                        this.getData();
                        this.mapShow=true;
                        clearInterval(this.mapInitTime);
                    }
                },100)
            },
            getData(){
                this.typeRoadData();
                this.initPulseWebSocket();
            },
            mapInitComplete(){
                this.$refs.tusvnMap.centerAt(window.mapOption.center);
                this.$refs.tusvnMap.zoomTo(10);
                this.$refs.tusvnMap.addWms(window.dlWmsOption.LAYERS_withoutz,window.dlWmsDefaultOption.url,window.dlWmsOption.LAYERS_withoutz,window.dlWmsOption.GD_ROAD_CENTERLINE,1,true,null); // 上海汽车城
                this.getMap();
            },
            getMap(){
                let overviewMap = this.$refs.tusvnMap;
                let overviewLayerId = "overviewLayer";
                let overviewLayer = overviewMap.getLayerById(overviewLayerId);
                if(overviewLayer!=null){
                    overviewMap.removeAllFeature(overviewLayerId);
                }else{
                    overviewMap.addVectorLayer(overviewLayerId);
                }
                let currentExtend = this.currentExtent;
                overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.centerAt((currentExtend[0][0]+currentExtend[2][0])/2,(currentExtend[0][1]+currentExtend[2][1])/2);
            },
            getCameraByRsId(){
                getCameraByRsId({"rsId":this.rsId}).then(res => {
                    let data = res.data;
                    if(data.camLst && data.camLst.length>0){
                        this.camList = data.camLst;
                        this.camList.forEach(item=>{
                            let params={
                                "serialNum": item.sn,
                                "protocal": item.protocal
                            }
                            item.params = params;
                            item.rsPtName=data.rsName;
                            this.$set(item,"magnify",false);
                        })
                    }
                });
            },
            getAreaByRsId(){
                getAreaByRsId({
                    "rsPtId": this.rsId,
                    "typeList": ["N","S"]
                }).then(res=>{
                    let data = res.data;
                    let sensingArea = [];
                    data.forEach(item=>{
                        if(item.sensingArea!=''){
                            sensingArea.push(item.sensingArea)
                        }
                    });
                    // let hierarchy = [
                    //     112.953651652808389, 28.329121301607586, 50,
                    //     112.953927670284997, 28.328597820186189, 50,
                    //     112.952570766104373, 28.327743594794072, 50,
                    //     112.952201968003351, 28.328177801283175, 50,
                    //     112.953651652808276, 28.329121301607586, 50
                    // ];

                });
            },
            typeRoadData(){
                typeRoadData(
                    [
                        {
                            "polygon":this.currentExtent
                        }

                    ]
                ).then(res=>{
                    let signs = res.data[0].baseData.signs;
                    let spats = res.data[0].baseData.spats;
                    let signCount=0;
                    let spatCount=0;
                    if(signs&&signs.length>0){
                        signs.forEach(item=>{
                            signCount++;
                        })
                    }
                    if(spats&&spats.length>0) {
                        this.$parent.spatCount = spats.length;
                    }
                    this.$parent.signCount = signCount;
                })
            },
            changeMap(param){
                if(param==-1){
                    this.param=-1;
                    this.isActive=-1;
                    gis3d.updatePosition(this.currentExtent[3][0],this.currentExtent[3][1],this.currentExtent[1][0],this.currentExtent[1][1]);
                    // gis3d.updatePosition(this.x,this.y,121.431,31.371);
                    return;
                }
                if(this.camList.length>0){
                    let cameraParam = this.camList[param].camParam;
                    if(cameraParam){
                        let {x, y, z, radius, pitch, yaw} = cameraParam;
                        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                    }else{

                        let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                    }
                }else{
                    let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                    gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                }
                this.isActive=param;
                this.param=param;
            },
            screenMagnify(item){
                item.magnify = !item.magnify;
//                let videoUrl = this.camList[param].videoUrl;
//                if(videoUrl!=''){
//                    this.camList[param].videoShow=true;
//                }
            },

            //告警
            initWarningWebSocket(){
                let currentExtent = this.getExtend(this.x,this.y,0.02);
                let _params = {
                    "action":"cloud_event",
                    "body":{
                        "region":currentExtent,
                    },
                    "type":1
                };
                this.warningWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onWarningMessage);
            },
            onWarningMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let data = json.result;
                if(data&&data.length>0){
                    data.forEach(rcuItem=>{
                        let item = rcuItem.data;
                        let warnId = item.warnId.substring(0,item.warnId.lastIndexOf("_"));
                        //判断事件是否被取消
                        if(this.removeWarning.indexOf(item.warnId)==-1){
//                            console.log(processData.cancelWarning.indexOf(item.warnId)==-1);
                            //如果是静态事件
                            if(!item.isD){
                                //如果是静态事件，收到确认
                                let warning = {
                                    "action":"cloud_event",
                                    "body":{
                                        "warnId":item.warnId,
                                        "status":1
                                    },
                                    "type":2
                                };
                                let warningMsg = JSON.stringify(warning);
                                this.warningWebsocket.sendMsg(warningMsg);
                                item.warnId = warnId;
                                let array = processData.staticWarning[warnId];
                                if(!array){
                                    processData.staticWarning[warnId] = new Object();
                                }
                                processData.staticWarning[warnId]=item;

                            }else{
                                let array = processData.dynamicWarning[warnId];
                                if(!array){
                                    processData.dynamicWarning[warnId] = new Array();
                                }
                                item.warnId = warnId;
                                processData.dynamicWarning[warnId].push(item);
                            }
                        }
//                       let warningData = rcuItem.data;
//                       if(warningData&&warningData.length>0){
//                           warningData.forEach(item=>{
//
//                           })
//                       }
                    });
                }
//                this.processWarn(json);
            },
            processWarn(warningData){
                let _this = this;
                let warnId = warningData.warnId;
                if(warnId){
                    //如果告警第一次画
                    if(!_this.warningData[warnId]){
                        console.log(warnId);
                        _this.warningCount++;
                        _this.warningData[warnId] = {
                            warnId: warnId,
                            id:warnId,
                            msg:warningData.warnMsg,
                            longitude:warningData.longitude,
                            latitude:warningData.latitude
                        }
                        gis3d.add3DInfoLabel(warnId,warningData.warnMsg,warningData.longitude,warningData.latitude,20);
                    }else{
                        //判断是否需要更新
                        if(warningData.longitude != _this.warningData[warnId].longitude || warningData.latitude != _this.warningData[warnId].latitude) {
                            gis3d.update3DInfoLabel(warnId,warningData.warnMsg);
                        }
                    }
                }
            },

            //取消告警
            initCancelWarningWebSocket(){
                let _params = {
                    "action":"event_cancel",
                    "body":{"busType":"rsi"},
                    "type":1
                };
                this.cancelWarningWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onCancelWarningMessage);
            },
            onCancelWarningMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let warnId = json.result;
                let cancelWarning = {
                    "action":"event_cancel",
                    "body":{
                        "events":warnId,
                        "status":1
                    },
                    "type":2
                };
                let cancelWarningMsg = JSON.stringify(cancelWarning);
                this.cancelWarningWebsocket.sendMsg(cancelWarningMsg);
                if(processData.cancelWarning.indexOf(warnId)==-1){
                    processData.cancelWarning.push(warnId);
                }
//                this.processWarn(json);
            },
            processCancelWarn(data){
                data.forEach(warnId=>{
                    if (this.warningCount > 0) {
                        this.warningCount--;
                        this.$parent.warningCount = this.warningCount;
                        delete this.warningData[warnId];
                        console.log("移除事件"+warnId)
                        gis3d.remove3DInforLabel(warnId);
                        this.removeWarning.push(warnId);
                        delete processData.cancelWarning[warnId];
                    }
                })
            },

            //平台车
            initPlatformWebSocket(){
                let currentExtent = this.getExtend(this.x,this.y,0.02);
                let _params = {
                    "action": "vehicle",
                    "body": {
                        "polygon": currentExtent
                    },
                    "type": 3
                };
                this.platformWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onPlatformMessage);
            },
            onPlatformMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                platCars.receiveData(json,this.pulseNowTime);

            },
            //感知车
            initPerceptionWebSocket(){
                let _params = {
                    "action":"road_real_data_per",
                    "data":{
                        "type":1,
                        "polygon":this.currentExtent
                    }
                };
                this.perceptionWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onPerceptionMessage);
            },
            onPerceptionMessage(message){
                let _this=this;
                let data = JSON.parse(message.data)
                if(_this.isCapture=='true'){
                    if(_this.captureCount>1000){
                        return;
                    }
                    _this.perCaptureList.push(data);
                    _this.captureCount++;
                    return;
                }
                let sideList = data.result.perList;
                perceptionCars.receiveData(sideList);

            },
            processPerData(data){
                let _this = this;
                let cars = data.data;
                if(cars.length>0) {
                    let pcarnum = 0;
                    let persons = 0;
                    let zcarnum = 0;
                    for (let i = 0; i < cars.length; i++) {
                        let obj = cars[i];
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
                    this.statisticData = "当前数据包：" + cars.length + "=" + zcarnum + "(平台车)+" + pcarnum + "(感知)+" + persons + "(人)";
                }
            },

            //红绿灯
            initSpatWebSocket(){
                let currentExtent = this.getExtend(this.x,this.y,0.02);
                let _params = {
                    "action":"spat",
                    "data":{
                        "polygon":currentExtent
                    },
                    "type":2
                };
                this.spatWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onSpatMessage);
            },
            onSpatMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let data = json.result.data;
                processData.receiveLightData(data);
            },
            drawnSpat(data){
                let _this = this;
                let resultData=[];
                if(data&&data.length>0){
                    data.forEach(item=>{
                        let option={
                            leftTime:item.leftTime,
                            light:item.status,
                            direction:item.direction,
                            spatId:item.spatId

                        }
                        resultData.push(option);
                    });
                    resultData.forEach(function (item,index,arr) {
                        let light={
                            /*id: "1",
                            img1: "./static/images/single/000_03.png",
                            img2: "./static/images/single/2.png",
                            img3: "./static/images/single/000_16.png"*/
                        };
                        let array=(item.leftTime+"").split("");
                        if(array.length==1){
                            array=['0',array[0]]
                        }
                        let img1;
                        let img2;
                        let img3;
                        let lastItem;
                        let keys = Object.keys(_this.lastLightObj);
                        if(keys&&keys.length>0){
                            lastItem = _this.lastLightObj[item.spatId];
                        }
                        if(!_this.tabIsExist){
                            lastItem={};
                        }
//                        console.log(lastItem,item)
                        let _direction = '';
                        if(item.direction==1) {
                            _direction = 'cross';
                        }
                        if(item.direction==2) {
                            _direction = 'left';
                        }
                        if(item.direction==3) {
                            _direction = 'turn';
                        }
                        if(item.direction==4) {
                            _direction = 'right';
                        }
                        let _color = item.light.toLowerCase();
                        //每个路灯相位都是固定的
                        if(lastItem&&lastItem.light==item.light&&lastItem.direction==item.direction){
                            img1="";
                        }else{
                            img1='./static/images/light/'+_direction+'-'+_color+'.png';
                        }
                        if(lastItem&&lastItem.first==array[0]&&lastItem.light==item.light){
                            img2=''
                        }else {
                            img2 = _this.getNumPng(_color,array[0]);
                        }
                        if(lastItem&&lastItem.second==array[1]&&lastItem.light==item.light){
                            img3=''
                        }else {
                            img3 = _this.getNumPng(_color,array[1]);
                        }

                        light.id=item.spatId;
                        light.img1=img1;
                        light.img2=img2;
                        light.img3=img3;
//                        console.log(light)
                        gis3d.updateLight(light);
                        let obj = {
                            direction:item.direction, //直行 左转 右转
                            light:item.light,
                            first:array[0],
                            second:array[1]

                        }
//                        console.log(item.spatId,obj);
//                        if(item.spatId==277){
//                            console.log("---------")
//                            console.log(item)
//                        }
                        _this.lastLightObj[item.spatId]=obj;
//                            console.log(item.spatId,light);
                        // _this.$refs.perceptionMap.addStaticModel_light_1(light);
                        //地图渲染剩余时间
                    })
                }
            },
            getNumPng(color,num){
                let _color = color.toLowerCase();
                let img = './static/images/light/'+_color+'_'+num+'.png';
                return img;
            },
            getExtend(x,y,r){
                let currentExtent=[];
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                currentExtent.push([x1, y0]);
                currentExtent.push([x0, y0]);
                currentExtent.push([x0, y1]);
                currentExtent.push([x1, y1]);
                return currentExtent;
            },
            processTab(){
                if(document.visibilityState == "hidden") {
                    this.tabIsExist=false;
                } else if (document.visibilityState == "visible") {
                    this.tabIsExist=true;
                }
            },

            //脉冲
            initPulseWebSocket(){
                let _params = {
                    "action":"pulse",
                    "data":{
//                        "frequency":39
                        "frequency":this.pulseInterval
                    }
                };
                this.pulseWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onPulseMessage);
            },
            onPulseMessage(message){
                let json = JSON.parse(message.data);
                let result = json.result;
                let _this = this;
                if(_this.pulseNowTime==''){
                   _this.initPerceptionWebSocket();
                   _this.initPlatformWebSocket();
                   _this.initWarningWebSocket();
                   _this.initSpatWebSocket();
                   _this.initCancelWarningWebSocket();
                }
                _this.pulseNowTime = result.timestamp;
                _this.pulseCount++;

                //缓存次数控制
                if(_this.warningCacheCount>0){
                    _this.warningCacheCount++;
                }
                //有告警事件开始缓存
                if(Object.keys(processData.dynamicWarning).length>0){
                    if(_this.warningCacheCount==0){
                        _this.warningCacheCount++;
                    }
                }
                //静态事件缓存次数控制
                if(_this.staticCacheCount>0){
                    _this.staticCacheCount++;
                }
                //感知车缓存次数控制
                if(_this.perCacheCount>0){
                    _this.perCacheCount++;
                }
                //静态告警事件开始缓存
                if(Object.keys(processData.staticWarning).length>0){
                    if(_this.staticCacheCount==0){
                        _this.staticCacheCount++;
                    }
                }

                if (Object.keys(platCars.platObj).length > 0) {
                    for (let vehicleId in platCars.platObj) {
                        let dataList = platCars.platObj[vehicleId];
                        if(dataList.length>0){
//                            console.log("*******",vehicleId,dataList.length)
                        }
                        if (dataList.length > 0) {
                            //分割之前将车辆移动到上一个点
                            //将第一个点进行分割
                            let data = dataList.shift();
                            platCars.cacheAndInterpolatePlatformCar(data);
//                            console.log(vehicleId+"————————"+platCars.cacheAndInterpolateDataByVid[vehicleId].cacheData.length)
                        }
                    }
                }
                if (Object.keys(perceptionCars.devObj).length > 0){
                    if(_this.perCacheCount==0){
                        _this.perCacheCount++;
                    }
                    for (let devId in perceptionCars.devObj) {
                        let devList = perceptionCars.devObj[devId];
                        /*console.log("*****")
                        console.log(vehicleId,dataList.length)*/
                        if (devList.length > 0) {
                            //分割之前将车辆移动到上一个点
                            //将第一个点进行分割
                            let data = devList.shift();
                            perceptionCars.cacheAndInterpolatePerCar(data);
//                            console.log(devId+"————————"+perceptionCars.cacheAndInterpolateDataByDevId[devId].cacheData.length)
                        }
                    }
                }
                //缓存的时间
                let pulseNum = _this.delayTime*2/40;
                if(_this.pulseCount>=pulseNum) {

                    //当平台车开始插值时，调用其他接口
                    _this.processDataTime = result.timestamp-_this.delayTime;
//                    console.log(_this.pulseCount,_this.pulseCount%3,Object.keys(perceptionCars.devObj).length);
                    //平台车
                    if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
                       let platCar =  platCars.processPlatformCarsTrack(result.timestamp,_this.delayTime);
                       if(platCar){
                           this.$parent.vehData = platCar['vehData'];
                       }
                    }

                    //取消告警
                    if(processData.cancelWarning.length>0){
                        let cancelData = [];
                        //查找现有告警是否有取消告警
                        processData.cancelWarning.forEach(warnId=>{
                            //如果有告警 则进行删除
                            if(_this.warningData[warnId]){
                                cancelData.push(warnId);
                            }
                        })
                        if(cancelData.length>0){
                            _this.processCancelWarn(cancelData);
                        }
                    }

                    //每隔80ms一次
                    if(_this.spatPulseCount==0||_this.spatPulseCount>=10){
//                        console.log(_this.spatPulseCount);
                        _this.spatPulseCount=1;
                        if(Object.keys(processData.spatObj).length>0){
//                            console.log("spatPulseCount:"+_this.spatPulseCount)
                            let data = processData.processSpatData(result.timestamp,_this.delayTime);
                            if(data&&data.length>0){
                                _this.drawnSpat(data);
                            }
                        }
                    }
                    _this.spatPulseCount++;

                }

                if(_this.perCacheCount>pulseNum&&_this.perPulseCount==0||_this.perPulseCount>=2){
                    _this.perPulseCount=1;
                    if(Object.keys(perceptionCars.devObj).length>0){
                        let perList = perceptionCars.processPerTrack(result.timestamp,_this.delayTime);
                        if(perList){
                            if(perList.length>0){
                                _this.processPerData(perList[0]);
                                let pernum = 0;
                                let persons = 0;
                                let nonNum = 0;
                                let perData={};
                                perList.forEach(item=>{
                                    let cars = item.data;
                                    if(cars&&cars.length>0) {
                                        for (let i = 0; i < cars.length; i++) {
                                            let obj = cars[i];
                                            if (obj.targetType == 0){
                                                persons++;
                                            }

                                            if (obj.targetType == 2||obj.targetType == 5 || obj.targetType == 7) {
                                                pernum++;
                                            }

                                            if(obj.targetType == 1 || obj.targetType == 3){
                                                nonNum++;
                                            }
                                        }
                                    }
                                });
                                perData['veh']=pernum;
                                perData['person'] = persons;
                                perData['noMotor'] = nonNum;
//                                console.log(perData)
                                this.$parent.perceptionData = perData;
                            }
                        }
                    }
                }
                _this.perPulseCount++

                //执行动态告警
                if(_this.warningCacheCount>pulseNum&&(_this.warningPulseCount==0||_this.warningPulseCount>=10)){
                    _this.warningPulseCount=1;
                    if(Object.keys(processData.dynamicWarning).length>0){
                        for(let warnId in processData.dynamicWarning){
                            let data = processData.processWarningData(result.timestamp,_this.delayTime,warnId);
                            if(data){
                                _this.processWarn(data);
                            }
                        }
                        //此次告警结束，将总数传递出去
                        _this.$parent.warningCount = _this.warningCount;
                    }
                }
                _this.warningPulseCount++;

                //执行静态告警
                if(_this.staticCacheCount>pulseNum&&(_this.staticPulseCount==0||_this.staticPulseCount>=10)){
                    _this.staticPulseCount=1;
                    //静态事件的处理
                    if(Object.keys(processData.staticWarning).length>0){
                        for(let warnId in processData.staticWarning){
                            let staticData = processData.processStaticData(result.timestamp,_this.delayTime);
                            if(staticData&&staticData.length>0){
                                console.log("length:"+staticData.length)
                                //静态事件
                                staticData.forEach(item=>{
                                    _this.processWarn(item);
                                })
                            }
                        }
                        //此次告警结束，将总数传递出去
                        _this.$parent.warningCount = _this.warningCount;
                    }
                }
                _this.staticPulseCount++;


            },

        },
        destroyed(){
            gis3d.destroyed();
            gis3d=null;
            perceptionCars=null ;
            platCars=null;
            processData=null;
            clearInterval(this.mapInitTime);
            this.warningWebsocket&&this.warningWebsocket.webSocket.close();
            this.cancelWarningWebsocket&&this.cancelWarningWebsocket.webSocket.close();
            this.platformWebsocket&&this.platformWebsocket.webSocket.close();
            this.perceptionWebsocket&&this.perceptionWebsocket.webSocket.close();
            this.spatWebsocket&&this.spatWebsocket.webSocket.close();
            this.pulseWebsocket&&this.pulseWebsocket.webSocket.close();
        }
    }
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .map-right{
        width: 270px;
    }


    .map-time{
        margin-top:100px!important;
        background: #969090;
        font-size: 14px;
    }
    .perception-road{
        height: 130px;
        width: 220px;
        border:1px solid rgba(211, 134, 0, 0.3);
        position: absolute;
        bottom: 10px;
        background: #000;
        right: 10px;
        z-index:100;
    }
    .style{
        position: relative;
    }
    .video-num{
        position: absolute;
        left: 0;
        right: 0;
        padding: 0px 10px;
        cursor: pointer;
        height: 100%;
        display: flex;
        justify-content: space-between;
        .device-num{
            padding-left: 10px;
        }
    }
    .img-style{
        position: absolute;
        top: 86px;
        z-index:3;
        right: 420px;
        width:40px;
        cursor: pointer;
    }
    .video-style{
        position: absolute;
        top: 86px;
        right: 10px;
        z-index:3;
        width: 400px;
        .video-tip{
            @include layoutMode(both);
            font-size: 16px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0px;
        }

        /*  transition: all 2s ease-in-out;*/
        .active-circle{
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            position: absolute;
            left: 4px;
            top:50%;
            transform: translate(0,-50%);

        }
        .active-style{
            background: red !important;
            animation: myAnimate 1s infinite;

        }
        @keyframes myAnimate {
            0%{
                opacity: 0;
            }
            /*50% {
               opacity: 1;
            }*/
        }
    }
    .magnify-style{
        position: absolute;
        top: 0px;
        right: 0px;
        z-index:6;
        width: 900px;
        border:1px solid rgba(211, 134, 0, 0.5);
        background: #000;
    }
    .video-position{
        margin-bottom: 16px;
        box-sizing: border-box;
        /*border:1px solid rgba(234, 233, 229, 0.1);*/
        border:1px solid rgba(211, 134, 0, 0.5)!important;
        height: 226px;
        background: #00000082;
    }
    .video-mask{
        position: absolute;
        right: 50px;
        bottom: 0;
        width: 80px;
        height: 46px;
        z-index: 3;
        cursor: pointer;
    }

</style>