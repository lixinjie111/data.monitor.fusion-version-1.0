<template>
    <div class="fusion-right-style" id="fusionRight">
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap('1')" v-show="param==3"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap('3')" v-show="param!=3"/>
        <div class="map-time" v-show="isShow=='true'">{{time|dateFormat}}</div>
        <div class="map-time map-time1" v-show="isShow=='true'">{{time1}}</div>
        <div class="video-style">
            <div class="style video-position" id="message1">
                <div class="video-mask" @click="screenMagnify('1')"></div>
                <div class="video-num" @click="changeMap('1')">
                    <span class="device-num">摄像头编号:{{videoItem1.deviceId}}</span>
                    <span class="active-circle" :class="{'active-style':isActive=='1'}"></span>
                    <span>{{videoItem1.rsPtName}}</span>
                </div>
                <!--<div class="active-block">
                    <span class="active-circle" :class="{'active-style':isActive=='1'}"></span>
                </div>-->
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1" ref="videoPlayer1"></video-player>
            </div>
            <div class="style" id="message2">
                <div class="video-mask" @click="screenMagnify('2')"></div>
                <div class="video-num" @click="changeMap('2')">
                    <span class="device-num">摄像头编号:{{videoItem2.deviceId}}</span>
                    <span class="active-circle" :class="{'active-style':isActive=='2'}"></span>
                    <span>{{videoItem2.rsPtName}}</span>
                </div>
                <!--<div class="active-block">
                    <span class="active-circle" :class="{'active-style':isActive=='2'}"></span>
                </div>-->
                <video-player class="vjs-custom-skin" :options="option2" @error="playerError2" ref="videoPlayer2"></video-player>
            </div>
        </div>
        <div class="big-video" v-show="video1Show">
            <div class="video-mask" @click="screenShrink('1')"></div>
            <div class="video-num" @click="changeMap('1')">
                <span>摄像头编号:{{videoItem1.deviceId}}</span>
                <span>{{videoItem1.rsPtName}}</span>
            </div>
            <video-player class="vjs-custom-skin" :options="option1" @error="playerError1" ref="videoPlayer3"></video-player>
        </div>
        <div class="big-video" v-show="video2Show">
            <div class="video-mask" @click="screenShrink('2')"></div>
            <div class="video-num" @click="changeMap('1')">
                <span>摄像头编号:{{videoItem1.deviceId}}</span>
                <span>{{videoItem1.rsPtName}}</span>
            </div>
            <video-player class="vjs-custom-skin" :options="option2" @error="playerError2" ref="videoPlayer4"></video-player>
        </div>
        <div class="map-right">
            <div class="perception-road" id="mapRoad">
                <tusvn-map1
                        ref="map1"
                        targetId="map1"
                        overlayContainerId="overlay1"
                        :isMasker='false'
                        :isCircle='false'
                        @MapInitComplete='map1InitComplete'>
                </tusvn-map1>
            </div>
        </div>
        <div class="map-left"></div>
        <div class="spat-detail " v-for="(item,key) in lightList" :style="{left:item.left+'px',top:item.top+'px'}" v-show="item.flag">
               <!-- <div  v-for="(item,key) in obj.lightData" class="spat-layout" :key="key">-->
                    <div v-show="item.key=='turn'" class="spat-detail-style">
                        <div class="spat-detail-img" >
                            <img src="@/assets/images/single/light/turn-yellow.png" v-show="item.lightColor=='YELLOW'" class="turn-img"/>
                            <img src="@/assets/images/single/light/turn-red.png" v-show="item.lightColor=='RED'"  class="turn-img"/>
                            <img src="@/assets/images/single/light/turn-green.png" v-show="item.lightColor=='GREEN'"  class="turn-img"/>
                        </div>
                        <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                    </div>
                    <div v-show="item.key=='left'" class="spat-detail-style">
                        <div class="spat-detail-img">
                            <img src="@/assets/images/single/light/left-yellow.png" class="left-img" v-show="item.lightColor=='YELLOW'"/>
                            <img src="@/assets/images/single/light/left-red.png" class="left-img" v-show="item.lightColor=='RED'"/>
                            <img src="@/assets/images/single/light/left-green.png" class="left-img" v-show="item.lightColor=='GREEN'"/>
                        </div>
                        <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                    </div>
                    <div v-show="item.key=='cross'" class="spat-detail-style">
                        <div class="spat-detail-img spat-straight">
                            <img src="@/assets/images/single/light/left-yellow.png" class="straight-img" v-show="item.lightColor=='YELLOW'" />
                            <img src="@/assets/images/single/light/left-red.png" class="straight-img" v-show="item.lightColor=='RED'"/>
                            <img src="@/assets/images/single/light/left-green.png" class="straight-img" v-show="item.lightColor=='GREEN'"/>
                        </div>
                        <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                    </div>
                    <div v-show="item.key=='right'" class="spat-detail-style">
                        <div class="spat-detail-img spat-right">
                            <img src="@/assets/images/single/light/left-yellow.png" class="right-img" v-show="item.lightColor=='YELLOW'"/>
                            <img src="@/assets/images/single/light/left-red.png"  class="right-img" v-show="item.lightColor=='RED'"/>
                            <img src="@/assets/images/single/light/left-green.png" class="right-img" v-show="item.lightColor=='GREEN'"/>
                        </div>
                        <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                    </div>
                </div>
        <div id="map" class="c-map">
            <tusvn-map :target-id="'mapFusion'"  ref="perceptionMap"
                       background="black" minX=325295.155400   minY=3461941.703700  minZ=50
            maxX=326681.125700  maxY=3462723.022400  maxZ=80
            @mapcomplete="onMapComplete" @CameraChanged='cameraChanged'  @processPerceptionDataTime='getTime' :waitingtime='waitingtime'>
            </tusvn-map>
        </div>
        <!--<div class="point-style" :style="{left:pointLeft+'px',top:pointTop+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft1+'px',top:pointTop1+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft2+'px',top:pointTop2+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft3+'px',top:pointTop3+'px'}"></div>-->
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap1 from './TusvnMap.vue';
    import {getMap} from '@/utils/tusvnMap.js';
    import TusvnMap from '@/components/Tusvn3DMap3'
    import DateFormat from '@/utils/date.js'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData} from '@/api/fusion'
    export default {
        data() {
            return {
                lightList:[
                    /*{
                        left:250,
                        top:260,
                        key:'turn',
                        lightColor:'RED',
                        spareTime:'10'

                    }*/
                ],
                videoItem1:{
                    rtmp:'',
                    serialNum:'',
                    cameraParam:'',
                    rsPtName:'',
                    deviceId:''
                },
                videoItem2:{
                    rtmp:'',
                    serialNum:'',
                    cameraParam:'',
                    rsPtName:'',
                    deviceId:''
                },
                option1:{},
                option2:{},
                topPosition:0,
                leftPosition:0,
                count:0,
                spatCount:0,
                signCount:0,
                center:[],
                mapOption:{
                    center: [121.262939,31.245149],
                    zoom: 18,
                    mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
                },
                weather:{},
                cameraParam:{},
                step:5,
                step1:1,
                mapTime1:0,
                mapTime2:0,
                mapTime3:0,
                mapTime4:0,
                viewTime:0,
                isConMov:false,
                source:'',
                lightWebsocket:null,
                isFirst:true,
                isMapFirst:true,
                time:0,
                param:1, //平面 俯视
                time:'',
                time1:'',
                x:0,
                y:0,
                video1Show:false,
                video2Show:false,
                waitingtime:this.$route.params.waitingtime,
                isActive:'1',
                crossId:'',
                count:0,
                vehData:[],
                isFirstTrans:true,
                alertCount:0,
                warningData:{},
                warningCount:0

               /* pointLeft:10,
                pointTop:10,
                pointLeft1:10,
                pointTop1:10,
                pointLeft2:10,
                pointTop2:10,
                pointLeft3:10,
                pointTop3:10,*/
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
        components: { TusvnMap,TusvnMap1},
        watch: {
            realData: {
                handler(newName, oldName) {
                    this.moveMap();
                },
//                immediate: true,
                deep: true
            },
            $route: {
                handler: function(val, oldVal){
                   this.isShow = val.params.isShow;
                },
                // 深度观察监听
                deep: true,
                immediate: true,
            }
        },
        filters: {
            dateFormat: function (value) {
                /*debugger*/
                if(value!=''){
                    let ms = value%1000;
                    let time = DateFormat.formatTime(value);
                    return time+":"+ms;
                }
            }
        },
        methods: {
            getOption(){
                let option = {
                    overNative: true,
                    autoplay: true,
                    controls: true,
                    fluid: true,
                    techOrder: ['flash', 'html5'],
                    sourceOrder: true,
                    flash: {
                        swf: isProduction ? '/fusionMonitor/static/media/video-js.swf' : '/static/media/video-js.swf'
                    },
                    sources: [
                        {
                            type: 'rtmp/flv',
                            src: ''
                        }
                    ],
                    muted:true,
                    width:'100%',
                    height:'100%',
                    notSupportedMessage: '数据正在加载，请稍候...',
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
                }
                return option;
            },
            playerError1(e) {
                console.log("playerError1");
                if(this.option1.sources[0].src != '') {
                    let _videoUrl = this.option1.sources[0].src;
                    this.option1.sources[0].src = '';
                    setTimeout(() => {
                        this.option1.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
            playerError2(e) {
                console.log("playerError2");
                if(this.option2.sources[0].src != '') {
                    let _videoUrl = this.option2.sources[0].src;
                    this.option2.sources[0].src = '';
                    setTimeout(() => {
                        this.option2.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
            onMapComplete(){
                //getMap(this.$refs.perceptionMap);
                let longitude=parseFloat(this.$route.params.lon);
                let latitude=parseFloat(this.$route.params.lat);
                //设置地图的中心点
                if(longitude||latitude){
                    let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",longitude,latitude);
                    this.x=utm[0];
                    this.y=utm[1];
//                    this.$refs.perceptionMap.updateCameraPosition(x,y,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                    /*setInterval(()=>{
                        let camera = this.$refs.perceptionMap.getCamera();
                        console.log(camera.x,camera.y,camera.z,camera.radius,camera.pitch,camera.yaw)
                    },500)*/
                    this.crossId = this.$route.params.crossId;
                    if(this.crossId==5){
                        this.$refs.perceptionMap.updateCameraPosition(326299.8136019115,3462328.443327571,34.16186920538662,31.40011218302981,-0.1440529053876541,-2.7068034133160297);
//                        this.currentExtent=[[121.17301805179359, 31.28296820442101],[121.17794199996544, 31.28296820442101],[121.17794199996544, 31.28081713470981],[121.17301805179359, 31.28081713470981]];
                        this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];
//                        this.center=[[121.17548002587952,76.2279931281073]];
                        this.center=[121.247,31.242];
                    }
                    if(this.crossId==6){
                        this.$refs.perceptionMap.updateCameraPosition(326338.49419362197,3462214.5819509593,34.454129283572335,33.17105953424258,-0.24528938976181205,0.32988267396644116);
//                        this.currentExtent=[[121.16850344929297, 31.285399006602997],[121.17342740932644, 31.285399006602997],[121.17342740932644, 31.283247763590165],[121.16850344929297, 31.283247763590165]];
                        this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];
//                        this.center=[[121.1709654293097,76.22695122794798]];
                        this.center=[121.247,31.242];
                    }
                    this.getPerceptionAreaInfo();
                    //地图不连续移动，判断红绿灯的位置受否再可视区
                    this.typeRoadData();
                    this.initWarningWebSocket();
//                    this.$emit('getCurrentExtent', this.currentExtent);
                    return;
                }
             },
            map1InitComplete(){
//                this.$refs.map1.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map1.centerAt(window.mapOption.center);
                this.$refs.map1.zoomTo(10);
                this.$refs.map1.addWms(window.dlWmsOption.LAYERS_withoutz,window.dlWmsDefaultOption.url,window.dlWmsOption.LAYERS_withoutz,window.dlWmsOption.GD_ROAD_CENTERLINE,1,true,null); // 上海汽车城

            },
            cameraChanged(){
                console.log("窗口发生变化");
                if(this.first){
                    this.getMap();
                }
                this.lightList=[];
                if(!this.first&&this.count==0){
                    console.log("---------")
                    this.count=1;
//                    this.cameraParam = this.$refs.perceptionMap.getCamera();
//                    this.lightList=[];
                    this.getMap();
                    this.getData();
                    let time = setTimeout(()=>{
                        this.count=0;
                        console.log("灯长度："+this.lightList.length)
                        if(this.lightList.length==0){
                            this.getMap();
                            this.getData()
                        }
                        clearTimeout(time);
                    },3000)

                }
                this.isFirst=false;
            },
            getData(){
                this.getCurrentExtent();
                this.getCenter();
//                this.getPerceptionAreaInfo();
                //地图不连续移动，判断红绿灯的位置受否再可视区
                this.typeRoadData();
            },
            getMap(){
                let overviewMap = this.$refs.map1;
                let overviewLayerId = "overviewLayer";
                let overviewLayer = overviewMap.getLayerById(overviewLayerId);
                if(overviewLayer!=null){
                    overviewMap.removeAllFeature(overviewLayerId);
                }else{
                    overviewMap.addVectorLayer(overviewLayerId);
                }
                let currentExtend = this.currentExtent;
                console.log("currentExtent:"+this.currentExtent)
                /*overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);*/

                overviewMap.centerAt((currentExtend[0][0]+currentExtend[2][0])/2,(currentExtend[0][1]+currentExtend[2][1])/2);
            },
            getPerceptionAreaInfo(){
                let time = setTimeout(()=>{
                    if(this.videoItem1.rtmp==''){
                        this.option1.notSupportedMessage='视频流不存在，请稍候再试！';
                    }
                    if(this.videoItem2.rtmp==''){
                        this.option2.notSupportedMessage='视频流不存在，请稍候再试！';
                    }
                    clearTimeout(time);
                },1000)
                getPerceptionAreaInfo({
                    "areaPoints":this.currentExtent,
                    "centerPoint": {
                        "latitude": this.center[0][1],
                        "longitude": this.center[0][0]
                    }
                }).then(res=>{
                    let data = res.data;
//                    let typicalList=[{"rsPtId":"310114_002","rsPtName":"路侧点1","ptLon":121.1750307,"ptLat":31.2826193,"rspDistcodeProvince":"310000","rspDistcodeCity":"310100","rspDistcodeDistrict":"310114","rspRoadName":"博园路","mecId":"","regionId":"","rsPtPic":"1563762896617.jpg","rspRoadId":"478","rsPtIds":"","distName":"","specialInstructions":"","count":"","cloudName":"","cameraList":[{"deviceId":"N-NJ-0004","type":"N","model":"NJ01","commMode":"5","serialNum":"3402000000132000003001","factory":"NJ","workTemperature":"","voltage":"","outInterface":"","status":0,"ptLon":121.1750307,"ptLat":31.2826193,"scrappedTime":"2019-08-01 21:01:00","appVersion":"","isBind":"2","bindId":"310114_002","videoSvrUrl":"http://140.206.154.130/","protocol":"1","toward":"向前","rsPtId":"310114_002","cloudId":"1022","cloudName":"","rsPtName":"路侧点1","rspDistcode":"310114","rspDistname":"嘉定区","rspRoadName":"博园路","rspRoadId":"478","bindTime":"2019-08-01 15:04:01","cameraRunStatus":"2","cameraMonitorStatus":"0"}]}];
                    let sideList = [];
                    let typicalList = data.shortList;
                    let count=0;
                    //记录取了几个摄像头
                    let cameraCount=0;
                    let camera1={};
                    let camera2={};
                    let ele = document.getElementById('fusionRight');
                    let topPosition = ele.clientHeight;//整个高度减去弹出框的高度
                    if(typicalList&&typicalList.length>0){
                        for(let i=0;i<typicalList.length;i++){
                            let item = typicalList[i];
                            let cameraList = item.cameraList;
                            //球面坐标转成三维坐标
                            let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.ptLon, item.ptLat);
                            //三维坐标转成平面像素
                            let pixel = this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                            //在同一个杆上找
                            for(let j=0;j<cameraList.length;j++){
                                if(cameraList[j].priority!=0){
                                    if(!camera1.serialNum){
                                        camera1=cameraList[j];
                                        cameraCount++;
                                        continue;
                                    }
                                    if(!camera2.serialNum){
                                        camera2=cameraList[j];
                                        cameraCount++;
                                    }
                                    if(cameraCount>=2){
                                        break;
                                    }
                                }
                            }
                            //在不同杆找
                            if(cameraCount>=2){
                                break;
                            }
                        }
                        if(cameraCount<2){
                            let item = typicalList[0];
                            //球面坐标转成三维坐标
                            let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.ptLon, item.ptLat);
                            //三维坐标转成平面像素
                            let pixel = this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                            if(!camera1.serialNum){
                                camera1=typicalList[0].cameraList[0];

                            }

                            if(!camera2.serialNum){
                                camera2=typicalList[0].cameraList[1];
                            }
                        }
                        this.videoItem1.deviceId=camera1.deviceId;
                        this.videoItem1.rsPtName=camera1.rsPtName;
                        this.videoItem1.cameraParam=camera1.cameraParam;
                        this.videoItem2.deviceId=camera2.deviceId;
                        this.videoItem2.rsPtName=camera2.rsPtName;
                        this.videoItem2.cameraParam=camera2.cameraParam;
                        this.getVideo(camera1,0);
                        this.getVideo(camera2,1);
                    }
                    if(sideList&&sideList.length>0){
                        sideList.forEach(item=>{
                            count++;
                            this.$refs.perceptionMap.addImgOverlay('road'+count, 'static/images/fusion/roadSide.png', 0, item.ptLon, item.ptLat, "{'data':'5'}", [10,10], this.imgClick);
                        })
                    }
                });
            },
            getTime(time){
                if(time!=''){
                    this.time1=time;
                }
            },
            getVideo(camera,index){
                let _this = this;
                getVideoByNum({
                    "protocal": camera.protocol,
                    "serialNum": camera.serialNum
                }).then(res => {
                    if(index==0){
                        _this.videoItem1.rtmp = res.data.rtmp;
                        if(_this.videoItem1.rtmp==""){
                            _this.option1.notSupportedMessage="";
                            _this.option1.notSupportedMessage='视频流不存在，请稍候重试';
                        }else{
//                            _this.option1.sources[0].src=_this.videoItem1.rtmp;
                            _this.option1.sources[0].src=_this.videoItem1.rtmp;
                        }
                    }
                    if(index==1){
                        _this.videoItem2.rtmp = res.data.rtmp;
                        if(_this.videoItem2.rtmp==""){
                            _this.option2.notSupportedMessage="";
                            _this.option2.notSupportedMessage='视频流不存在，请稍候重试';
                        }else{
                            _this.option2.sources[0].src=_this.videoItem2.rtmp;
                        }
                    }
                })
            },
            getCurrentExtent() {
                this.currentExtent = [];
                let result = this.$refs.perceptionMap.getExtent();
                let utm1 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
                let utm2 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);

                let x1 = utm1[0];
                let y1 = utm1[1];
                let x2 = utm2[0];
                let y2 = utm2[1];
//                this.getNewCurrentExtent(x1,y1,x2,y2);
               /* this.currentExtent.push([x2, y1]);
                this.currentExtent.push([x1, y1]);
                this.currentExtent.push([x1, y2]);
                this.currentExtent.push([x2, y2]);*/
                this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];
                console.log("边界值："+this.currentExtent);
//                this.currentExtent=[[121.17979423666091,31.279518991604288],[121.16305725240798,31.279518991604288],[121.16305725240798,31.289571910992105],[121.17979423666091,31.289571910992105]];
            },
            getCenter(){
                this.center= [];
                let result = this.$refs.perceptionMap.getExtent();
                let utm1 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
                let utm2 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);
                /*let utm1 = [121.16305725240798,31.279518991604288];
                let utm2 = [121.17979423666091,31.289571910992105];*/
                let x1 = utm1[0];
                let y1 = utm1[1];
                let x2 = utm2[0];
                let y2 = utm2[0];
                let x0 = (x1+x2)/2;
                let y0 = (y1+y2)/2;
//                this.center.push([x0,y0]);
                this.center=[121.247,31.242];
                console.log("中心点："+this.center)
//                console.log("中心点："+this.center);
            },
            typeRoadData(){
                let _this = this;
                _this.lightList=[];
                if(_this.crossId==5){
                    _this.currentExtent=[[121.17301805179359, 31.28296820442101],[121.17794199996544, 31.28296820442101],[121.17794199996544, 31.28081713470981],[121.17301805179359, 31.28081713470981]];
                }
                if(_this.crossId==6){
                    _this.currentExtent=[[121.16850344929297, 31.285399006602997],[121.17342740932644, 31.285399006602997],[121.17342740932644, 31.283247763590165],[121.16850344929297, 31.283247763590165]];
                }
                typeRoadData(
                    [
                        {
                            "polygon":_this.currentExtent
                        }
                    ]
                ).then(res=>{
                    let signs = res.data[0].baseData.signs;
                    let spats = res.data[0].baseData.spats;
                    _this.signCount=0;
                    _this.spatCount=0;
                    if(signs&&signs.length>0){
                        signs.forEach(item=>{
                            _this.signCount++;
                            //将小的转成大的3
                            let utm = _this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.centerX, item.centerY);
                            _this.$refs.perceptionMap.addModel('traffic_sign_stop_0','./static/map3d/models/traffic_sign_stop.3ds',utm[0],utm[1],20);
                        })
                    }
                    if(spats&&spats.length>0){
                        spats.forEach(item=>{
                            let spatList = item.spats;
                            let spatObj={"turn":{},"left":{},"cross":{},"right":{}};
                            spatList.forEach(spat=>{
                                let lightDirection = spat.lightDirection;
                                if(lightDirection==1){
                                    spatObj["cross"]=spat;
                                }
                                if(lightDirection==2){
                                    spatObj["left"]=spat;
                                }
                                if(lightDirection==3){
                                    spatObj["turn"]=spat;
                                }
                                if(lightDirection==4){
                                    spatObj["right"]=spat;
                                }
                            });
                            /*let i=0;
                            let top;
                            let left;*/
                            let lights=[];
                            let x;
                            let y;
                            let z;
                            //一组灯的操作
                            for(let key in spatObj){
                                let item1 = spatObj[key];
                                if(item1.roadId){
                                    let lightObj={
//                                        img1: "./static/images/light/left-red.png",
//                                        img2: "./static/images/light/2.png",
//                                        img3: "./static/images/light/6.png"
                                    };
                                    lightObj.id=item1.spatId;
                                    x=parseFloat(item1.lightPos.split(",")[0]);
                                    y=parseFloat(item1.lightPos.split(",")[1]);
                                    z=parseFloat(item1.lightPos.split(",")[2]);
                                    _this.spatCount++;
                                    lights.push(lightObj);
                                    /*let obj = {};
                                   let longitude = parseFloat(item1.lightPos.split(",")[0]);
                                   let latitude = parseFloat(item1.lightPos.split(",")[1]);
                                   let z = parseFloat(item1.lightPos.split(",")[2]);
                                  if(i==0){
                                       //球面坐标转成三维坐标
                                       let utm = _this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",longitude,latitude);
                                       //三维坐标转成平面像素
                                       let pixel = _this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                                       let tempLeft = parseInt(pixel[0])-32;
                                       let tempTop = parseInt(pixel[1])-20;
                                       obj.left =tempLeft;
                                       obj.top = tempTop;
                                       top=obj.top;
                                       left=obj.left;
                                   }
                                   if(i>0){
                                       obj.left = left+56*i;
                                       obj.top=top;
                                   }
                                   let spatId = "light_"+item1.spatId;
                                   obj.spatId = spatId;
                                   obj.key = key;
                                   obj.spareTime = '';
                                   obj.lightColor='';
                                   obj.flag=true;
                                   _this.spatCount++;
                                   _this.lightList.push(obj);
                                   i++;*/
                                }
                            }
                            _this.$refs.perceptionMap.addModel_light(x,y,z,lights);
                        })
                        _this.$emit("count",_this.signCount,_this.spatCount);
                        if(_this.isMapFirst){
                            _this.initLightWebSocket();
                            _this.isMapFirst=false;
                        }
                    }
                })
            },
            moveMap(){
                /*direction:方向 "停",0;"上",1;"下",2;"左",3;"右",4;
                status:状态 动一步 0 ;一直动 1*/
                let direction = this.realData.direction;
                let status = this.realData.status;
                let x = this.cameraParam.x;
                let y = this.cameraParam.y;
                this.source='mapMove';
                //动一步
                if(status=='0'){
                    this.isConMov=false;
                    clearInterval(this.mapTime1);
                    clearInterval(this.mapTime2);
                    clearInterval(this.mapTime3);
                    clearInterval(this.mapTime4);
                    //停止
                    if(direction=='0'){
                        this.isConMov=false;
                        console.log("停止------")
                        this.getPerceptionAreaInfo();
                        this.typeRoadData();
                        return;
                        //
                    }
                    //向上
                    if(direction=='1'){
                        if(this.cameraParam.y<=this.$refs.perceptionMap.minY){
                            return;
                        }
//                        this.cameraParam.y=y-this.step;
                        this.$refs.perceptionMap.move(0,this.step,0);
                    }
                    //向下
                    if(direction=='2'){
                        if(this.cameraParam.y>=this.$refs.perceptionMap.maxY){
                            return;
                        }
//                        this.cameraParam.y=y+this.step;
                        this.$refs.perceptionMap.move(0,-this.step,0);
                    }
                    //向左
                    if(direction=='3'){
                        if(this.cameraParam.x>=this.$refs.perceptionMap.maxX){
                            return;
                        }
//                        this.cameraParam.x=x+this.step;
                        this.$refs.perceptionMap.move(-this.step,0,0);
                    }
                    //向右
                    if(direction=='4'){
                        if(this.cameraParam.x<=this.$refs.perceptionMap.minX){
                            return;
                        }
//                        this.cameraParam.x=x-this.step;
                        this.$refs.perceptionMap.move(this.step,0,0);
                    }
//                    this.$refs.perceptionMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);

                }else{

                    this.isConMov=true;
                    this.lightList=[];
                    //向上
                    if(direction=='1'){
                        clearInterval(this.mapTime1);
                        clearInterval(this.mapTime2);
                        clearInterval(this.mapTime3);
                        clearInterval(this.mapTime4);
                        this.mapTime1 = setInterval(()=>{
                            if(this.cameraParam.y<=this.$refs.perceptionMap.minY){
                                clearInterval(this.mapTime1);
                                return;
                            }
                            this.$refs.perceptionMap.move(0,this.step1,0);
//                            this.cameraParam.y=this.cameraParam.y-this.step1;
//                            this.$refs.perceptionMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                        },100)
                    }
                    //向下
                    if(direction=='2'){
                        clearInterval(this.mapTime1);
                        clearInterval(this.mapTime2);
                        clearInterval(this.mapTime3);
                        clearInterval(this.mapTime4);
                        this.mapTime2 = setInterval(()=>{
                            if(this.cameraParam.y>=this.$refs.perceptionMap.maxY){
                                clearInterval(this.mapTime2);
                                return;
                            }
                            this.$refs.perceptionMap.move(0,-this.step1,0);
//                            this.cameraParam.y=this.cameraParam.y+this.step1;
//                            this.$refs.perceptionMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                        },100)
                    }
                    //向左
                    if(direction=='3'){
                        clearInterval(this.mapTime1);
                        clearInterval(this.mapTime2);
                        clearInterval(this.mapTime3);
                        clearInterval(this.mapTime4);
                        this.mapTime3 = setInterval(()=>{
                            if(this.cameraParam.x>=this.$refs.perceptionMap.maxX){
                                clearInterval(this.mapTime3);
                                return;
                            }
                            this.$refs.perceptionMap.move(-this.step,0,0);

//                            this.cameraParam.x=this.cameraParam.x+this.step1;
//                            this.$refs.perceptionMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                        },100)
                    }
                    //向右
                    if(direction=='4'){
                        clearInterval(this.mapTime1);
                        clearInterval(this.mapTime2);
                        clearInterval(this.mapTime3);
                        clearInterval(this.mapTime4);
                        this.mapTime4 = setInterval(()=>{
                            if(this.cameraParam.x<=this.$refs.perceptionMap.minX){
                                clearInterval(this.mapTime4);
                                return;
                            }
                            this.$refs.perceptionMap.move(this.step,0,0);
//                            this.cameraParam.x=this.cameraParam.x-this.step1;
//                            this.$refs.perceptionMap.updateCameraPosition(this.cameraParam.x,this.cameraParam.y,this.cameraParam.z,this.cameraParam.radius,this.cameraParam.pitch,this.cameraParam.yaw);
                        },100)
                    }
                }
            },
            initLightWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.lightWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.lightWebsocket.onmessage = _this.onLightMessage;
                    _this.lightWebsocket.onclose = _this.onLightClose;
                    _this.lightWebsocket.onopen = _this.onLightOpen;
                }
            },
            onLightMessage(mesasge){
                let _this=this;
                _this.$refs.perceptionMap&&_this.$refs.perceptionMap.addPerceptionData(mesasge);
                let json = JSON.parse(mesasge.data);
                let data = json.result.spatDataDTO;
                let vehData = json.result.vehDataStat;
                _this.vehData.push(vehData);
                if(_this.waitingtime!=''){
                    if(_this.isFirstTrans){
                        setTimeout(()=>{
                            _this.$emit("getPerceptionData",_this.vehData);
                            _this.isFirstTrans=false;
                        },_this.waitingtime)
                    }else{
                        _this.vehData.shift();
                        _this.$emit("getPerceptionData",_this.vehData);
                    }

                }
//                _this.$emit("getPerceptionData",json.result.vehDataStat)
                _this.time=json.time;
                /*if(_this.param==3){*/
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
                            let spatId="light_"+item.spatId;
                            let key = item.direction.substring(item.direction.lastIndexOf("_")+1);
                            _this.lightList.forEach((item1,index1)=>{
                                //相交的
                                if(item1.spatId==spatId){
                                    item1.spareTime = item.leftTime;
                                    item1.lightColor = item.light;
                                    item1.flag=true;
                                }
                            })
                        })
                    }
                /*}*/
            },
            onLightClose(data){
                console.log("结束连接");
            },
            onLightOpen(data){
                //旁车
                var light = {
                    "action": "road_real_data",
                    "data": {
                        /*"polygon": [
                            [121.17979423666091, 31.279518991604288],
                            [121.16305725240798, 31.279518991604288],
                            [121.16305725240798, 31.289571910992105],
                            [121.17979423666091, 31.289571910992105]
                        ]*/
                        "polygon":this.currentExtent
                    }
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
            getNewCurrentExtent(x1,y1,x2,y2){
                let x0 = (x1+x2)/2;
                let y0 = (y1+y2)/2;
                let x = x1-x2;
                let y = y1-y2;
                let newX2 = x2;
               let newY2 = y2+y*0.1;
               /* let newY2 = y2;*/
                let newX1 = x1;
                let newY1 = y1-y*0.1;
               /* let newY1 = y1;*/
                //左下角
                let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",newX2,newY2);
                //三维坐标转成平面像素
                let pixel = this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                this.pointLeft = parseInt(pixel[0]);
                this.pointTop = parseInt(pixel[1]);
                console.log(this.pointLeft,this.pointTop)
                //右上角
                let utm1 = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",newX1,newY1);
                //三维坐标转成平面像素
                let pixel1 = this.$refs.perceptionMap.worldToScreen(utm1[0],utm1[1],12.86);
                this.pointLeft1 = parseInt(pixel1[0]);
                this.pointTop1 = parseInt(pixel1[1]);
                console.log(this.pointLeft1,this.pointTop1)
                //左上角
                let utm3 = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",newX2,newY1);
                //三维坐标转成平面像素
                let pixel3 = this.$refs.perceptionMap.worldToScreen(utm3[0],utm3[1],12.86);
                this.pointLeft2 = parseInt(pixel3[0]);
                this.pointTop2 = parseInt(pixel3[1]);
                console.log(this.pointLeft2,this.pointTop2)
                //右下角
                let utm4 = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",newX1,newY2);
                //三维坐标转成平面像素
                let pixel4 = this.$refs.perceptionMap.worldToScreen(utm4[0],utm4[1],12.86);
                this.pointLeft3 = parseInt(pixel4[0]);
                this.pointTop3 = parseInt(pixel4[1]);
                console.log(this.pointLeft3,this.pointTop43)
            },
            getPointRange(lon,lat){
                let x1 = this.currentExtent[1][0];
                let y1 = this.currentExtent[1][1];
                let x0 = this.currentExtent[3][0];
                let y0 = this.currentExtent[3][1];
                if(lon>x0&&lon>y0&&lat<x1&&lat<y1){
                    return true;
                }else {
                    return false;
                }
            },
            changeMap(param){
                this.lightList=[];
                let cameraParam;
                if(param==1){
                    if(this.videoItem1.cameraParam){
                        cameraParam = JSON.parse(this.videoItem1.cameraParam);
                        this.param=1;
                        this.isActive='1';
                        this.$refs.perceptionMap.updateCameraPosition(cameraParam.x,cameraParam.y,cameraParam.z,cameraParam.radius,cameraParam.pitch,cameraParam.yaw);
                    }else{
                        this.$refs.perceptionMap.updateCameraPosition(326299.8136019115,3462328.443327571,34.16186920538662,31.40011218302981,-0.1440529053876541,-2.7068034133160297);
                    }
                }
                if(param==2){
                    if(this.videoItem2.cameraParam){
                        cameraParam = JSON.parse(this.videoItem2.cameraParam);
                        this.param=2;
                        this.isActive='2';
                        this.$refs.perceptionMap.updateCameraPosition(cameraParam.x,cameraParam.y,cameraParam.z,cameraParam.radius,cameraParam.pitch,cameraParam.yaw);
                    }else{
                        this.$refs.perceptionMap.updateCameraPosition(326304.2090037432,3462331.4820984467,32.32807236656733,28.285918865915978,-0.2021040680279308,0.973473709325485);
                    }
                }
                if(param==3){
                    this.param=3;
                    this.isActive='0';
                    this.isFirst=true;
//                    this.$refs.perceptionMap.updateCameraPosition(this.initCameraParam.x,this.initCameraParam.y,this.initCameraParam.z,this.initCameraParam.radius,this.initCameraParam.pitch,this.initCameraParam.yaw);
//                    this.$refs.perceptionMap.updateCameraPosition(this.x,this.y,217.16763677929166,0,-1.5707963267948966,-0.16236538804906267);
                    this.$refs.perceptionMap.updateCameraPosition(this.x,this.y,217.16763677929166,0,-1.5707963267948966,-0.16236538804906267);
                }
//                /*if(param==4){
//                    this.param=4;
//                    this.$refs.perceptionMap.updateCameraPosition(326338.49419362197,3462214.5819509593,34.454129283572335,33.17105953424258,-0.24528938976181205,0.32988267396644116);
//                }*/
            },
            screenMagnify(param){
                if(param==1){
                    this.video1Show=true;
                    if(!this.$refs.videoPlayer3.player){
                        this.$refs.videoPlayer3.initialize();
                        this.$refs.videoPlayer3.player.options(this.option1);

                    }
                    if(this.videoItem1.rtmp==""){
                        this.option1.notSupportedMessage="";
                        this.option1.notSupportedMessage='视频流不存在，请稍候重试';
                    }else{
                        this.option1.sources[0].src=this.videoItem1.rtmp;
                    }
                }
                if(param==2){
                    this.video2Show=true;
                    if(!this.$refs.videoPlayer4.player){
                        this.$refs.videoPlayer4.initialize();
                        this.$refs.videoPlayer4.player.options(this.option2);

                    }
                    if(this.videoItem2.rtmp==""){
                        this.option2.notSupportedMessage="";
                        this.option2.notSupportedMessage='视频流不存在，请稍候重试';
                    }else{
                        this.option2.sources[0].src=this.videoItem2.rtmp;
                    }
                }
            },
            screenShrink(param){
                if(param==1){
                    this.video1Show=false;
                    this.$refs.videoPlayer3.dispose();
                }
                if(param==2){
                    this.video2Show=false;
                    this.$refs.videoPlayer4.dispose();
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
            onWarningMessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let warningData = json.result.data;
                let type = json.result.type;
                let warningId;
                if(type=='CLOUD'){
                    warningData.forEach(item=>{
                        warningId = item.warnId;
                        warningId = warningId.substring(0,warningId.lastIndexOf("_"));
                        let msg = item.warnMsg;
                        let warningObj={
                            longitude:item.longitude,
                            latitude:item.latitude
                        }
                        let warningHash = _this.hashcode(JSON.stringify(warningObj));
                        //如果告警id不存在
                        if(!_this.warningData[warningId]){
                            _this.warningCount++;
                            let obj = {
                                id:'alert'+_this.alertCount,
                                msg:msg,
                                longitude:item.longitude,
                                latitude:item.latitude,
                                hash:warningHash
                            }
                            _this.warningData[warningId]=obj;
                            _this.alertCount++;
                            _this.$refs.perceptionMap.add3DInfoLabel(obj.id,obj.msg,obj.longitude,obj.latitude,20);
                        }else{
                            //判断是否需要更新
                            let obj = _this.warningData[warningId];
                            if(obj.hash!=warningHash){
                                //进行更新
                                _this.$refs.perceptionMap.removeModel(obj.id);
                                _this.$refs.perceptionMap.add3DInfoLabel(obj.id,obj.msg,obj.longitude,obj.latitude,20);
                            }
                        }
                    })
                    //此次告警结束，将总数传递出去
                    _this.$emit("getWarningCount",_this.warningCount);
                }
            },
            onWarningClose(data){
                console.log("结束连接");
            },
            onWarningOpen(data){
                //旁车
                var warning = {
                    "action": "clod_event",
                    "region": this.currentExtent
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
            }
        },
        mounted() {
            this.option1 = this.getOption();
            this.option2 = this.getOption();
        },
        destroyed(){
            clearInterval(this.mapTime1);
            clearInterval(this.mapTime2);
            clearInterval(this.mapTime3);
            clearInterval(this.mapTime4);
            clearTimeout(this.time);
            this.lightWebsocket&&this.lightWebsocket.close();
            this.$refs.perceptionMap&&this.$refs.perceptionMap.reset3DMap();
            this.warningWebsocket&&this.warningWebsocket.close();
        }
}
</script>
<style>
    .style .vjs-error .vjs-error-display:before{
        font-size: 3em;
        color: #ccc;
        top:60%;
        display: none;
    }
    .style .vjs-modal-dialog-content{
        padding-top:80px!important;
    }
    .style .vjs-custom-skin > .video-js .vjs-big-play-button{
        font-size: 0.5em!important;
    }
</style>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .point-style{
        width: 10px;
        height: 10px;
        background: red;
        z-index:1;
        position: absolute;
        /*left: 10px;
        top: 10px;*/
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
    .perception-road{
        height: 130px;
        width: 220px;
        border:1px solid rgba(211, 134, 0, 0.3);
        position: absolute;
        bottom: 10px;
        background: #000;
        right: 10px;
        z-index:100;
        .map-type{
            position: absolute;
            z-index: 110;
            right:0;
            img{
                width: 18px;
                cursor: pointer;
            }
        }
    }
    .base-info{
        padding:10px 0px ;
        text-align: center;
        .weather-icon{
            vertical-align: middle;
            padding-left: 10px;
        }
    }
    .style{
        position: relative;
        z-index:1;
        box-sizing: border-box;
        /*border:1px solid rgba(234, 233, 229, 0.1);*/
        border:1px solid rgba(211, 134, 0, 0.5)!important;
    }
    .video-num{
        position: absolute;
        z-index:2;
        width:100%;
        padding: 0px 10px;
        box-sizing: border-box;
        cursor: pointer;
        line-height: 30px;
        .device-num{
            padding-left: 10px;
            padding-right: 70px;
        }
       /* @include layoutMode(between);*/
    }
 /*   .style:before{
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-top:20px solid #666666;
        border-right:16px solid transparent;
        bottom: -20px;
        left:16px;

    }*/
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
      /*  transition: all 2s ease-in-out;*/
        .active-circle{
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            position: absolute;
            left: 4px;
            top: 10px;

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
    .big-video{
        position: absolute;
        top: 84px;
        right: 10px;
        z-index:4;
        width: 900px;
        border:1px solid rgba(211, 134, 0, 0.5);
        background: #000;
    }
    .video-position{
        margin-bottom: 16px;
    }
    .video-mask{
        position: absolute;
        right: 0;
        bottom: 0;
        width: 46px;
        height: 46px;
        z-index: 3;
        cursor: pointer;
    }
    .spat-detail{
        position: absolute;
        z-index: 2;
        padding:4px;
        background: #333333;
        border-radius: 4px;
        .spat-layout{
            float: left;
            margin-left: 8px;
        }
        .spat-detail-style{
            width: 54px;
            height: 30px;
            border-radius: 20px;
            background-color:#333333;
            box-sizing: border-box;
            @include layoutMode(align);

            .spat-detail-img{
                width: 24px;
                height: 24px;
                background-color: #4e4d4d;
                border-radius: 50%;
                display: inline-block;
                position: relative;
                img{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                }
                .turn-img{
                    width: 16px;
                    height: 18px;
                    margin-left: -8px;
                    margin-top: -9px;
                }
                .left-img{
                    width: 18px;
                    height: 14px;
                    margin-left: -10px;
                    margin-top: -8px;
                }
                .straight-img{
                    width: 16px;
                    height: 14px;
                    margin-left: -8px;
                    margin-top: -7px;
                }
                .right-img{
                    width: 18px;
                    height: 14px;
                    margin-left: -9px;
                    margin-top: -7px;
                }
            }
            .spat-detail-font{
                letter-spacing: 0px;
                color: #c8360f;
                font-size: 20px;
                display: inline-block;
                margin-left: 4px;
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
</style>