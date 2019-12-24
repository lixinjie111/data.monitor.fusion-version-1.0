<template>
    <div class="fusion-right-style">
        <div class="c-fusion-right map-right">
            <p class="c-title">前向摄像头</p>
            <div class="fusion-video">
                <live-player
                        :requestVideoUrl="requestVideoUrl"
                        :params="forwardParam"
                        type="rtmp"
                        :autoplay="false"
                        @videoLoadCompleted="videoLoadCompleted"
                        :isBig="false"
                        v-if="forwardShow"
                >
                </live-player>
                <p class="video-position" v-if="!forwardShow">暂无数据</p>
            </div>
            <p class="c-title">车内摄像头</p>
            <div class="fusion-video">
                <live-player
                        :requestVideoUrl="requestVideoUrl"
                        :params="inParam"
                        type="rtmp"
                        :autoplay="false"
                        @videoLoadCompleted="videoLoadCompleted"
                        :isBig="false"
                        v-if="inShow"
                >
                </live-player>
                <p class="video-position"  v-if="!inShow">暂无数据</p>
            </div>
        </div>
        <div class="c-pulse-time" >
            <i class="el-icon-loading" v-if="!processDataTime"></i>
            <template v-else>{{processDataTime|dateFormat}}</template>
        </div>
        <div class="c-map" id="cesiumContainer">
        </div>
        <img class="single-car" src="@/assets/images/single/car-bottom.png"/>

        <div class="travel-detail"  >

            <div class="detail1">
                <span>{{canData.longitude? canData.longitude.toFixed(8):'--'}}</span>
                <span class="detail2">E</span>
            </div>
            <div class="detail1">
                <span>{{canData.latitude ?canData.latitude.toFixed(8):'--'}}</span>
                <span class="detail2">N</span>
            </div>
            <div class="detail1">
                <span>{{canData.speed?canData.speed.toFixed(1):'--'}}</span>
                <span class="detail2">km/h</span>
            </div>
            <div class="detail1">
                <span>{{canData.headingAngle?canData.headingAngle.toFixed(1):'--'}}</span>
                <span class="detail2">°</span>
            </div>
            <div class="detail1">
                <span>{{nowYear}}</span>
                <span class="detail2">{{nowTime}}</span>
            </div>
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import {getLiveDeviceInfo, startStream, sendStreamHeart } from '@/api/single'
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    import WebSocketObj from '@/assets/js/webSocket.js'

    import GIS3D from '@/utils/GIS3D.js'
    import PerceptionCars from '@/utils/PerceptionCars.js'
    import ProcessCarTrack from '@/utils/ProcessCarTrack.js'
    import ProcessData from '@/utils/ProcessData.js'

    let gis3d=new GIS3D();
    let perceptionCars = new PerceptionCars();
    let platCars = new ProcessCarTrack();
    let processData = new ProcessData();
    export default {
        data() {
            return {
                vehicleId:this.$route.params.vehicleId,
                spatWebsocket:null,
                warningWebsocket:null,
                platformWebsocket:null,
                perceptionWebsocket:null,
                pulseWebsocket:null,
                canWebsocket:null,
                cancelWarningWebsocket:null,

                alertCount:0,
                warningData:{},
                warningExist:[],//要进行距离计算
                staticExist:[],//要进行距离计算
                warningCount:0,
                lastLightObj:{},

                lightList:[],
                requestVideoUrl:startStream,
                forwardParam:{},
                inParam:{},
                forwardShow:false,
                inShow:false,
                timeObj:{},
                
                processDataTime:'',
                pulseNowTime:'',
                pulseCount:0,
                delayTime:'',
                spatPulseCount:0,
                routePulseCount:0,
                canPulseCount:0,
                pulseInterval:40,
                warningPulseCount:0,
                staticPulseCount:0,
                computePulseCount:0,
                perPulseCount:0,
                spatCount:0,
                warningCacheCount:0,
                staticCacheCount:0,
                perCacheCount:0,


                tabIsExist:true,
                canData:{
                    headingAngle:0,
                    gpsTime:''
                },
                removeWarning:[]

            }
        },
        computed:{
            nowYear(){
                if(this.canData.gpsTime==''){
                    return '--';
                }else{
                    return this.$dateUtil.formatTime(this.canData.gpsTime).split(" ")[0];
                }
            },
            nowTime(){
                if(this.canData.gpsTime==''){
                    return '--';
                }else{
                    return this.$dateUtil.formatTime(this.canData.gpsTime).split(" ")[1];
                }
            }
        },
        methods: {
            //视频报错的方法
            getDeviceInfo(){
                getLiveDeviceInfo({
                    'vehicleId': this.vehicleId,
                }).then(res => {
                    let result = res.data;
                    result.forEach(item=>{
                        let param;
                        //前向摄像头
                        if(item.toward==0){
                            this.forwardParam ={
                                'vehicleId': this.vehicleId,
                                'camId':item.serialNum,
                                'protocal':item.protocol
                            }
                            this.forwardShow=true;
                        }
                        //车内摄像头
                        if(item.toward==4){
                            this.inParam = {
                                'vehicleId': this.vehicleId,
                                'camId':item.serialNum,
                                'protocal':item.protocol
                            }
                            this.inShow=true;

                        }
                    })
                });
            },
            videoLoadCompleted(param){
                this.repeatFn(param);
            },
            keepStream(item){
                sendStreamHeart({
                    'vehicleId': this.vehicleId,
                    'camId':item.camId,
                    'protocal':item.protocal
                }).then(res => {
                });
            },
            repeatFn(item){//每5秒直播报活一次
                let _this = this;
                _this.keepStream(item);
                if(_this.timeObj[item.camId]){
                    clearTimeout(_this.timeObj[item.camId]);
                }
                let time = setTimeout(function(){
                    _this.repeatFn(item);
                },5000)
                _this.timeObj[item.camId] = time;
            },
            onMapComplete:function(){
                console.log("onMapComplete");
                let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
                //初始化车辆步长以及平台车阀域范围
                platCars.stepTime = this.pulseInterval;
                platCars.pulseInterval = this.pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
                platCars.platMaxValue = platCars.pulseInterval*1.5;

                perceptionCars.stepTime = this.pulseInterval*2;
                perceptionCars.pulseInterval = parseInt(this.pulseInterval)*2*0.8;
                perceptionCars.perMaxValue = perceptionCars.pulseInterval*2*1.5;

                let spatPulse = this.pulseInterval*10;
                processData.spatPulseInterval = spatPulse*0.8;
                processData.spatMaxValue =  processData.pulseInterval*1.5;

                let routePulse = this.pulseInterval*25;
                processData.routePulseInterval = routePulse*0.8;
                processData.routeMaxValue =  processData.routePulseInterval*1.5;

                let canPulse = this.pulseInterval*10;
                processData.canPulseInterval = canPulse*0.8;
                processData.canMaxValue =  processData.canPulseInterval*1.5;

                let warnPulse = this.pulseInterval*10;
                processData.warnPulseInterval = warnPulse*0.8;
                processData.warnMaxValue = warnPulse*1.5;

                let cancelPulse = this.pulseInterval;
                processData.cancelPulseInterval = cancelPulse*0.8;
                processData.cancelMaxValue = cancelPulse*1.5;

                this.initPulseWebSocket();
            },

            //红绿灯
            initSpatWebSocket(){
                let _params = {
                    "action":"spat",
                    "vehicleId":this.vehicleId,
                    "type":1
                };
                this.spatWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onSpatMessage);
            },
            onSpatMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let data = json.result.data;
                processData.receiveLightData(data);
//                _this.processSpat(data);
//                let vehData = json.result.vehDataStat;
//                _this.$emit("getPerceptionData",vehData);
//                _this.vehData.push(vehData);
            },
            drawnSpat(data){
                let _this = this;
                let resultData=[];
                if(data&&data.length>0){
                    data.forEach(item=>{
                        let option={
                            leftTime:item.leftTime,
                            light:item.light,
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

            //告警
            initWarningWebSocket(){
                let _params = {
                        "action":"warning",
                        "body":{
                            "vehicleId":this.vehicleId
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
                        //判断事件是否被取消 如果告警事件被画上 并且接收到取消 则不进行接收
                        if(this.removeWarning.indexOf(item.warnId)==-1){
//                            console.log(processData.cancelWarning.indexOf(item.warnId)==-1);
//                            item.isD=true;
                            //如果是静态事件
                            if(!item.isD){
                                //如果是静态事件，收到确认
                                let warning = {
                                    "action":"warning",
                                    "body":{
                                        "warnId":item.warnId,
                                        "status":1
                                    },
                                    "type":2
                                }
                                let warningMsg = JSON.stringify(warning);
                                this.warningWebsocket.sendMsg(warningMsg);
                                item.warnId = warnId;
                                let array = processData.staticWarning[item.warnId];
                                if(!array){
                                    processData.staticWarning[item.warnId] = new Object();
                                }
                                processData.staticWarning[item.warnId]=item;
                            }else{
                                let array = processData.dynamicWarning[warnId];
                                if(!array){
                                    processData.dynamicWarning[warnId] = new Array();
                                }
                                item.warnId = warnId;
                                processData.dynamicWarning[warnId].push(item);

                            }
                        }
                    });
                }
//                this.processWarn(json);
            },
            processWarn(warningData,distance){
//                console.log(warnId)
                let _this = this;
                let warnId = warningData.warnId;
                let warningMsg;
                if(distance){
                    warningMsg = warningData.warnMsg + ' ' +distance+'米';
                }
//                console.log(warnId,_this.warningData[warnId])
                //如果告警第一次画
                if(!_this.warningData[warnId]){
                    _this.warningCount++;
                    _this.warningData[warnId] = {
                        warnId: warnId,
                        id:warnId,
                        warnMsg:warningData.warnMsg,
                        longitude:warningData.longitude,
                        latitude:warningData.latitude
                    }
                    gis3d.add3DInfoLabel(warnId,warningMsg,warningData.longitude,warningData.latitude,20);
                }else{
                    gis3d.update3DInfoLabel(warnId,warningMsg);
                    //判断是否需要更新
//                    if(warningData.longitude != _this.warningData[warnId].longitude || warningData.latitude != _this.warningData[warnId].latitude) {
//                        gis3d.update3DInfoLabel(warnId,warningMsg);
//                    }
                }
            },

            //取消告警
            initCancelWarningWebSocket(){
                let _params = {
                    "action":"event_cancel",
                    "body":{},
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
                }
                let cancelWarningMsg = JSON.stringify(cancelWarning);
                this.cancelWarningWebsocket.sendMsg(cancelWarningMsg);
                if(processData.cancelWarning.indexOf(warnId)==-1){
                    processData.cancelWarning.push(warnId);
                }
            },
            processCancelWarn(data){
//                    debugger
                data.forEach(warnId=>{
                    if (this.warningCount > 0) {
                        this.warningCount--;
                        this.$parent.warningCount = this.warningCount;
                        console.log("移除事件"+warnId)
                        delete this.warningData[warnId];
                        gis3d.remove3DInforLabel(warnId);
                        this.removeWarning.push(warnId);
                        this.staticExist.forEach((item,index)=>{
                            if(item.warnId == warnId){
                                this.staticExist.splice(index,1)
                            }
                        })
                        processData.cancelWarning.splice(processData.cancelWarning.indexOf(warnId),1);
                    }
                })
            },

            //平台车
            initPlatformWebSocket(){
                let _params = {
                    "action": "vehicle",
                    "body": {
                        "vehicleId": this.vehicleId
                    },
                    "type": 2
                };
                this.platformWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onPlatformMessage);
            },
            onPlatformMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                platCars.receiveData(json,this.pulseNowTime,_this.vehicleId);
            },
            //融合车
            initPerceptionWebSocket(){
                let _params = {
                    "action":"road_real_data_per",
                    "data":{
                        "type":2,
                        "vehicleId":this.vehicleId
                    }
                };
                this.perceptionWebsocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onPerceptionMessage);
            },
            onPerceptionMessage(message){
                let _this=this;
                let data = JSON.parse(message.data)
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
                    this.statisticData = "当前数据包：" + cars.length + "=" + zcarnum + "(自车)+" + pcarnum + "(感知)+" + persons + "(人)";
                }
            },
            //can数据
            initCanWebSocket(){
                let _params = {
                    'action':'can_real_data',
                    'vehicleIds':this.vehicleId
                };
                this.canWebSocket = new WebSocketObj(this, window.config.socketUrl, _params, this.onCanMessage);
            },
            onCanMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                processData.receiveCanData(json.result);
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
                if(this.pulseNowTime==''){
                    this.initPlatformWebSocket();
                    this.initPerceptionWebSocket();
                    this.initCanWebSocket();
                    this.initWarningWebSocket();
                    this.initSpatWebSocket();
                    this.initCancelWarningWebSocket();
                }
                this.pulseNowTime = result.timestamp;
                this.pulseCount++;

                //缓存的时间
                let pulseNum = this.delayTime*2/40;
                let delayTime = this.delayTime*2*0.6;
                if (Object.keys(platCars.platObj).length > 0) {
                    for (let vehicleId in platCars.platObj) {
                        let dataList = platCars.platObj[vehicleId];
                        /*console.log("*****")
                        console.log(vehicleId,dataList.length)*/
                        if (dataList.length > 0) {
                            //分割之前将车辆移动到上一个点
                            //将第一个点进行分割
                            let data = dataList.shift();
                            platCars.cacheAndInterpolatePlatformCar(data);
//                            console.log(vehicleId+"————————"+platCars.cacheAndInterpolateDataByVid[vehicleId].cacheData.length)
                        }
                    }
                }

                //取消告警
                if(processData.cancelWarning.length>0){
                    let cancelData = [];
                    //查找现有告警是否有取消告警
                    processData.cancelWarning.forEach(warnId=>{
                        //如果有告警 则进行删除
                        if(this.warningData[warnId]){
                            cancelData.push(warnId);
                        }
                    })
                    if(cancelData.length>0){
                        this.processCancelWarn(cancelData);
                    }
                }

                //感知数据缓存次数控制
                if(this.perCacheCount>0){
                    this.perCacheCount++;
                }


//                console.log(this.perCacheCount);
                if (Object.keys(perceptionCars.devObj).length > 0) {
                    //当有感知数据时
                    if(this.perCacheCount==0){
                        this.perCacheCount++;
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
//                            console.log(devId+"————————"+perceptionCars.cacheAndInterpolateDataByDevId[devId].cacheData.length)
                        }
                    }
                }

                //红绿灯缓存次数控制
                if(this.spatCount>0){
                    this.spatCount++;
                }
                if(Object.keys(processData.spatObj).length>0){
                    if(this.spatCount==0){
                        this.spatCount++;
                    }
                }

                //缓存次数控制
                if(this.warningCacheCount>0){
                    this.warningCacheCount++;
                }
                //有告警事件开始缓存
                if(Object.keys(processData.dynamicWarning).length>0){
                    if(this.warningCacheCount==0){
                        this.warningCacheCount++;
                    }
                }

                //缓存次数控制
                if(this.staticCacheCount>0){
                    this.staticCacheCount++;
                }
                //有告警事件开始缓存
                if(Object.keys(processData.staticWarning).length>0){
                    if(this.staticCacheCount==0){
                        this.staticCacheCount++;
                    }
                }
                let mainCar;
                //平台车  缓存+40ms调用一次
                if(this.pulseCount>=pulseNum) {
                    //当平台车开始插值时，调用其他接口
                    this.processDataTime = result.timestamp-delayTime;
//                    console.log(this.pulseCount,this.pulseCount%3,Object.keys(perceptionCars.devObj).length);
                    if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
                        let platCar = platCars.processPlatformCarsTrack(result.timestamp,delayTime);
                        if(platCar&&platCar.mainCar){
                            mainCar = platCar.mainCar;
                        }
                    }
                    //距离计算次数的控制  1200ms计算一次
                    if(this.computePulseCount==0||this.computePulseCount>25){
                        this.computePulseCount=1;
                        //如果是主车 计算主车与告警事件之间的距离
                        if(mainCar){
//                            console.log("主车航向角",mainCar.heading,mainCar.gpsTime,DateFormat.formatTime(mainCar.gpsTime));
                            //静态事件  查找框内的事件 staticExist  存储静态事件
                            let currentExtend = this.getExtend(mainCar.longitude,mainCar.latitude,0.005);
                            if(this.staticExist.length>0){

//                                console.log(this.staticExist)
                                this.staticExist.forEach((item,index)=>{
                                    if(item.longitude<currentExtend[1][0]&&item.latitude<currentExtend[1][1]&&item.longitude>currentExtend[3][0]&&item.latitude>currentExtend[3][1]){
                                        let s = this.computeDistance(mainCar,item);
//                                        console.log(item.warnId,s)
                                        this.processWarn(item,s);
                                    }else{
                                        //如果不在区域内  不显示多少米  排查是否信息更新
                                        let msg = gis3d.get3DInfoLabel(item.warnId);
                                        if(msg&&msg._value.indexOf('米')!=-1){
                                            gis3d.update3DInfoLabel(item.warnId,item.warnMsg);
                                        }
                                    }
                                })
                            }
                            //动态事件
                            if(this.warningExist.length>0){
                                this.warningExist.forEach(item=>{
                                    let s = this.computeDistance(mainCar,item);
                                    this.processWarn(item,s);
                                })
                            }
                        }
                    }
                    this.computePulseCount++;

                    if(this.routePulseCount==0||this.routePulseCount>=25){
                        this.routePulseCount=1;
                        if(mainCar){
                            this.$parent.routeData = mainCar;
                        }
                    }
                    this.routePulseCount++;

                    if(this.canPulseCount==0||this.canPulseCount>=10){
                        this.canPulseCount=1;
                        if(processData.canList.length>0){
                            let canData = processData.processCanData(result.timestamp,delayTime);
                            if(canData){
                                this.canData = canData;
                                this.$parent.canData=canData;
                            }
                        }
                    }
                    this.canPulseCount++;
                }

                //感知车 缓存+80ms调用一次
                if(this.perCacheCount>pulseNum&&(this.perPulseCount==0||this.perPulseCount>2)){
                    this.perPulseCount=1;
                    if(Object.keys(perceptionCars.devObj).length>0){
                        let processPerCar = perceptionCars.processPerTrack(result.timestamp,delayTime);
//                        this.processPerData(processPerCar);
                    }
                }
                this.perPulseCount++;

                //红绿灯  缓存+1200ms调用一次
                if(this.spatCount>=pulseNum&&(this.spatPulseCount==0||this.spatPulseCount>10)){
//                    console.log(this.spatPulseCount);
                    this.spatPulseCount=1;
                    if(Object.keys(processData.spatObj).length>0){
//                            console.log("spatPulseCount:"+this.spatPulseCount)
                        let spatData = processData.processSpatData(result.timestamp,delayTime);
//                        console.log("*************");
//                        console.log(spatData)
                        this.drawnSpat(spatData);
                    }
                }
                this.spatPulseCount++;

                //执行告警
                if(this.warningCacheCount>pulseNum&&(this.warningPulseCount==0||this.warningPulseCount>10)){
                    this.warningPulseCount=1;
                    if(Object.keys(processData.dynamicWarning).length>0){
                        this.warningExist = [];
                        for(let warnId in processData.dynamicWarning){
                            let data = processData.processWarningData(result.timestamp,this.delayTime,warnId);
                            if(data){
                                this.warningExist.push(warnId);
                                this.processWarn(data);
                                //计算两点间的距离
//                                if(mainCar){
//                                    let s = this.computeDistance(mainCar,data);
////                                    console.log(s);
//                                    this.processWarn(data,s);
//                                }
                            }
                        }
                        if(this.warningExist.length>0){
                            if(Object.keys(this.warningData).length>0){
                                for(let warnId in this.warningData){
                                    //如果历史告警不存在  进行删除
                                    if(this.warningExist.indexOf(warnId)==-1){
                                        delete this.warningData[warnId];
//                                        console.log("移除："+warnId)
                                        gis3d.remove3DInforLabel(warnId);
                                    }
                                }
                            }
                        }
                    }
                }
                this.warningPulseCount++;

                //执行静态告警
                if(this.staticCacheCount>pulseNum&&(this.staticPulseCount==0||this.staticPulseCount>10)){
                    this.staticPulseCount=1;
                    //静态事件的处理
                    if(Object.keys(processData.staticWarning).length>0){
                        let staticData = processData.processStaticData(result.timestamp,this.delayTime);
                        if(staticData&&staticData.length>0){
//                                console.log("length:"+staticData.length)
                            this.staticExist.push.apply(this.staticExist,staticData);
                            //静态事件
                            staticData.forEach(item=>{
//                                let s = this.computeDistance(mainCar,item);
//                                console.log("**********"+s);
                                //起始与车的距离计算
                                this.processWarn(item);
                            })
                        }
                    }
                }
                this.staticPulseCount++;

            },
            computeDistance(mainCar,warningItem){
                let lat1 = mainCar.latitude;
                let lat2 = warningItem.latitude;
                let lng1 = mainCar.longitude;
                let lng2 = warningItem.longitude;
                let radLat1 = lat1*Math.PI / 180.0;
                let radLat2 = lat2*Math.PI / 180.0;
                let a = radLat1 - radLat2;
                let  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
                let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
                    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
                s = s *6378.137 ;// EARTH_RADIUS;
                s = parseInt(Math.round(s * 10000) / 10);
                return s;
            },
            processTab(){
                if(document.visibilityState == "hidden") {
                    this.tabIsExist=false;
                } else if (document.visibilityState == "visible") {
                    this.tabIsExist=true;
                }
            },

            getExtend(x,y,r){
                let currentExtent=[];
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                currentExtent.push([x1, y0]);
                currentExtent.push([x0, y0]);
                currentExtent.push([x0, y1/2]);
                currentExtent.push([x1, y1/2]);
                return currentExtent;
            },
        },
        mounted(){
            this.getDeviceInfo();

            gis3d.initload("cesiumContainer",true);
            perceptionCars.viewer=gis3d.cesium.viewer;

            platCars.cacheAndInterpolateDataByVid = {},
                platCars.models={};
            platCars.viewer = gis3d.cesium.viewer;

            this.delayTime= parseFloat(this.$route.query.delayTime).toFixed(3)*1000;
            this.onMapComplete();
            //判断当前标签页是否被隐藏
            document.addEventListener("visibilitychange",this.processTab);

            platCars.sideList = sessionStorage.getItem("sideList");

//            this.initLightWebSocket();
        },
        watch: {
            '$route':{
                handler(newValue, oldValue) {
                    this.isCapture = newValue.query.isCapture;
                    if(this.isCapture=='true'){
                        document.addEventListener('keyup',this.capture);
                    }else{
                        document.removeEventListener('keyup', this.capture);
                        this.perCaptureList=[];
                        this.spatCaptureList=[];
                        this.warnCaptureList=[];
                        this.platCaptureList=[];
                    }
                },
                immediate: true,
//                deep: true
            }
        },
        components:{
            LivePlayer
        },
        filters: {
            dateFormat: function (value) {
                if(value!=''){
                    let time = DateFormat.formatTime(value,'yy-mm-dd hh:mm:ss:ms');
                    return time;
                }
            }
        },
        beforeDestroy(){
            console.log("单车页面销毁");
            //释放定时器
            for(let key in this.timeObj){
                clearTimeout(this.timeObj[key]);
            }
            this.spatWebsocket&&this.spatWebsocket.webSocket.close();
            this.platformWebsocket&&this.platformWebsocket.webSocket.close();
            this.warningWebsocket&&this.warningWebsocket.webSocket.close();
            this.perceptionWebsocket&&this.perceptionWebsocket.webSocket.close();
            this.pulseWebsocket&&this.pulseWebsocket.webSocket.close();
            this.cancelWarningWebsocket&&this.cancelWarningWebsocket.webSocket.close();
            this.canWebSocket&&this.canWebSocket.webSocket.close();
//            gis3d=null;
//            perceptionCars = null;
//            platCars = null;

        },
    }
</script>
<style>
    .fusion-video .vjs-error .vjs-error-display:before{
        font-size: 3em;
        color: #ccc;
        top:60%;
        display: none;
    }
    .fusion-video .vjs-modal-dialog-content{
        padding-top:50px!important;
    }
    .fusion-video .vjs-custom-skin > .video-js .vjs-big-play-button{
        font-size: 0.5em!important;
    }
    .fusion-video .video-js{
        height: 180px!important;
    }
</style>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .map-right {
        width: 270px;
        padding-top: 20px !important;
    }
    .fusion-video{
        border:1px solid rgba(211, 134, 0, 0.5);
        margin: 20px 0px;
        height: 184px;
        box-sizing: border-box;
        /* padding-top: 10px;*/
    }
    .video-position{
        @include layoutMode(both);
        height:100%;
        background: #000000;
    }

    .travel-detail{
        position: absolute;
        transform: translate(-50%,0);
        margin-left:50%;
        bottom: 240px;
        font-size: 20px;
        letter-spacing: 0px;
        z-index:1;
        .detail1{
            display: inline-block;
            padding:5px 10px;
            .detail2{
                color: #37ba7b;
                display: inline-block;
                padding: 0px 2px;
            }
        }
    }
    .single-car {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
    }
</style>