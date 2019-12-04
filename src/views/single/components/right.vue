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
        <div class="c-pulse-time" >{{processTime|dateFormat}}</div>
        <div class="c-map" id="cesiumContainer">
        </div>
        <div class="travel-detail">
            <div class="detail1">
                <span>{{realData.longitude? realData.longitude.toFixed(8):'--'}}</span>
                <span class="detail2">E</span>
            </div>
            <div class="detail1">
                <span>{{realData.latitude ?realData.latitude.toFixed(8):'--'}}</span>
                <span class="detail2">N</span>
            </div>
            <div class="detail1">
                <span>{{realData.speed?realData.speed.toFixed(1):'--'}}</span>
                <span class="detail2">km/h</span>
            </div>
            <div class="detail1">
                <span>{{realData.headingAngle?realData.headingAngle.toFixed(1):'--'}}</span>
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
                webSocket:null,

                alertCount:0,
                warningData:{},
                lastLightObj:{},

                lightList:[],
                requestVideoUrl:startStream,
                forwardParam:{},
                inParam:{},
                forwardShow:false,
                inShow:false,
                timeObj:{},
                spatConnectCount:0,
                warningConnectCount:0,
                platformConnectCount:0,
                cancelConnectCount:0,
                perceptionConnectCount:0,
                pulseConnectCount:0,
                routeConnectCount:0,

                processDataTime:'',
                pulseNowTime:'',
                pulseCount:0,
                delayTime:'',
                spatPulseCount:0,
                routePulseCount:0,
                pulseInterval:40,

                tabIsExist:true

            }

        },
        computed:{
            nowYear(){
                if(this.realData.gpsTime==''){
                    return '--';
                }else{
                    return this.$dateUtil.formatTime(this.realData.gpsTime).split(" ")[0];
                }
            },
            nowTime(){
                if(this.realData.gpsTime==''){
                    return '--';
                }else{
                    return this.$dateUtil.formatTime(this.realData.gpsTime).split(" ")[1];
                }
            }
        },
        props:{
            realData:{
                type:Object,
                default(){
                    return {

                    };
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
                    'camId':item.serialNum,
                    'protocal':item.protocol
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
                gis3d.updateCameraPosition(window.defaultSingleParam.x,window.defaultSingleParam.y,window.defaultSingleParam.z,70,-0.2369132859032279, 0.0029627735803421373);
                //初始化车辆步长以及平台车阀域范围
                platCars.stepTime = this.pulseInterval;
                platCars.pulseInterval = this.pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
                platCars.platMaxValue = platCars.pulseInterval*1.5;

                perceptionCars.stepTime = this.pulseInterval;
                perceptionCars.pulseInterval = parseInt(this.pulseInterval)*0.8;
                perceptionCars.perMaxValue = perceptionCars.pulseInterval*1.5;

                let spatPulse = this.pulseInterval*30;
                processData.spatPulseInterval = spatPulse*0.8;
                processData.spatMaxValue =  processData.pulseInterval*1.5;

                let routePulse = this.pulseInterval*25;
                processData.routePulseInterval = routePulse*0.8;
                processData.routeMaxValue =  processData.routePulseInterval*1.5;

                this.initPulseWebSocket();
            },

            //红绿灯
            initSpatWebSocket(){
                let _this=this;
                try {
                    if ('WebSocket' in window){
                        _this.spatWebsocket = new WebSocket(window.config.socketTestUrl);  //获得WebSocket对象
                        _this.spatWebsocket.onmessage = _this.onSpatMessage;
                        _this.spatWebsocket.onclose = _this.onSpatClose;
                        _this.spatWebsocket.onopen = _this.onSpatOpen;
                        _this.spatWebsocket.onerror = _this.onSpatError;
                    }
                    else{
                        _this.$message("此浏览器不支持websocket")
                    }
                } catch (e) {
                    _this.spatReconnect();
                }


            },
            onSpatMessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let data = json.result.spatDataDTO;
                processData.receiveLightData(data);
//                _this.processSpat(data);
//                let vehData = json.result.vehDataStat;
//                _this.$emit("getPerceptionData",vehData);
//                _this.vehData.push(vehData);
            },
            onSpatClose(data){
                console.log("红绿灯结束连接");
                this.spatReconnect();
            },
            onSpatError(){
                console.log("红绿灯连接error");
                this.spatReconnect();
            },
            onSpatOpen(data){
                //旁车
                let spat = {
                    "action":"spat",
                    "vehicleId":"B21E0002",
                    "type":1
                }
                let spatMsg = JSON.stringify(spat);
                this.sendSpatMsg(spatMsg);
            },
            sendSpatMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.spatWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.spatWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            spatReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.spatConnectCount>=10){
                    return;
                }
                this.initSpatWebSocket();
                //重连不能超过5次
                this.spatConnectCount++;
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
                        let img1;
                        let img2;
                        let img3;
                        let lastItem;
//                            let keys = Object.keys(_this.lastLightObj);
//                            if(keys&&keys.length>0){
//                                lastItem = _this.lastLightObj[item.spatId];
//                            }
                        //cross
                        if(item.direction==1){
                            //cross red
                            if(item.light=='RED'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/cross-red.png';
                                }
                                img1='./static/images/light/cross-red.png';
                                img2 = _this.getNumPng('RED',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('RED',array[1]);
                                }
                            }
                            //cross yellow
                            if(item.light=='YELLOW'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/cross-yellow.png';
                                }
                                img2 = _this.getNumPng('YELLOW',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('YELLOW',array[1]);
                                }
                            }
                            //cross green
                            if(item.light=='GREEN'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/cross-green.png';
                                }
                                img2 = _this.getNumPng('GREEN',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('GREEN',array[1]);
                                }
                            }
                        }
                        //left
                        if(item.direction==2){
                            //left red
                            if(item.light=='RED'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/left-red.png';
                                }
                                img2 = _this.getNumPng('RED',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('RED',array[1]);
                                }
                            }
                            //left yellow
                            if(item.light=='YELLOW'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/left-yellow.png';
                                }
                                img2 = _this.getNumPng('YELLOW',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('YELLOW',array[1]);
                                }
                            }
                            //left green
                            if(item.light=='GREEN'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/left-green.png';
                                }
                                img2 = _this.getNumPng('GREEN',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('GREEN',array[1]);
                                }
                            }
                        }
                        //turn
                        if(item.direction==3){
                            //turn red
                            if(item.light=='RED'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/turn-red.png';
                                }
                                img2 = _this.getNumPng('RED',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('RED',array[1]);;
                                }
                            }
                            //turn yellow
                            if(item.light=='YELLOW'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/turn-yellow.png';
                                }
                                img2 = _this.getNumPng('YELLOW',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('YELLOW',array[1]);;
                                }
                            }
                            //turn green
                            if(item.light=='GREEN'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/turn-green.png';
                                }
                                img2 = _this.getNumPng('GREEN',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('GREEN',array[1]);
                                }
                            }
                        }
                        //right
                        if(item.direction==4){
                            //right red
                            if(item.light=='RED'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/right-red.png';
                                }
                                img2 = _this.getNumPng('RED',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('RED',array[1]);
                                }
                            }
                            //right yellow
                            if(item.light=='YELLOW'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/right-yellow.png';
                                }
                                img2 = _this.getNumPng('YELLOW',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('YELLOW',array[1]);
                                }
                            }
                            //right green
                            if(item.light=='GREEN'){
                                //每个路灯相位都是固定的
                                if(lastItem&&lastItem.light==item.light){
                                    img1="";
                                }else{
                                    img1='./static/images/light/right-green.png';
                                }
                                img2 = _this.getNumPng('GREEN',array[0]);
                                if(array[1]){
                                    img3 = _this.getNumPng('GREEN',array[1]);
                                }
                            }
                        }
                        light.id=item.spatId;
                        light.img1=img1;
                        light.img2=img2;
                        light.img3=img3;
                        _this.lastLightObj[item.spatId]=item;
                        // _this.$refs.perceptionMap.addStaticModel_light_1(light);
                        //地图渲染剩余时间
                    })
                }
            },
            getNumPng(color,num){
                let img;
                if(color=='RED'){
                    if(num==0){
                        img='./static/images/light/0.png'
                    }
                    if(num==1){
                        img='./static/images/light/1.png'
                    }
                    if(num==2){
                        img='./static/images/light/2.png'
                    }
                    if(num==3){
                        img='./static/images/light/3.png'
                    }
                    if(num==4){
                        img='./static/images/light/4.png'
                    }
                    if(num==5){
                        img='./static/images/light/5.png'
                    }
                    if(num==6){
                        img='./static/images/light/6.png'
                    }
                    if(num==7){
                        img='./static/images/light/7.png'
                    }
                    if(num==8){
                        img='./static/images/light/8.png'
                    }
                    if(num==9){
                        img='./static/images/light/9.png'
                    }
                }
                if(color=='YELLOW'){
                    if(num==0){
                        img='./static/images/light/0-2.png'
                    }
                    if(num==1){
                        img='./static/images/light/1-2.png'
                    }
                    if(num==2){
                        img='./static/images/light/2-2.png'
                    }
                    if(num==3){
                        img='./static/images/light/3-2.png'
                    }
                    if(num==4){
                        img='./static/images/light/4-2.png'
                    }
                    if(num==5){
                        img='./static/images/light/5-2.png'
                    }
                    if(num==6){
                        img='./static/images/light/6-2.png'
                    }
                    if(num==7){
                        img='./static/images/light/7-2.png'
                    }
                    if(num==8){
                        img='./static/images/light/8-2.png'
                    }
                    if(num==9){
                        img='./static/images/light/9-2.png'
                    }
                }
                if(color=='GREEN'){
                    if(num==0){
                        img='./static/images/light/0-1.png'
                    }
                    if(num==1){
                        img='./static/images/light/1-1.png'
                    }
                    if(num==2){
                        img='./static/images/light/2-1.png'
                    }
                    if(num==3){
                        img='./static/images/light/3-1.png'
                    }
                    if(num==4){
                        img='./static/images/light/4-1.png'
                    }
                    if(num==5){
                        img='./static/images/light/5-1.png'
                    }
                    if(num==6){
                        img='./static/images/light/6-1.png'
                    }
                    if(num==7){
                        img='./static/images/light/7-1.png'
                    }
                    if(num==8){
                        img='./static/images/light/8-1.png'
                    }
                    if(num==9){
                        img='./static/images/light/9-1.png'
                    }
                }
                return img;

            },

            //告警
            initWarningWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.warningWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                        _this.warningWebsocket.onmessage = _this.onWarningMessage;
                        _this.warningWebsocket.onclose = _this.onWarningClose;
                        _this.warningWebsocket.onopen = _this.onWarningOpen;
                        _this.warningWebsocket.onerror = _this.onWarningError;
                    }else {
                        _this.$message("此浏览器不支持websocket")
                    }
                }catch (e){
                    _this.warningReconnect();
                }

            },
            onWarningMessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                if(_this.isCapture=='true'){
                    if(_this.captureCount>1000){
                        return;
                    }
                    _this.warnCaptureList.push(json)
                    return;
                };
                this.processWarn(json);
            },
            onWarningClose(data){
                console.log("结束连接");
                this.warningReconnect();
            },
            onWarningError(){
                console.log("告警连接error");
                this.warningReconnect();
            },
            onWarningOpen(data){
                //旁车
                let warning = {
                    "action": "warning",
                    "vehicleId": this.vehicleId
                }
                let warningMsg = JSON.stringify(warning);
                this.sendWarningMsg(warningMsg);
            },
            sendWarningMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.warningWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.warningWebsocket.send(msg); //send()发送消息
                        console.log("warning已发送消息:"+ msg);
                    }
                }else{
                    return;
                }
            },
            warningReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.warningConnectCount>=10){
                    return;
                }
                this.initWarningWebSocket();
                //重连不能超过5次
                this.warningConnectCount++;
            },
            processWarn(json){
                let _this = this;
                let warningData = json.result.data;
                let type = json.result.type;
                let warningId;
                if(type=='CLOUD'){
                    warningData.forEach(item=>{
                        warningId = item.warnId;
                        warningId = warningId.substring(0,warningId.lastIndexOf("_"));
                        //如果告警id不存在
                        if(!_this.warningData[warningId]){
                            _this.warningCount++;
                            _this.warningData[warningId] = {
                                warningId: warningId,
                                id:'alert'+_this.alertCount,
                                msg:item.warnMsg,
                                longitude:item.longitude,
                                latitude:item.latitude,
                                timer:null

                            }
                            _this.alertCount++;

                            gis3d.add3DInfoLabel(_this.warningData[warningId].id,_this.warningData[warningId].msg,_this.warningData[warningId].longitude,_this.warningData[warningId].latitude,20);
                        }else{
                            //判断是否需要更新
                            if(item.longitude != _this.warningData[warningId].longitude || item.latitude != _this.warningData[warningId].latitude) {
                                gis3d.remove3DInforLabel(_this.warningData[warningId].id);

                                gis3d.add3DInfoLabel(_this.warningData[warningId].id,_this.warningData[warningId].msg,_this.warningData[warningId].longitude,_this.warningData[warningId].latitude,20);
                            }
                        }
                        clearTimeout(_this.warningData[warningId].timer);
                        _this.warningData[warningId].timer = setTimeout(()=>{
                            gis3d.remove3DInforLabel(_this.warningData[warningId].id);
                            if(_this.warningCount > 0) {
                                _this.warningCount--;
                            }
                            _this.$parent.warningCount = _this.warningCount;
                            console.log("移除事件")
                            delete _this.warningData[warningId];
                        },2000);
                    })
                    //此次告警结束，将总数传递出去
                    _this.$parent.warningCount = _this.warningCount;
                }
            },

            //平台车
            initPlatformWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.platformWebsocket = new WebSocket(window.config.socketTestUrl);  //获得WebSocket对象
//                        _this.platformWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                        _this.platformWebsocket.onmessage = _this.onPlatformMessage;
                        _this.platformWebsocket.onclose = _this.onPlatformClose;
                        _this.platformWebsocket.onopen = _this.onPlatformOpen;
                        _this.platformWebsocket.onerror=_this.onPlatformError;
                    }else{
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.platformReconnect();
                }

            },
            onPlatformMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                if(_this.tabIsExist){
                    platCars.receiveData(json,this.pulseNowTime,_this.vehicleId);
                }
            },
            onPlatformClose(data){
                console.log("平台车结束连接");
                this.platformReconnect();
            },
            onPlatformError(){
                console.log("平台车连接error");
                this.platformReconnect();
            },
            onPlatformOpen(data){

                let platform ={
                    "action": "vehicle",
                    "body": {
                        "vehicleId": this.vehicleId
                    },
                    "type": 2
                }
                //旁车
//                let platform = {
//                    "action": "sideVehicle",
//                    "vehicleId": this.vehicleId
//                }
                let platformMsg = JSON.stringify(platform);
                this.sendPlatformMsg(platformMsg);
            },
            sendPlatformMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.platformWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.platformWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            platformReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.platformConnectCount>=10){
                    return;
                }
                this.initPlatformWebSocket();
                //重连不能超过5次
                this.platformConnectCount++;
            },


            //融合车
            initPerceptionWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.perceptionWebsocket = new WebSocket(window.config.socketTestUrl);  //获得WebSocket对象
//                        _this.perceptionWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                        _this.perceptionWebsocket.onmessage = _this.onPerceptionMessage;
                        _this.perceptionWebsocket.onclose = _this.onPerceptionClose;
                        _this.perceptionWebsocket.onopen = _this.onPerceptionOpen;
                        _this.perceptionWebsocket.onerror= _this.onPerceptionError;
                    }else{
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.perceptionReconnect();
                }

            },
            onPerceptionMessage(mesasge){
                let _this=this;
                /*  console.log("########");
                  console.log(_this.tabIsExist);*/
                if(_this.tabIsExist){
                    let data = JSON.parse(mesasge.data)
                    let sideList = data.result.perList;
                    perceptionCars.receiveData(sideList);
                }
            },
            onPerceptionClose(data){
                console.log("感知车结束连接");
                this.perceptionReconnect();
            },
            onPerceptionError(){
                console.log("感知车连接error");
                this.perceptionReconnect();
            },
            onPerceptionOpen(data){
                let perception ={
                    "action":"road_real_data_per",
                    "data":{
                        "type":2,
                        "vehicleId":"B21E0005"
                    }
                }
                let perceptionMsg = JSON.stringify(perception);
                this.sendPerceptionMsg(perceptionMsg);
            },
            sendPerceptionMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.perceptionWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.perceptionWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            perceptionReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.perceptionConnectCount>=10){
                    return;
                }
                this.initPerceptionWebSocket();
                //重连不能超过5次
                this.perceptionConnectCount++;
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

            //行程
            initRouteWebSocket(){
                // debugger
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.webSocket = new WebSocket(window.config.socketTestUrl);  //获得WebSocket对象
                        _this.webSocket.onmessage = _this.onRouteMessage;
                        _this.webSocket.onclose = _this.onRouteClose;
                        _this.webSocket.onopen = _this.onRouteOpen;
                        _this.webSocket.onerror = _this.onRouteError;
                    }else {
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch(e){
                    _this.routeReconnect();
                }

            },
            onRouteMessage(message){
                let json = JSON.parse(message.data);
                let result = json.result;
                processData.receiveRouteData(result);
            },
            onRouteClose(data){
                console.log("行程结束连接");
                this.routeReconnect();
            },
            onRouteError(){
                console.log("行程结束error");
                this.routeReconnect();
            },
            onRouteOpen(data){
                //行程
                let route ={
                    "action":"vehicle",
                    "body":{
                        "vehicleId": this.vehicleId
                    },
                    "type": 1
                }
                this.sendMsg(JSON.stringify(route));
            },
            sendMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.webSocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            routeReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.routeConnectCount>=10){
                    return;
                }
                this.initWebSocket();
                this.routeConnectCount++;
            },

            //脉冲
            initPulseWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.pulseWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                        _this.pulseWebsocket.onmessage = _this.onPulseMessage;
                        _this.pulseWebsocket.onclose = _this.onPulseClose;
                        _this.pulseWebsocket.onopen = _this.onPulseOpen;
                        _this.pulseWebsocket.onerror= _this.onPulseError;
                    }else{
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.pulseReconnect();
                }

            },
            onPulseMessage(mesasge){
                let json = JSON.parse(mesasge.data);
                let result = json.result;
                if(this.pulseNowTime==''){
                    this.initPlatformWebSocket();
//                    this.initPerceptionWebSocket();
//                    this.initWarningWebSocket();
//                    this.initSpatWebSocket();
//                    this.initRouteWebSocket();
                }
                this.pulseNowTime = result.timestamp;
                this.pulseCount++;
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
                            console.log(vehicleId+"————————"+platCars.cacheAndInterpolateDataByVid[vehicleId].cacheData.length)
                        }
                    }
                }
             /*   if (Object.keys(perceptionCars.devObj).length > 0) {
                    for (let devId in perceptionCars.devObj) {
                        let devList = perceptionCars.devObj[devId];
                        /!*console.log("*****")
                        console.log(vehicleId,dataList.length)*!/
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
                let pulseNum = this.delayTime*2/40;
                let delayTime = this.delayTime*2*0.6;
                console.log(pulseNum)
                if(this.pulseCount>=pulseNum) {
                    //当平台车开始插值时，调用其他接口
                    this.processDataTime = result.timestamp-delayTime;
//                    console.log(this.pulseCount,this.pulseCount%3,Object.keys(perceptionCars.devObj).length);
                    if(Object.keys(perceptionCars.devObj).length>0){
                        let processPerCar = perceptionCars.processPerTrack(result.timestamp,delayTime);
//                        this.processPerData(processPerCar);

                    }
                    if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
                        platCars.processPlatformCarsTrack(result.timestamp,delayTime);
                    }
                    if(this.spatPulseCount==0||this.spatPulseCount>=30){
                        console.log(this.spatPulseCount);
                        this.spatPulseCount=1;
                        if(Object.keys(processData.spatObj).length>0){
//                            console.log("spatPulseCount:"+this.spatPulseCount)
                            let spatData = processData.processSpatData(result.timestamp,delayTime);
                            this.drawnSpat(spatData);
                        }
                    }
                    if(this.routePulseCount==0||this.routePulseCount>=25){
                        console.log("-------------"+this.routePulseCount);
                        this.routePulseCount=1;
                        if(processData.routeList.length>0){
//                            console.log("spatPulseCount:"+this.spatPulseCount)
                            let routeData = processData.processRouteData(result.timestamp,delayTime);
                            this.$parent.routeData=routeData;
                        }
                    }
                    this.spatPulseCount++;
                    this.routePulseCount++;
                }*/
            },
            onPulseClose(data){
                console.log("感知车结束连接");
                this.pulseReconnect();
            },
            onPulseError(){
                console.log("感知车连接error");
                this.PulseReconnect();
            },
            onPulseOpen(data){
                //旁车
                let pulse = {
                    "action":"pulse",
                    "data":{
//                        "frequency":39
                        "frequency":this.pulseInterval
                    }
                }
                let pulseMsg = JSON.stringify(pulse);
                this.sendPulseMsg(pulseMsg);
            },
            sendPulseMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.pulseWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.pulseWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            pulseReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.pulseConnectCount>=10){
                    return;
                }
                this.initPulseWebSocket();
                //重连不能超过5次
                this.pulseConnectCount++;
            },

            processTab(){
                if(document.visibilityState == "hidden") {
                    this.tabIsExist=false;
                } else if (document.visibilityState == "visible") {
                    this.tabIsExist=true;
                }
            },
        },
        mounted(){
            this.getDeviceInfo();

            gis3d.initload("cesiumContainer",true);
            perceptionCars.viewer=gis3d.cesium.viewer;

            platCars.cacheAndInterpolateDataByVid = {},
            platCars.models={};
            platCars.processPlatformCarsTrack(gis3d.cesium.viewer);
            this.delayTime= parseFloat(this.$route.query.delayTime).toFixed(3)*1000;
            this.onMapComplete();
            //判断当前标签页是否被隐藏
            document.addEventListener("visibilitychange",this.processTab);

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
            this.spatWebsocket&&this.spatWebsocket.close();
            this.platformWebsocket&&this.platformWebsocket.close();
            this.warningWebsocket&&this.warningWebsocket.close();
            this.perceptionWebsocket&&this.perceptionWebsocket.close();
            this.pulseWebsocket&&this.pulseWebsocket.close();
            this.webSocket&&this.webSocket.close();
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
        bottom: 10px;
        font-size: 16px;
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
</style>