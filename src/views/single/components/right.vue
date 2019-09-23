<template>
    <div class="fusion-right-style">
        <div class="c-fusion-right map-right">
            <p class="c-title">前向摄像头</p>
            <div class="fusion-video">
                <live-player
                        :requestVideoUrl="requestVideoUrl"
                        :params="forwardParam"
                        type="flvUrl"
                        :autoplay="false"
                        @videoLoadCompleted="videoLoadCompleted"
                        :isBig="false"
                        v-if="forwardShow"
                >
                </live-player>
            </div>
            <p class="c-title">车内摄像头</p>
            <div class="fusion-video">
                <live-player
                        :requestVideoUrl="requestVideoUrl"
                        :params="inParam"
                        type="flvUrl"
                        :autoplay="false"
                        @videoLoadCompleted="videoLoadCompleted"
                        :isBig="false"
                        v-if="inShow"
                >
                </live-player>
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
    //websocket心跳检测
    let wsHeartCheck = {
        timeout: 5000,
        timeId: -1,
        wsObj: null,
        init(ws) {
            this.wsObj = ws;
        },
        reset() {
            clearTimeout(this.timeId);
            this.start();
        },
        start(){
            this.timeId = setTimeout(() => {
                this.wsObj.send('HeartBeat');
            }, this.timeout);
        }
    };
    export default {
        data() {
            return {
                vehicleId:this.$route.params.vehicleId,
                spatWebsocket:null,
                warningWebsocket:null,
                warningCancleWebsocket:null,
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
                timeObj:{}
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
                if(_this.warningList.length>0){
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
                                /*if(obj.hash!=warningHash){*/
                                    console.log("提示信息："+msg,item.dis,obj.dist);
                                    /*if(item.dis>obj.dist){
                                        return;
                                    }*/
                                    //进行更新
                                    _this.$refs.tusvnMap.removeModel(obj.id);
                                    _this.$refs.tusvnMap.add3DInfoLabel(obj.id,msg,obj.longitude,obj.latitude,20);
                               /* }*/
                            }
                        })
                    }
                }
            },
            //视频报错的方法
            playerError1(e) {
                console.log("playerError");
                if(this.option1.sources[0].src != '') {
                    let _videoUrl = this.option1.sources[0].src;
                    this.option1.sources[0].src = '';
                    setTimeout(() => {
                        this.option1.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
            playerError2(e) {
                console.log("playerError");
                if(this.option2.sources[0].src != '') {
                    let _videoUrl = this.option2.sources[0].src;
                    this.option2.sources[0].src = '';
                    setTimeout(() => {
                        this.option2.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
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
                this.initWarningCancleWebSocket();
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
                if ('WebSocket' in window) {
                    _this.spatWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.spatWebsocket.onmessage = _this.onSpatMessage;
                    _this.spatWebsocket.onclose = _this.onSpatClose;
                    _this.spatWebsocket.onopen = _this.onSpatOpen;
                }
            },
            onSpatMessage(message){
                let _this=this;
                _this.lightList.push(message);

            },
            onSpatClose(data){
                console.log("红绿灯结束连接");
            },
            onSpatOpen(data){
                //旁车
                var spat = {
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
                var spatMsg = JSON.stringify(spat);
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

            initWarningWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.warningWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                    _this.warningWebsocket.onmessage = _this.onWarningMessage;
                    _this.warningWebsocket.onclose = _this.onWarningClose;
                    _this.warningWebsocket.onopen = _this.onWarningOpen;
                }
            },
            onWarningMessage(message){
                let _this=this;
                _this.warningList.push(message);
                /*let warningJson = JSON.parse(message.data);
                let warningData = warningJson.result.data;
                let type = warningJson.result.type;
//                let warningTime = Math.abs(time2-warningJson.time);
                _this.lightTime = warningJson.time;
                let warningId;
                if(type=='CLOUD'){
                    warningData.forEach(item=>{
                        warningId = item.warnId;
                        warningId = warningId.substring(0,warningId.lastIndexOf("_"));
                        console.log("距离："+item.dis);
                        let msg = item.warnMsg+" "+item.dis+"米";
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
                            /!*if(obj.hash!=warningHash){*!/
                            console.log("提示信息："+msg,item.dis,obj.dist);
                            /!*if(item.dis>obj.dist){
                                return;
                            }*!/
                            //进行更新
                            _this.$refs.tusvnMap.removeModel(obj.id);
                            _this.$refs.tusvnMap.add3DInfoLabel(obj.id,msg,obj.longitude,obj.latitude,20);
                            /!* }*!/
                        }
                    })
                }*/
            },
            onWarningClose(data){
                console.log("结束连接");
            },
            onWarningOpen(data){
                //旁车
                var warning = {
                    "action": "warning",
                    "vehicleId": this.vehicleId
                }
                var warningMsg = JSON.stringify(warning);
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
            hashcode(str) {
                let hash = 0, i, chr, len;
                if (str.length === 0) return hash;
                for (i = 0, len = str.length; i < len; i++) {
                    chr   = str.charCodeAt(i);
                    hash  = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            },
            //平台车
            initCarWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.carWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                    _this.carWebsocket.onmessage = _this.onCarMessage;
                    _this.carWebsocket.onclose = _this.onCarClose;
                    _this.carWebsocket.onopen = _this.onCarOpen;
                }
            },
            onCarMessage(message){
                this.$refs.tusvnMap.onCarTrackMessage(message);
            },
            onCarClose(data){
                console.log("结束连接");
            },
            onCarOpen(data){
                //旁车
                var car = {
                    "action": "sideVehicle",
                    "vehicleId": this.vehicleId
                }
                var carMsg = JSON.stringify(car);
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

            initWarningCancleWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.warningCancleWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.warningCancleWebsocket.onmessage = _this.onWarningCancleMessage;
                    _this.warningCancleWebsocket.onclose = _this.onWarningCancleClose;
                    _this.warningCancleWebsocket.onopen = _this.onWarningCancleOpen;
                }
            },
            onWarningCancleMessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let warningCancleData = json.result;
                let obj;
                let warningIds = JSON.parse(warningCancleData);
                warningIds.forEach(warningId=>{
                    obj = _this.warningData[warningId];
                    //防止路口页面和单车页面事件交叉影响
                    if(obj&&obj.id){
                        _this.$refs.tusvnMap.removeModel(obj.id);
                        delete _this.warningData[warningId];
                    }
                })
            },
            onWarningCancleClose(data){
                console.log("结束连接");
            },
            onWarningCancleOpen(data){
                //旁车
                let warningCancel = {
                    "action": "event_cancel",
                    "token": "tusvn"
                }
                let warningMsg = JSON.stringify(warningCancel);
                this.sendWarningCancleMsg(warningMsg);
            },
            sendWarningCancleMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.warningCancleWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.warningCancleWebsocket.send(msg); //send()发送消息
                        console.log("warning已发送消息:"+ msg);
                    }
                }else{
                    return;
                }
            },
            //融合车
            initSideCarWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.sideCarWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.sideCarWebsocket.onmessage = _this.onSideCarMessage;
                    _this.sideCarWebsocket.onclose = _this.onSideCarClose;
                    _this.sideCarWebsocket.onopen = _this.onSideCarOpen;
                }
            },
            onSideCarMessage(message){
                this.$refs.tusvnMap.onCarTrackMessage(message);
            },
            onSideCarClose(data){
                console.log("结束连接");
            },
            onSideCarOpen(data){
                //旁车
                var sideCar = {
                    "action": "fusel_sider_per_veh",
                    "vehicleId": this.vehicleId
                }
                var sideCarMsg = JSON.stringify(sideCar);
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
            this.warningCancleWebsocket&&this.warningCancleWebsocket.close();
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
    .spat-detail{
        position: absolute;
        top: 30px;
        /*left: 0;
        text-align: center;*/
        z-index: 1;
        left:-190px;
        margin-left:50%;
        .spat-layout{
            float: left;
            margin-left: 8px;
        }
        .spat-detail-style{
            width: 86px;
            height: 40px;
            border-radius: 20px;
            background-color:rgba(99,99,99,0.3);
            box-sizing: border-box;
            padding:6px 2px;
            /*float: left;
            margin-left: 20px;*/
            @include layoutMode(align);

            .spat-detail-img{
                width: 32px;
                height: 32px;
                background-color: rgba(99,99,99,0.4);
                border-radius: 50%;
                display: inline-block;
                position: relative;
                img{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                }
                .left-img{
                    width: 20px;
                    height: 18px;
                    margin-left: -10px;
                    margin-top: -9px;
                }
                .turn-img{
                    width: 16px;
                    height: 18px;
                    margin-left: -8px;
                    margin-top: -9px;
                }
                .straight-img{
                    width: 20px;
                    height: 16px;
                    margin-left: -10px;
                    margin-top: -8px;
                }
                .right-img{
                    width: 20px;
                    height: 18px;
                    margin-left: -10px;
                    margin-top: -9px;
                }
            }
            .spat-detail-font{
                letter-spacing: 4px;
                color: #c8360f;
                font-size: 24px;
                display: inline-block;
                margin-left: 12px;
            }
            .spat-detail-color{
                color: #23b318;
            }
            .spat-straight{
                transform: rotate(90deg);
            }
            .spat-right{
                transform: rotate(180deg);
            }
            .light-yellow{
                color: #d99f04;
            }
            .light-red{
                color: #c93710;
            }
            .light-green{
                color: #28b51d;
            }
        }
    }
    .travel-detail{
        position: absolute;
        left: -350px;
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