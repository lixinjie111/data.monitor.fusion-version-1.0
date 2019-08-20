<template>
    <div class="fusion-right-style" id="fusionRight">
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
        <div class="spat-detail " v-for="(item,key) in lightList" :style="{left:item.left+'px',top:item.top+'px'}"  v-if="item.flag">
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
            <div class="style" id="message1" :style="{left:left1+'px',bottom:bottom1+'px',opacity:opacity}" v-show="video1Show">
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1" ref="videoPlayer1"></video-player>
            </div>
            <tusvn-map :target-id="'mapFusion'"  ref="perceptionMap"
                       background="black" minX=325295.155400   minY=3461941.703700  minZ=50
            maxX=326681.125700  maxY=3462723.022400  maxZ=80
            @mapcomplete="onMapComplete" @CameraChanged='cameraChanged' >
            </tusvn-map>
        </div>
        <div class="point-style" :style="{left:pointLeft+'px',top:pointTop+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft1+'px',top:pointTop1+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft2+'px',top:pointTop2+'px'}"></div>
        <div class="point-style" :style="{left:pointLeft3+'px',top:pointTop3+'px'}"></div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap1 from './TusvnMap.vue';
    import {getMap} from '@/utils/tusvnMap.js';
    import TusvnMap from '@/components/Tusvn3DMap2'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData} from '@/api/fusion'
    export default {
        data() {
            return {
                option1:{},
                rtmp1:'',
                option2:{},
                lightList:[
                    /*{
                        left:250,
                        top:260,
                        key:'turn',
                        lightColor:'RED',
                        spareTime:'10'

                    }*/
                ],
                left1:'',
                bottom1:'',
                video1Show:false,
                option1:{},
                topPosition:0,
                leftPosition:0,
                count:0,
                opacity:0,
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
                isConMov:false,
                lightWebsocket:{},
                isFirst:true,
                time:0,
                pointLeft:10,
                pointTop:10,
                pointLeft1:10,
                pointTop1:10,
                pointLeft2:10,
                pointTop2:10,
                pointLeft3:10,
                pointTop3:10,
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
        components: { TusvnMap,TusvnMap1},
        watch: {
            realData: {
                handler(newName, oldName) {
                    this.moveMap();
                },
//                immediate: true,
                deep: true

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
                }
                return option;
            },
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
            onMapComplete(){
                getMap(this.$refs.perceptionMap);
                this.$refs.perceptionMap.addModel('tra_light00011111','./static/map3d/models/traffic_light.3ds',326279.672803747,3462360.84818288,12.68);
                let longitude=parseFloat(this.$route.params.lon);
                let latitude=parseFloat(this.$route.params.lat);
                //设置地图的中心点
                if(longitude||latitude){
                    let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",longitude,latitude);
                    let x=utm[0];
                    let y=utm[1];
//                    this.$refs.perceptionMap.updateCameraPosition(x,y,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                    /*setInterval(()=>{
                        let camera = this.$refs.perceptionMap.getCamera();
                        console.log(camera.x,camera.y,camera.z,camera.radius,camera.pitch,camera.yaw)
                    },500)*/
                    this.$refs.perceptionMap.updateCameraPosition(x,y,217.16763677929166,205.99746133369624,-1.5707963267948966,-0.16236538804906267);
                    return;
                }else{
                    this.$refs.perceptionMap.updateCameraPosition(326343.19123227906,3462351.5698124655,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                }
//                this.$refs.perceptionMap.updateCameraPosition(326343.19123227906,3462351.5698124655,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                this.cameraParam = this.$refs.perceptionMap.getCamera();

                //向左移5米
                /*let x = obj.x;
                let y = obj.y;
                let z = obj.z;
                let radius = obj.radius;
                let pitch = obj.pitch;
                let yaw = obj.yaw;*/
             },
            map1InitComplete(){
                this.$refs.map1.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map1.zoomTo(14);
                this.$refs.map1.addWms("shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","gd_road_centerline",1,true,null); // 上海汽车城

            },
            cameraChanged(){
                console.log("窗口发生变化")
                if(this.isFirst){
                    this.time = setTimeout(()=>{
                        let ele = document.getElementById("message1");
                        ele.className="style";
                        this.getCurrentExtent();
                        this.getCenter();
                        this.$emit('getCurrentExtent', this.currentExtent);
                        this.getPerceptionAreaInfo();
                        this.typeRoadData();
                        this.getMap();
                        clearTimeout(this.time);
                    },500)
                }
                //地图不是第一次初始化
                if(!this.isFirst){
                    if(this.video1Show||this.rtmp1!=''){
                        this.rtmp1="";
                        this.$refs.videoPlayer1.player.src("");
                        this.video1Show=false;
                    }
                    this.lightWebsocket.close();
                    this.$refs.perceptionMap.resetModels();

                }

                this.cameraParam = this.$refs.perceptionMap.getCamera();
//                console.log("地图变化后的y："+this.cameraParam.y)
                //地图不连续动
                if(!this.isConMov&&!this.isFirst){
                    let ele = document.getElementById("message1");
                    ele.className="style";
                    this.getCurrentExtent();
                    this.getCenter();
                    this.$emit('getCurrentExtent', this.currentExtent);
                    this.getPerceptionAreaInfo();
                    /*//地图不连续移动，判断红绿灯的位置受否再可视区
                    this.lightList.forEach(item=>{
                        let flag = this.getPointRange(item.lon,item.lat);
                        if(!flag){
                            item.flag=false;
                        }
                    })*/
                    this.typeRoadData();
                }
                //不是第一次
                if(!this.isFirst){
                   this.getMap();
                }
                this.isFirst=false;
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
//                debugger;
                overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.centerAt((currentExtend[0][0]+currentExtend[2][0])/2,(currentExtend[0][1]+currentExtend[2][1])/2);
            },
            getPerceptionAreaInfo(){
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
                    typicalList.forEach((item,index)=>{
                        let cameraList = item.cameraList;
                        //球面坐标转成三维坐标
                        let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.ptLon, item.ptLat);
                        //三维坐标转成平面像素
                        let pixel = this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                        /*let pixel = this.$refs.map.getPixelFromCoordinate([item.ptLon, item.ptLat]);*/
                        this.left1 = parseInt(pixel[0]);
                        let ele = document.getElementById('fusionRight');
                        let topPosition = ele.clientHeight;//整个高度减去弹出框的高度
                        this.bottom1=topPosition-parseInt(pixel[1]);
                        this.opacity=1;
                        cameraList.forEach(cameraItem=>{
                            if(cameraItem.priority==1){
                                //地图移动停止10s
                                let time = setTimeout(()=>{
                                    this.video1Show=true;
                                    this.getVideo(cameraItem,index);
                                    clearTimeout(time);
                                },10000)
                            }
                        })
                    })
                    sideList.forEach(item=>{
                        count++;
                        this.$refs.perceptionMap.addImgOverlay('road'+count, 'static/images/fusion/roadSide.png', 0, item.ptLon, item.ptLat, "{'data':'5'}", [10,10], this.imgClick);
                    })
                });
            },
            getVideo(camera,index){
                let _this = this;
                let ele = document.getElementById("message1");
                getVideoByNum({
                    "protocal": camera.protocol,
                    "serialNum": camera.serialNum
                }).then(res => {
                    if(index==0){
                        _this.rtmp1 = res.data.rtmp;
                        if(_this.rtmp1==""){
                            _this.option1.notSupportedMessage="";
                            _this.option1.notSupportedMessage='视频流不存在，请稍候重试';
                            ele.className="style style2";
                        }else{
                            _this.option1.sources[0].src=_this.rtmp1;
                            //播放20s移动到下方
                            let time1 = setTimeout(()=>{
                                ele.className="style style1";
                                clearTimeout(time1);
                            },20000)
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
                this.getNewCurrentExtent(x1,y1,x2,y2);
                this.currentExtent.push([x2, y1]);
                this.currentExtent.push([x1, y1]);
                this.currentExtent.push([x1, y2]);
                this.currentExtent.push([x2, y2]);
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
                this.center.push([x0,y0]);
                console.log("中心点："+this.center)
//                console.log("中心点："+this.center);
            },
            typeRoadData(){
                this.lightList=[];
                typeRoadData(
                    [
                        {
                            "polygon":this.currentExtent
                        }
                    ]
                ).then(res=>{
                    let signs = res.data[0].baseData.signs;
                    let spats = res.data[0].baseData.spats;
                    this.signCount=0;
                    this.spatCount=0;
                    signs.forEach(item=>{
                        this.signCount++;
                        //将小的转成大的
                        let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.centerX, item.centerY);
                        this.$refs.perceptionMap.addModel('traffic_sign_stop_0','./static/map3d/models/traffic_sign_stop.3ds',utm[0],utm[1],12.68);
                    })
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
                        let i=0;
                        let top;
                        let left;
                        for(let key in spatObj){
                            let item1 = spatObj[key];
                            if(item1.roadId){
                                let obj = {};
                                let longitude = parseFloat(item1.lightPos.split(",")[0]);
                                let latitude = parseFloat(item1.lightPos.split(",")[1]);
                                if(i==0){
                                   //球面坐标转成三维坐标
                                   let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",longitude,latitude);
                                   //三维坐标转成平面像素
                                   let pixel = this.$refs.perceptionMap.worldToScreen(utm[0],utm[1],12.86);
                                   obj.left = parseInt(pixel[0]);
                                   obj.top = parseInt(pixel[1]);
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
                                obj.lon=longitude;
                                obj.lat=latitude;
                                this.spatCount++;
                                this.lightList.push(obj);
                                i++;
                            }
                        }
                    })
                    this.$emit("count",this.signCount,this.spatCount);
                    this.initLightWebSocket();
                })
            },
            moveMap(){
                /*direction:方向 "停",0;"上",1;"下",2;"左",3;"右",4;
                status:状态 动一步 0 ;一直动 1*/
                let direction = this.realData.direction;
                let status = this.realData.status;
                let x = this.cameraParam.x;
                let y = this.cameraParam.y;
                //动一步
                if(status=='0'){
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
                    _this.lightWebsocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
                }
                _this.lightWebsocket.onmessage = _this.onLightMessage;
                _this.lightWebsocket.onclose = _this.onLightClose;
                _this.lightWebsocket.onopen = _this.onLightOpen;
            },
            onLightMessage(mesasge){
                let _this=this;
                _this.$refs.perceptionMap.addPerceptionData(mesasge);
                let json = JSON.parse(mesasge.data);
                let data = json.result.spatDataDTO;
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
                            }
                        })
                    })
                }
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
//                let newY2 = y2+y*0.1;
                let newY2 = y2;
                let newX1 = x1;
//                let newY1 = y1-y*0.1;
                let newY1 = y1;
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
            }
        },
        mounted() {
            this.option1 = this.getOption();
        },
        destroyed(){
            clearInterval(this.mapTime1);
            clearInterval(this.mapTime2);
            clearInterval(this.mapTime3);
            clearInterval(this.mapTime4);
            clearTimeout(this.time);
            this.lightWebsocket.close();
            if(this.$refs.perceptionMap){
                this.$refs.perceptionMap.reset3DMap();
            }
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
        padding-top:50px!important;
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
    .perception-road{
        height: 150px;
        width: 250px;
        border:1px solid rgba(211, 134, 0, 0.5);
        position: absolute;
        bottom: 10px;
        background: #000;
        right: 10px;
        z-index:100;
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
        width: 260px;
        height: 160px;
        border:4px solid #666666;
        position: absolute;
        /*left: 800px;
        !*top: calc(440px-160px-20px);*!
        bottom:260px;*/
        z-index:1;
        padding-top: 5px;
        box-sizing: border-box;
        transition: all 2s ease-in-out;
        opacity: 0;
        /*animation: move 3s linear;*/

    }
    .style1{
        left: 310px!important;
        bottom: 0px!important;
    }
    .style2{
        transition: all 2s ease-in-out;
        opacity: 0!important;
    }
    /*@keyframes move {
        0%{transform:translate(0,0);}
        100%{transform:translate(50px,100px);}
    }*/
    .style:before{
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-top:20px solid #666666;
        border-right:16px solid transparent;
        bottom: -20px;
        left:16px;

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