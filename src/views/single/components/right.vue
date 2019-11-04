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
        <div class="map-real-time" >{{processTime|dateFormat}}</div>
        <!--<div class="map-time">{{processTime|dateFormat}}</div>
        <div class="map-time map-time1">{{lightTime|dateFormat}}</div>-->
        <div class="c-map">
            <tusvn-map :target-id="'mapMonitor'" ref="tusvnMap"
                       background="mapParam.background" minX="mapParam.minX"   minY="mapParam.minY" minZ="mapParam.minZ"
                       maxX="mapParam.maxX"  maxY="mapParam.maxY"  maxZ="mapParam.maxZ"
                       @mapcomplete="onMapComplete" @pcarDataTime="getProcessTime">
            </tusvn-map>
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
    import TusvnMap from '@/components/Tusvn3DMap3'
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    export default {
        data() {
            return {
                vehicleId:this.$route.params.vehicleId,
                spatWebsocket:null,
                warningWebsocket:null,
                carWebsocket:null,
                sideCarWebsocket:null,
                alertCount:0,
                warningData:{},
                lastLightObj:{},
                processTime:'',
                lightTime:'',
                lightList:[],
                warningList:[],
                cacheLength:0,
                mapParam:{},
                requestVideoUrl:startStream,
                forwardParam:{},
                inParam:{},
                forwardShow:false,
                inShow:false,
                timeObj:{},
                spatConnectCount:0,
                warningConnectCount:0,
                carConnectCount:0,
                cancelConnectCount:0,
                sideConnectCount:0,
                testCount:0
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
            getProcessTime(time1,time2){
                let _this = this;
                _this.processTime=time2;
                if(_this.lightList.length>0){
                    let message = _this.lightList.shift();
                    let json = JSON.parse(message.data);

                    _this.cacheLength = _this.lightList.length;
                    let time = Math.abs(time2-json.time);
//                    console.log(time,time1,time2,json.time);
                    let data = json.result.spatDataDTO;
                    let resultData=[];
                    if(time<1000&&data&&data.length>0){
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
//                        _this.lastLightObj[item.spatId]=item;
//                            console.log(light);
                            _this.$refs.tusvnMap.addStaticModel_light_1(light);

                        })
                    }
                }
                /*if(_this.warningList.length>0){
                    let warningMessage = _this.warningList.shift();
                    let warningJson = JSON.parse(warningMessage.data);
                    let warningData = warningJson.result.data;
                    let type = warningJson.result.type;
                    let warningTime = Math.abs(time2-warningJson.time);
                    _this.lightTime = warningJson.time;
                    let warningId;
//                    console.log(_this.lightTime,warningTime)
                    if(type=='CLOUD'){
                        warningData.forEach(item=>{
                            warningId = item.warnId;
                            warningId = warningId.substring(0,warningId.lastIndexOf("_"));
//                            console.log("距离："+item.dis);
                            let msg = item.warnMsg;
                            let warningObj={
                                longitude:item.longitude,
                                latitude:item.latitude
                            }
                            let warningHash = _this.hashcode(JSON.stringify(warningObj));
                            //如果告警id不存在
                            if(!_this.warningData[warningId]){
                                let obj = {
                                    id:'alert'+_this.alertCount,
                                    msg:msg,
                                    longitude:item.longitude,
                                    latitude:item.latitude,
                                    hash:warningHash,
                                    warningObj:warningObj,
                                    dist:item.dis

                            }
                                _this.warningData[warningId]=obj;
                                _this.alertCount++;
                                _this.$refs.tusvnMap.add3DInfoLabel(obj.id,obj.msg,obj.longitude,obj.latitude,20);
                            }else{
                                //判断是否需要更新
                                let obj = _this.warningData[warningId];

                                    _this.$refs.tusvnMap.removeModel(obj.id);
                                    _this.$refs.tusvnMap.add3DInfoLabel(obj.id,msg,obj.longitude,obj.latitude,20);

                            }
                        })
                    }
                 }*/
            },
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
                this.$refs.tusvnMap.updateCameraPosition(window.defaultSingleParam.x,window.defaultSingleParam.y,window.defaultSingleParam.z,window.defaultSingleParam.radius,window.defaultSingleParam.pitch,window.defaultSingleParam.yaw);
                /*this.$refs.tusvnMap1.updateCameraPosition(cameraParam.x,cameraParam.y,cameraParam.z,cameraParam.radius,cameraParam.pitch,cameraParam.yaw);
                this.$refs.tusvnMap1.changeRcuId(window.config.websocketUrl,this.roadItem1.camSerialNum);*/
                this.initCarWebSocket();
                this.initSideCarWebSocket();
                this.initSpatWebSocket();
                this.initWarningWebSocket();
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
            //红绿灯
            initSpatWebSocket(){
                let _this=this;
                try {
                    if ('WebSocket' in window){
                        _this.spatWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
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
            onSpatMessage(message){
                let _this=this;
                _this.lightList.push(message);
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
                    "action": "road_real_data_spat",
                    "data": {
                        /*"polygon": [
                            [121.17979423666091, 31.279518991604288],
                            [121.16305725240798, 31.279518991604288],
                            [121.16305725240798, 31.289571910992105],
                            [121.17979423666091, 31.289571910992105]
                        ]*/
                        "polygon":[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]]
                    }
                }
                let spatMsg = JSON.stringify(spat);
                this.sendSpatMsg(spatMsg);
            },
            sendSpatMsg(msg){
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
            onWarningMessage(mesasge){let _this=this;
                let json = JSON.parse(mesasge.data);
                let warningData = json.result.data;
                let type = json.result.type;
                let warningId;
                if(type=='CLOUD'){
                    warningData.forEach(item=>{
                        warningId = item.warnId;
                        warningId = warningId.substring(0,warningId.lastIndexOf("_"));
                        //如果告警id不存在
                        if(!_this.warningData[warningId]){
                            _this.warningData[warningId] = {
                                warningId: warningId,
                                id:'alert'+_this.alertCount,
                                msg:item.warnMsg,
                                longitude:item.longitude,
                                latitude:item.latitude,
                                timer:null

                            }
                            _this.alertCount++;

                            _this.$refs.tusvnMap.add3DInfoLabel(_this.warningData[warningId].id,_this.warningData[warningId].msg,_this.warningData[warningId].longitude,_this.warningData[warningId].latitude,20);
                        }else{
                            //判断是否需要更新
                            if(item.longitude != _this.warningData[warningId].longitude || item.latitude != _this.warningData[warningId].latitude) {
                                _this.$refs.tusvnMap.removeModel(_this.warningData[warningId].id);

                                _this.$refs.tusvnMap.add3DInfoLabel(_this.warningData[warningId].id,_this.warningData[warningId].msg,_this.warningData[warningId].longitude,_this.warningData[warningId].latitude,20);
                            }
                        }
                        // clearTimeout(_this.warningData[warningId].timer);
                        // _this.warningData[warningId].timer = setTimeout(()=>{
                        //     if(_this.$refs.tusvnMap) {
                        //         _this.$refs.tusvnMap.removeModel(_this.warningData[warningId].id);
                        //         console.log("移除事件")
                        //         delete _this.warningData[warningId];
                        //     }
                        // },2000);
                    })
                }
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
            //平台车
            initCarWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.carWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                        _this.carWebsocket.onmessage = _this.onCarMessage;
                        _this.carWebsocket.onclose = _this.onCarClose;
                        _this.carWebsocket.onopen = _this.onCarOpen;
                        _this.carWebsocket.onerror = _this.onCarError;
                    }else{
                        _this.$message("此浏览器不支持websocket")
                    }
                }catch(e){
                    _this.carReconnect();
                }
            },
            onCarMessage(message){
                let _this = this;
                _this.$refs.tusvnMap.onCarTrackMessage(message);
            },
            onCarClose(data){
                console.log("结束连接");
                this.carReconnect();
            },
            onCarError(){
                console.log("平台车连接error");
                this.carReconnect();
            },
            onCarOpen(data){
                //旁车
                let car = {
                    "action": "sideVehicle",
                    "vehicleId": this.vehicleId
                }
                let carMsg = JSON.stringify(car);
                this.sendCarMsg(carMsg);
            },
            sendCarMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.carWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.carWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            carReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.carConnectCount>=10){
                    return;
                }
                this.initCarWebSocket();
                //重连不能超过5次
                this.carConnectCount++;
            },
            //融合车
            initSideCarWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.sideCarWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                        _this.sideCarWebsocket.onmessage = _this.onSideCarMessage;
                        _this.sideCarWebsocket.onclose = _this.onSideCarClose;
                        _this.sideCarWebsocket.onopen = _this.onSideCarOpen;
                        _this.sideCarWebsocket.onerror=_this.onSideCarError;
                    }else{
                        _this.$message("此浏览器不支持websocket")
                    }
                }catch (e){
                    _this.sideCarReconnect();
                }

            },
            onSideCarMessage(message){
                let _this = this;
                _this.$refs.tusvnMap.onCarTrackMessage(message);
                /* if(_this.testCount==0){
                     _this.testCount=1;
                     setTimeout(()=>{
                         _this.sideCarWebsocket.close();
                     },5000)
                 }*/
            },
            onSideCarClose(data){
                console.log("旁车结束连接");
                this.sideCarReconnect();
            },
            onSideCarError(){
                console.log("旁车连接error");
                this.sideCarReconnect();
            },
            onSideCarOpen(data){
                //旁车
                let sideCar = {
                    "action": "fusel_sider_per_veh",
                    "vehicleId": this.vehicleId
                }
                let sideCarMsg = JSON.stringify(sideCar);
                this.sendSideCarMsg(sideCarMsg);
            },
            sendSideCarMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.sideCarWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.sideCarWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            sideCarReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.sideConnectCount>=10){
                    return;
                }
                this.initSideCarWebSocket();
                //重连不能超过5次
                this.sideConnectCount++;
            }
        },
        mounted(){
            this.mapParam=window.mapParam;
            this.getDeviceInfo();
//            this.initLightWebSocket();
        },
        components:{
            TusvnMap,LivePlayer
        },
        filters: {
            dateFormat: function (value) {
                /*debugger*/
                if(value!=''){
                    let ms = value%1000;
                    let time = DateFormat.formatTime(value);
                    return time+"."+ms;
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
            this.$refs.tusvnMap&&this.$refs.tusvnMap.reset3DMap();
            this.carWebsocket&&this.carWebsocket.close();
            this.warningWebsocket&&this.warningWebsocket.close();
            this.sideCarWebsocket&&this.sideCarWebsocket.close();
        }
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
    .map-real-time{
        position: absolute;
        width: 300px;
        font-size: 20px;
        z-index: 2;
        margin-top: 50px;
        left:50%;
        margin-left:-150px;
        text-align: left;
    }
    .map-time{
        position: absolute;
        top: 10px;
        left:50%;
        margin-left: -125px;
        width: 250px;
        text-align: left;
        display: block;
        font-size: 14px;
        z-index:2;
        background: #969090;
    }
    .map-time1{
        top:50px!important;
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