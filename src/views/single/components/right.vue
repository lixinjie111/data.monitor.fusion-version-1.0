<template>
    <div class="fusion-right-style">
        <div class="map-right">
            <p class="c-title">前向摄像头</p>
            <div class="fusion-video">
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1"></video-player>
            </div>
            <p class="c-title">车内摄像头</p>
            <div class="fusion-video">
                <video-player class="vjs-custom-skin" :options="option2" @error="playerError2"></video-player>
            </div>
        </div>
        <div class="c-map">
            <tusvn-map :target-id="'mapMonitor'" ref="tusvnMap"
                       background="black" minX=325295.155400   minY=3461941.703700  minZ=50
            maxX=326681.125700  maxY=3462723.022400  maxZ=80
            @mapcomplete="onMapComplete">
            </tusvn-map>
        </div>
        <div class="spat-detail clearfix">
            <div  v-for="(item,key) in lightData" class="spat-layout" :key="key">
                <div v-show="key=='key_3'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img" >
                        <img src="@/assets/images/single/light/turn-yellow.png" v-show="item.lightColor=='YELLOW'" class="turn-img"/>
                        <img src="@/assets/images/single/light/turn-red.png" v-show="item.lightColor=='RED'"  class="turn-img"/>
                        <img src="@/assets/images/single/light/turn-green.png" v-show="item.lightColor=='GREEN'"  class="turn-img"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_2'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img">
                        <img src="@/assets/images/single/light/left-yellow.png" class="left-img" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png" class="left-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="left-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_1'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-straight">
                        <img src="@/assets/images/single/light/left-yellow.png" class="straight-img" v-show="item.lightColor=='YELLOW'" />
                        <img src="@/assets/images/single/light/left-red.png" class="straight-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="straight-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_4'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-right">
                        <img src="@/assets/images/single/light/left-yellow.png" class="right-img" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png"  class="right-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="right-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
            </div>
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
                <span>航向角{{realData.headingAngle?realData.headingAngle.toFixed(1):'--'}}°</span>
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
    import TusvnMap from '@/components/Tusvn3DMap2'
    import {getMap} from '@/utils/tusvnMap.js';
    export default {
        data() {
            return {
                option1:{
                    overNative: true,
                    autoplay: false,
                    controls: true,
                    fluid: true,
                    techOrder: ['flash', 'html5'],
                    sourceOrder: true,
                    flash: {
                        swf: isProduction ? '/fusionMonitor/static/media/video-js.swf' : '/static/media/video-js.swf'
                    },
                    sources: [
                        {
                            type: 'rtmp/mp4',
                            src: ''
                        }
                    ],
                    muted:true,
                    width:'100%',
                    height:'100%',
                    notSupportedMessage: '视频无法播放，请稍候再试!',
                    bigPlayButton : false,
                    /*errorDisplay : false,*/
                    controlBar: {
                        timeDivider: false,
                        durationDisplay: false,
                        remainingTimeDisplay: false,
                        currentTimeDisplay:false,
                        fullscreenToggle: true, //全屏按钮
                        captionsButton : false,
                        chaptersButton: false,
                        subtitlesButton:false,
                        liveDisplay:false,
                        playbackRateMenuButton:false
                    }
                },
                option2:{
                    overNative: true,
                    autoplay: true,
                    controls: true,
                    /*fluid: true,*/
                    techOrder: ['flash', 'html5'],
                    sourceOrder: true,
                    flash: {
                        swf: isProduction ? '/fusionMonitor/static/media/video-js.swf' : '/static/media/video-js.swf'
                    },
                    sources: [
                        {
                            type: 'rtmp/mp4',
                            src: ''
                        }
                    ],
                    muted:true,
                    width:'100%',
                    height:'100%',
                    notSupportedMessage: '视频无法播放，请稍候再试!',
                    bigPlayButton : false,
                    /* errorDisplay : false,*/
                    controlBar: {
                        timeDivider: false,
                        durationDisplay: false,
                        remainingTimeDisplay: false,
                        currentTimeDisplay:false,
                        fullscreenToggle: true, //全屏按钮
                        captionsButton : false,
                        chaptersButton: false,
                        subtitlesButton:false,
                        liveDisplay:false,
                        playbackRateMenuButton:false
                    }
                },
                lightData:{
                     /*'key_3':{spareTime:10,time:null,lightColor:'GREEN',flag:true},
                     'key_2':{spareTime:10,time:null,lightColor:'RED',flag:true},
                     'key_1':{spareTime:10,time:null,lightColor:'YELLOW',flag:true},
                     'key_4':{spareTime:10,time:null,lightColor:'RED',flag:true},*/
                    'key_3':{},
                    'key_2':{},
                    'key_1':{},
                    'key_4':{},
                },
               /* realData:{
                    'longitude':116.40741300,
                    'latitude':39.904214,
                    'speed':56.6
                },*/
                timer1:0,
                timer2:0,
                vehicleId:this.$route.params.id,
                lightWebsocket:{}
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
                default() {
                    return {

                    };
                }
            }
        },
        methods: {
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
                        //前向摄像头
                        if(item.toward==0){
                            if(item.serialNum==''){
                                this.option1.sources[0].src='';
                            }else{
                                this.getStream(this.option1,item);
                            }
                        }
                        //车内摄像头
                        if(item.toward==4){
                            if(item.serialNum==''){
                                this.option2.sources[0].src='';
                            }else{
                                this.getStream(this.option2,item);
                            }
                        }
                    })
                });
            },
            getStream(option,item){
                startStream({
                    'vehicleId': this.vehicleId,
                    'camId':item.serialNum,
                    'protocal':item.protocol
                }).then(res => {
                    let streamInfo = res.streamInfoRes;
                    //获取视频地址并赋值
                    let rtmp = streamInfo.rtmp;
                    if(rtmp&&rtmp!=''){
                        option.sources[0].src = rtmp;
                        option.bigPlayButton=true;
                        //直播报活调用
                        this.repeatFn(item);//拉取流后，保活
                    }else {
                        option.notSupportedMessage='视频流不存在，请稍候再试！';
                        option.bigPlayButton=false;
                    }
                });
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
                if(item.toward==0){
                    clearTimeout(_this.timer1);
                    _this.timer1 = null;//清除直播报活
                    _this.timer1 = setTimeout(function(){
                        _this.repeatFn(item);
                    },5000)
                }
                if(item.toward==4){
                    clearTimeout(_this.timer2);
                    _this.timer2 = null;//清除直播报活
                    _this.timer2 = setTimeout(function(){
                        _this.repeatFn(item);
                    },5000)
                }
            },
            onMapComplete:function(){
                console.log("onMapComplete");
                getMap(this.$refs.tusvnMap);
                this.$refs.tusvnMap.updateCameraPosition(326181.72659014474,3462354.6747002415,737.3642832288795,741.5052736914325,-1.5707963267948966,-0.05266622778143515);
                /*this.$refs.tusvnMap1.updateCameraPosition(cameraParam.x,cameraParam.y,cameraParam.z,cameraParam.radius,cameraParam.pitch,cameraParam.yaw);
                this.$refs.tusvnMap1.changeRcuId(window.cfg.websocketUrl,this.roadItem1.camSerialNum);*/
                this.$refs.tusvnMap.changeMainCarId("ws://120.133.21.14:49982/mon",'B21E-00-024');
            },
            initLightWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.lightWebsocket = new WebSocket(window.cfg.socketUrl);  //获得WebSocket对象
                }
                _this.lightWebsocket.onmessage = _this.onLightMessage;
                _this.lightWebsocket.onclose = _this.onLightClose;
                _this.lightWebsocket.onopen = _this.onLightOpen;
            },
            onLightMessage(mesasge){
                var _this=this;
                var json = JSON.parse(mesasge.data);
                var lightData = json.result.data;
                var resultData=[];
                lightData.forEach(item=>{
                    let option={
                        position:new AMap.LngLat(item.longitude, item.latitude),
                        leftTime:item.leftTime,
                        light:item.light,
                        direction:item.direction,
                        longitude:item.longitude,
                        latitude:item.latitude
                    }
                    resultData.push(option);
                });
                resultData.forEach(function (item,index,arr) {
                    let direction = item.direction + "";
                    let key = 'key_' + direction;
                    /*_this.$set(_this.lightData[direction],'spareTime',item.leftTime);*/
                    _this.lightData[key].spareTime = item.leftTime;
                    _this.lightData[key].lightColor = item.light;
                    _this.lightData[key].flag = true;
                    _this.lightData[key].time = null;
                    //延长时间
                    _this.lightData[key].time = setTimeout(item => {
                        _this.lightData[key].flag = false;
                    }, 3000)
                })
            },
            onLightClose(data){
                console.log("结束连接");
            },
            onLightOpen(data){
                //旁车
                var light = {
                    "action": "spat",
                    "vehicleId": this.vehicleId
                }
                var lightMsg = JSON.stringify(light);
                this.sendLightMsg(lightMsg);
            },
            sendLightMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.lightWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.lightWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
        },
        mounted(){
            this.getDeviceInfo();
            this.initLightWebSocket();
        },
        components:{
            TusvnMap
        },
        beforeDestroy(){
            clearTimeout(this.timer1);
            this.timer1 = null;//清除直播报活
            clearTimeout(this.timer2);
            this.timer2 = null;//清除直播报活
            this.lightWebsocket.close();

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
    .video-js{
        height: 150px!important;
    }
</style>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .fusion-video{
        border:1px solid rgba(211, 134, 0, 0.5);
        margin: 20px 0px;
        height: 154px;
        box-sizing: border-box;
       /* padding-top: 10px;*/
    }
    /*.spat-detail{
        position: absolute;
        top: 30px;
        !*left: 0;
        text-align: center;*!
        z-index: 1;
        left:-300px;
        margin-left:40%;
        .spat-layout{
            float: left;
            margin-left: 20px;
        }
        .spat-detail-style{
            width: 130px;
            height: 60px;
            border-radius: 30px;
            background-color: #313131;
            box-sizing: border-box;
            padding:6px 2px;
            !*float: left;
            margin-left: 20px;*!
            @include layoutMode(align);
            .spat-detail-img{
                width: 48px;
                height: 48px;
                background-color: #454545;
                border-radius: 50%;
                display: inline-block;
                position: relative;
                img{
                    position: absolute;
                    top: 50%;
                    margin-top:-15px;
                    left: 50%;
                    margin-left: -14px;
                }
            }
            .spat-detail-font{
                letter-spacing: 4px;
                color: #c8360f;
                font-size: 36px;
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
    }*/
    .spat-detail{
        position: absolute;
        top: 30px;
        /*left: 0;
        text-align: center;*/
        z-index: 1;
        left:-240px;
        margin-left:40%;
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
        left: -400px;
        margin-left:40%;
        bottom: 10px;
        font-size: 16px;
        letter-spacing: 0px;
       /* background: #24212c;*/
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