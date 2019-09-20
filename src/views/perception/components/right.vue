<template>
    <div class="fusion-right-style">
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap('1')" v-show="param==3"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap('3')" v-show="param!=3&&mapShow"/>
        <div class="map-time" v-show="isShow=='true'">{{time|dateFormat}}</div>
        <div class="map-time map-time1" v-show="isShow=='true'">{{time1}}</div>
        <div class="map-real-time" >{{processDataTime|dateFormat}}</div>
        <div class="video-style">
            <div v-for="(item,index) in camList" class="video-position" v-if="camList.length">
                <div class="style">
                    <div class="video-mask" @click="screenMagnify(index)"></div>
                    <live-player
                            :requestVideoUrl="requestVideoUrl"
                            :params="item.params"
                            type="flvUrl"
                            :autoplay="false"
                    >
                        <div class="video-num" @click="changeMap(index)">
                            <span class="device-num">摄像头编号:{{item.devId}}</span>
                            <span class="active-circle" :class="{'active-style':isActive==index}"></span>
                            <span>{{item.rsPtName}}</span>
                        </div>
                        <!--<a class="title" href="javascript:;" @click="jumpLink">路测点：{{params.serialNum}}</a>-->
                    </live-player>
                </div>
                <div class="big-video" v-show="item.videoShow">
                    <div class="video-mask" @click="screenShrink(index)"></div>
                    <live-player
                            :requestVideoUrl="requestVideoUrl"
                            :params="item.params"
                            type="flvUrl"
                            :autoplay="false"
                    >
                        <div class="video-num" @click="changeMap(index)">
                            <span class="device-num">摄像头编号:{{item.devId}}</span>
                            <span>{{item.rsPtName}}</span>
                        </div>
                        <!--<a class="title" href="javascript:;" @click="jumpLink">路测点：{{params.serialNum}}</a>-->
                    </live-player>
                </div>
            </div>
            <div v-for="item in new Array(2)" class="video-position style" v-else>
                <div class="c-video-16-9 ">
                    <div class="video-tip">
                        暂无数据
                    </div>
                </div>
            </div>
        </div>
        <div class="c-fusion-right map-right">
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
        <div id="map" class="c-map">
            <tusvn-map :target-id="'mapFusion'"  ref="perceptionMap"
                       background="mapParam.background" minX="mapParam.minX"   minY="mapParam.minY" minZ="mapParam.minZ"
                       maxX="mapParam.maxX"  maxY="mapParam.maxY"  maxZ="mapParam.maxZ"
            @mapcomplete="onMapComplete"   @processPerceptionDataTime='getTime' :waitingtime='waitingtime'>
            </tusvn-map>
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap1 from './TusvnMap.vue';
    import TusvnMap from '@/components/Tusvn3DMap3'
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData,getCameraByRsId} from '@/api/fusion'
    export default {
        data() {
            return {
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
                warningCancleWebsocket:null,
                param:1, //平面 俯视
                time:'',
                time1:'',
                x:0,
                y:0,
                waitingtime:this.$route.params.waitingtime,
                isActive:0,
                crossId:'',
                vehData:[],
                alertCount:0,
                warningData:{},
                warningCount:0,
                lastLightObj:{},
                processDataTime:'',
                removeEventObj:{},
                mapShow:false,
                mapInitTime:'',
                currentExtent:[],
                mapParam:{},
                camList:[],
                requestVideoUrl:getVideoByNum
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
        components: { TusvnMap,TusvnMap1,LivePlayer},
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
                    return time+"."+ms;
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

//                    this.$refs.perceptionMap.updateCameraPosition(x,y,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                    /*setInterval(()=>{
                        let camera = this.$refs.perceptionMap.getCamera();
                        console.log(camera.x,camera.y,camera.z,camera.radius,camera.pitch,camera.yaw)
                    },500)*/
                   let count=0;
                   let flag=false;
                   let camParam;
//                this.$refs.perceptionMap.updateCameraPosition(325858.13269265386,3462417.7786351065,2217.2500985424986,2215.0552566139654,-1.5707963267948966,-2.7837857073883954);
                   //5s没有 默认值
                   this.mapInitTime = setInterval(()=>{
                       if(this.camList.length>0&&this.camList[0].camParam){
                           camParam = this.camList[0].camParam;
                           this.$refs.perceptionMap.updateCameraPosition(camParam.x,camParam.y,camParam.z,camParam.radius,camParam.pitch,camParam.yaw);
                           this.typeRoadData();
                           this.initPlatformWebSocket();
                           this.initPerceptionWebSocket();
                           this.initSpatWebSocket();
//                           //地图不连续移动，判断红绿灯的位置受否再可视区
                           this.initWarningWebSocket();
                           this.initWarningCancleWebSocket();
                           this.getMap();
                           clearInterval(this.mapInitTime);
                           this.mapShow=true;
                           return;
                       }
                       count++;
                       if(count==10){
                           this.$refs.perceptionMap.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,window.defaultMapParam.radius,window.defaultMapParam.pitch,window.defaultMapParam.yaw);
                           this.typeRoadData();
                           this.initPlatformWebSocket();
                           this.initPerceptionWebSocket();
                           this.initSpatWebSocket();
//                           //地图不连续移动，判断红绿灯的位置受否再可视区
                           this.initWarningWebSocket();
                           this.initWarningCancleWebSocket();
                           this.getMap();
                           this.mapShow=true;
                           clearInterval(this.mapInitTime);
                       }
                   },100)
             },
            map1InitComplete(){
//                this.$refs.map1.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map1.centerAt(window.mapOption.center);
                this.$refs.map1.zoomTo(10);
                this.$refs.map1.addWms(window.dlWmsOption.LAYERS_withoutz,window.dlWmsDefaultOption.url,window.dlWmsOption.LAYERS_withoutz,window.dlWmsOption.GD_ROAD_CENTERLINE,1,true,null); // 上海汽车城

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
                overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.centerAt((currentExtend[0][0]+currentExtend[2][0])/2,(currentExtend[0][1]+currentExtend[2][1])/2);
            },
            getTime(time,processTime,vehDataStat){
                if(time!=''){
                    this.time1=time;
                }
                if(processTime!=''){
                    this.processDataTime=processTime;
                }
                this.$emit("getPerceptionData",vehDataStat);
            },
            getCameraByRsId(){
                getCameraByRsId({"rsId":this.rsId}).then(res => {
                    let data = res.data;
                    let cameraList = data.camLst;
                    this.camList = cameraList;
                    this.camList.forEach(item=>{
                        let params={
                            "serialNum": item.sn,
                            "protocal": item.protocal
                        }
                        item.params = params;
                        item.rsPtName=data.rsName;
                        this.$set(item,"videoShow",false);
//                        item.videoShow=false;
                    })

                });
            },
            loadComplete(param){
                this.camList.forEach((item,index)=>{
                    if(param.serialNum==item.serialNum){
                        item.videoUrl = params.videoUrl;
                    }
                });
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
                typeRoadData(
                    [
                        {
                            "polygon":this.currentExtent
//                            "polygon":[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]]
                        }

                    ]
                ).then(res=>{
                    let signs = res.data[0].baseData.signs;
                    let spats = res.data[0].baseData.spats;
                    this.signCount=0;
                    this.spatCount=0;
                    if(signs&&signs.length>0){
                        signs.forEach(item=>{
                            this.signCount++;
                            //将小的转成大的3
//                            let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.centerX, item.centerY);
//                            this.$refs.perceptionMap.addModel('traffic_sign_stop_0','./static/map3d/models/traffic_sign_stop.3ds',utm[0],utm[1],20);
                        })
                    }
                    if(spats&&spats.length>0) {
                        spats.forEach(item => {
                            let spatList = item.spats;
                            spatList.forEach(spat => {
                                this.spatCount++;
                            });
                        })
                    }
                    this.$emit("count", this.signCount, this.spatCount);
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
            changeMap(param){
                if(param=='mapOverLook'){
                    this.param='mapOverLook';
                    this.isActive=-1;
                    this.$refs.perceptionMap.updateCameraPosition(this.x,this.y,217.16763677929166,0,-1.5707963267948966,-0.16236538804906267);
                    return;
                }
                if(this.camList.length>0){
                    let cameraParam = this.camList[param].camParam;
                    if(cameraParam){
                        this.param=param;
                        this.isActive=param;
                        this.$refs.perceptionMap.updateCameraPosition(cameraParam.x,cameraParam.y,cameraParam.z,cameraParam.radius,cameraParam.pitch,cameraParam.yaw);
                    }else{
                        this.$refs.perceptionMap.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,window.defaultMapParam.radius,window.defaultMapParam.pitch,window.defaultMapParam.yaw);
                    }
                }else{
                    this.$refs.perceptionMap.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,window.defaultMapParam.radius,window.defaultMapParam.pitch,window.defaultMapParam.yaw);
                }

            },
            screenMagnify(param){
               this.camList[param].videoShow=true;
            },
            screenShrink(param){
                this.camList[param].videoShow=false;
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
                        for(let key in _this.removeEventObj){
                            console.log("交通事件："+_this.removeEventObj[key]);
                        }
                        if(_this.removeEventObj[warningId]){
                            return;
                        }
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
                console.log("告警结束连接");
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
                        _this.$refs.perceptionMap.removeModel(obj.id);
                        delete _this.warningData[warningId];
                        let eventObj = {
                            id:warningId,
                            time:null
                        }
                        eventObj.time=setTimeout(()=>{
                            delete _this.removeEventObj[warningId];
                        },2000)
                        _this.removeEventObj[warningId]=eventObj;
                    }
                })
            },
            onWarningCancleClose(data){
                console.log("取消告警结束连接");
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
            initPlatformWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.platformWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.platformWebsocket.onmessage = _this.onPlatformMessage;
                    _this.platformWebsocket.onclose = _this.onPlatformClose;
                    _this.platformWebsocket.onopen = _this.onPlatformOpen;
                }
            },
            onPlatformMessage(mesasge){
                let _this=this;
                _this.$refs.perceptionMap.onCarMessage(mesasge);
            },
            onPlatformClose(data){
                console.log("红绿灯结束连接");
            },
            onPlatformOpen(data){
                //旁车
                var platform = {
                    "action": "road_real_data_reg",
                    "data": {
                        "polygon": [[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]]
//                        "polygon":this.currentExtent
                    }
                }
                var platformMsg = JSON.stringify(platform);
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

            //感知车
            initPerceptionWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.perceptionWebsocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.perceptionWebsocket.onmessage = _this.onPerceptionMessage;
                    _this.perceptionWebsocket.onclose = _this.onPerceptionClose;
                    _this.perceptionWebsocket.onopen = _this.onPerceptionOpen;
                }
            },
            onPerceptionMessage(mesasge){
                let _this=this;
               _this.$refs.perceptionMap.addPerceptionData(mesasge);
            },
            onPerceptionClose(data){
                console.log("红绿灯结束连接");
            },
            onPerceptionOpen(data){
                //旁车
                var perception = {
                    "action": "road_real_data_per",
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
                var perceptionMsg = JSON.stringify(perception);
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
            onSpatMessage(mesasge){
                let _this=this;
               _this.$refs.perceptionMap.addPerceptionData(mesasge);
                let json = JSON.parse(mesasge.data);
                let data = json.result.spatDataDTO;
//                let vehData = json.result.vehDataStat;
//                _this.$emit("getPerceptionData",vehData);
//                _this.vehData.push(vehData);
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
                        _this.$refs.perceptionMap.addStaticModel_light_1(light);

                    })
                }
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
                        "polygon":this.currentExtent
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
            getExtend(x,y,r){
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                this.currentExtent.push([x1, y0]);
                this.currentExtent.push([x0, y0]);
                this.currentExtent.push([x0, y1]);
                this.currentExtent.push([x1, y1]);
            }
        },
        mounted() {
            this.mapParam=window.mapParam;
            this.option1 = this.getOption();
            this.option2 = this.getOption();
            this.rsId = this.$route.params.crossId;
           /* this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];*/

            let longitude=parseFloat(this.$route.params.lon);
            let latitude=parseFloat(this.$route.params.lat);
            let extend = parseFloat(this.$route.params.extend);
            //设置地图的中心点
            if(longitude||latitude) {
                let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326", "+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs", longitude, latitude);
                this.x = utm[0];
                this.y = utm[1];
                this.getExtend(longitude,latitude,extend);
                this.center=[longitude ,latitude];
            }else{
                this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];
                this.center=[121.247,31.242];
            }
            this.getCameraByRsId();
        },
        destroyed(){
            clearInterval(this.mapTime1);
            clearInterval(this.mapTime2);
            clearInterval(this.mapTime3);
            clearInterval(this.mapTime4);
            clearTimeout(this.time);
            clearInterval(this.mapInitTime);
            this.lightWebsocket&&this.lightWebsocket.close();
            this.$refs.perceptionMap&&this.$refs.perceptionMap.reset3DMap();
            this.warningWebsocket&&this.warningWebsocket.close();
            this.warningCancleWebsocket&&this.warningCancleWebsocket.close();
            this.platformWebsocket&&this.platformWebsocket.close();
            this.perceptionWebsocket&&this.perceptionWebsocket.close();
            this.spatWebsocket&&this.spatWebsocket.close();
        }
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .map-right{
      width: 270px;
    }
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
        top: 0px;
        right: 0px;
        z-index:4;
        width: 900px;
        border:1px solid rgba(211, 134, 0, 0.5);
        background: #000;
    }
    .video-position{
        margin-bottom: 16px;
        box-sizing: border-box;
        /*border:1px solid rgba(234, 233, 229, 0.1);*/
        border:1px solid rgba(211, 134, 0, 0.5)!important;
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