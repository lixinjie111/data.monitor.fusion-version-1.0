<template>
    <div class="fusion-right-style" id="fusionRight">
        <div class="map-right">
            <div class="base-info">
                <span>2019-09-23 08:00:00</span>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <span>15.6°</span>
            </div>
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
            <div class="style" id="message1" :style="{left:left1+'px',bottom:bottom1+'px',opacity:opacity}">
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1"></video-player>
            </div>
            <!--<tusvn-map :target-id="'mapFusion'"  ref="map"
                       background="black" minX=325295.155400   minY=3461941.703700  minZ=50
            maxX=326681.125700  maxY=3462723.022400  maxZ=80
            @mapcomplete="onMapComplete" @CameraChanged='cameraChanged'>
            </tusvn-map>-->
        </div>
        <div class="spat-detail clearfix" v-for="item in lightList" :style="{left:item.left+'px',top:item.top+'px'}">
            <div  v-for="(item,key) in lightData" class="spat-layout" :key="key">
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
                lightList:[],
                lightData:{
                    'key_3':{spareTime:10,time:null,lightColor:'GREEN',flag:true},
                    'key_2':{spareTime:10,time:null,lightColor:'RED',flag:true},//左转
                    'key_1':{spareTime:10,time:null,lightColor:'YELLOW',flag:true},//直行
                    'key_4':{spareTime:10,time:null,lightColor:'RED',flag:true},//右转
                },
                left1:'',
                bottom1:'',
                video1Show:true,
                option1:{},
                topPosition:0,
                leftPosition:0,
                count:0,
                opacity:0,
                spatCount:0,
                signCount:0,
                center:[]
            }
        },
        components: { TusvnMap,TusvnMap1},
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
                getMap(this.$refs.map);
                this.$refs.map.updateCameraPosition(326343.19123227906,3462351.5698124655,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
               /* setInterval(()=>{
                    let obj = this.$refs.map.getCamera();
                    console.log("x:"+obj.x+",y"+obj.y+",z:"+obj.z+",radius:"+obj.radius+",pitch:"+obj.pitch+",yaw:"+obj.yaw);
                },5000)*/
               /* this.getCurrentExtent();*/
                },
            map1InitComplete(){
                this.$refs.map1.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map1.zoomTo(10);
                this.$refs.map1.addWms("shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","gd_road_centerline",1,true,null); // 上海汽车城

            },
            cameraChanged(){
                console.log("窗口发生变化")
                this.video1Show=false;
                this.rtmp1="";
                this.getCurrentExtent();
                this.getCenter();
                this.getPerceptionAreaInfo();
                this.typeRoadData();
                let overviewMap = this.$refs.map1;
                let overviewLayerId = "overviewLayer"
                let overviewLayer = overviewMap.getLayerById(overviewLayerId);
                if(overviewLayer!=null){
                    overviewMap.removeAllFeature(overviewLayerId);
                }else{
                    overviewMap.addVectorLayer(overviewLayerId);
                }
                let currentExtend = this.currentExtent;
                overviewMap.addMultiPolygon([[[
                        [currentExtend[0],currentExtend[3]],
                        [currentExtend[0],currentExtend[1]],
                        [currentExtend[2],currentExtend[1]],
                        [currentExtend[2],currentExtend[3]],
                        [currentExtend[0],currentExtend[3]]
                    ]]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.centerAt((currentExtend[0]+currentExtend[2])/2,(currentExtend[1]+currentExtend[3])/2);

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
                    let typicalList=[{"rsPtId":"310114_002","rsPtName":"路侧点1","ptLon":121.1750307,"ptLat":31.2826193,"rspDistcodeProvince":"310000","rspDistcodeCity":"310100","rspDistcodeDistrict":"310114","rspRoadName":"博园路","mecId":"","regionId":"","rsPtPic":"1563762896617.jpg","rspRoadId":"478","rsPtIds":"","distName":"","specialInstructions":"","count":"","cloudName":"","cameraList":[{"deviceId":"N-NJ-0004","type":"N","model":"NJ01","commMode":"5","serialNum":"3402000000132000003001","factory":"NJ","workTemperature":"","voltage":"","outInterface":"","status":0,"ptLon":121.1750307,"ptLat":31.2826193,"scrappedTime":"2019-08-01 21:01:00","appVersion":"","isBind":"2","bindId":"310114_002","videoSvrUrl":"http://140.206.154.130/","protocol":"1","toward":"向前","rsPtId":"310114_002","cloudId":"1022","cloudName":"","rsPtName":"路侧点1","rspDistcode":"310114","rspDistname":"嘉定区","rspRoadName":"博园路","rspRoadId":"478","bindTime":"2019-08-01 15:04:01","cameraRunStatus":"2","cameraMonitorStatus":"0"}]}];
                    let sideList = [];
                    /*let typicalList = data.shortList;*/
                    let count=0;
                    typicalList.forEach((item,index)=>{
                        if(index==0){

                            //球面坐标转成三维坐标
                            let utm = this.$refs.map.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.ptLon, item.ptLat);
                            //三维坐标转成平面像素
                            let pixel = this.$refs.map.worldToScreen(utm[0],utm[1],12.86);

                            /*let pixel = this.$refs.map.getPixelFromCoordinate([item.ptLon, item.ptLat]);*/
                            this.left1 = parseInt(pixel[0]);
                            let ele = document.getElementById('fusionRight');
                            let topPosition = ele.clientHeight;//整个高度减去弹出框的高度
                            this.bottom1=topPosition-parseInt(pixel[1]);
                            this.opacity=1;
                            let camera = item.cameraList[0];
                            //地图移动停止10s
                            let time = setTimeout(()=>{
                                this.video1Show=true;
                                this.getVideo(camera,index);
                                clearTimeout(time);
                            },50)
                        }
                        count++;
                    })
                    /*let sideList = data.sideList;*/
                    sideList.forEach(item=>{
                        this.$refs.map.addImgOverlay('road'+count, 'static/images/fusion/roadSide.png', 0, item.ptLon, item.ptLat, "{'data':'5'}", [10,10], this.imgClick);
                    })
                });
            },
            getVideo(camera,index){
                let _this = this;
                //播放20s移动到下方
                let time1 = setTimeout(()=>{
                    let ele = document.getElementById("message1");
                    ele.className="style style1";
                    clearTimeout(time1);
                },1000)
                getVideoByNum({
                    "protocal": camera.protocol,
                    "serialNum": camera.serialNum
                }).then(res => {
                    if(index==0){
                        _this.rtmp1 = res.data.rtmp;
                        if(_this.rtmp1==""){
                            //                console.log("rtmp1----")
                            _this.option1.notSupportedMessage="";
                            _this.option1.notSupportedMessage='视频流不存在，请稍候重试';
                        }else{
                            _this.option1.notSupportedMessage= '此视频暂无法播放，请稍候再试';
                            _this.option1.sources[0].src=_this.rtmp1;
                        }
                    }
                })
            },
            getCurrentExtent() {
                this.currentExtent = [];
                let result = this.$refs.map.getExtent();
                let utm1 = this.$refs.map.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
                let utm2 = this.$refs.map.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);
                let x1 = utm1[0];
                let y1 = utm1[1];
                let x2 = utm2[0];
                let y2 = utm2[1];
               /* this.currentExtent.push([x2, y1]);
                this.currentExtent.push([x1, y1]);
                this.currentExtent.push([x1, y2]);
                this.currentExtent.push([x2, y2]);*/
               this.currentExtent=[[121.17979423666091,31.279518991604288],[121.16305725240798,31.279518991604288],[121.16305725240798,31.289571910992105],[121.17979423666091,31.289571910992105]];
//                console.log("边界值" + this.currentExtent);
                this.$emit('getCurrentExtent', this.currentExtent);

            },
            getCenter(){
                this.center= [];
                let result = this.$refs.map.getExtent();
//                let utm1 = this.$refs.map.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
//                let utm2 = this.$refs.map.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);
                let utm1 = [121.16305725240798,31.279518991604288];
                let utm2 = [121.17979423666091,31.289571910992105];
                let x1 = utm1[0];
                let y1 = utm1[1];
                let x2 = utm2[0];
                let y2 = utm2[0];
                let x0 = (x1+x2)/2;
                let y0 = (y1+y2)/2;
                this.center.push([x0,y0]);
                console.log("中心点："+this.center);
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
                        let utm = this.$refs.map.coordinateTransfer("+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",item.centerX, item.centerY);
                        this.$refs.map.addModel('traffic_sign_stop_0','./static/map3d/models/traffic_sign_stop.3ds',utm[0],utm[1],12.68);
                    })
                    spats.forEach(item=>{
                        //球面坐标转成三维坐标
                        let utm = this.$refs.map.coordinateTransfer("EPSG:4326","+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.centerX, item.centerY);
                        //三维坐标转成平面像素
                        let pixel = this.$refs.map.worldToScreen(utm[0],utm[1],12.86);
                        let obj = {};
                        obj.left = parseInt(pixel[0]);
                        obj.top = parseInt(pixel[1]);
                        this.lightList.push(obj);
                        this.spatCount++;
                    })
                    this.$emit("count",this.signCount,this.spatCount);
                })
            },
        },
        mounted() {
            this.option1 = this.getOption();
            /*let time1 = setTimeout(()=>{
                let ele = document.getElementById("message1");
                ele.className="style style1";
                clearTimeout(time1);
            },1000)*/
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
        z-index:1;
        transition: all 2s ease-in-out;
        opacity: 0;
        /*animation: move 3s linear;*/

    }
    .style1{
        left: 0!important;
        bottom: 0!important;

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
        z-index: 1;
        .spat-layout{
            float: left;
            margin-left: 8px;
        }
        .spat-detail-style{
            width: 86px;
            height: 40px;
            border-radius: 20px;
            background-color:rgba(0,0,0,0.5);
            box-sizing: border-box;
            padding:6px 2px;
            /*float: left;
            margin-left: 20px;*/
            @include layoutMode(align);

            .spat-detail-img{
                width: 32px;
                height: 32px;
                background-color: rgba(0,0,0,0.8);
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
</style>