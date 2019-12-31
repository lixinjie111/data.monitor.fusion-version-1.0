<template>
    <div class="fusion-right-style" id="fusionRight">
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap(0)" v-show="param==-1"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap(-1)" v-show="param!=-1"/>
        <div class="c-pulse-time map-time" v-show="isShow=='true'">{{statisticData}}</div>
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
        <iframe 
            @load ="onLoadMap" 
            :src="iframeUrl" 
            class="c-iframe" 
            id="c-iframe">
        </iframe>
    </div>
</template>
<script>
    import TusvnMap from './TusvnMap.vue';
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    import {getVideoByNum,getCameraByRsId} from '@/api/fusion'
    import WebSocketObj from '@/assets/js/webSocket.js'
    import GetExtend from '@/assets/js/getExtend'

    export default {
        data() {
            return {
                // iframeUrl: window.config.staticUrl+'cesium-map/modules/fusionMonitor/'+this.$route.name+'.html?crossId='+this.$route.params.crossId+'&delayTime='+this.$route.params.delayTime+'&extend='+this.$route.params.extend+'&lng='+this.$route.query.lng+'&lat='+this.$route.query.lat+"&v="+new Date().getTime(),
                iframeUrl: 'http://127.0.0.1:8080/modules/fusionMonitor/'+this.$route.name+'.html?crossId='+this.$route.params.crossId+'&delayTime='+this.$route.params.delayTime+'&extend='+this.$route.params.extend+'&lng='+this.$route.query.lng+'&lat='+this.$route.query.lat+"&v="+new Date().getTime(),
                center:[],
                currentExtent:[],
                x:0,
                y:0,
                param:1, //平面 俯视
                camList:[],
                mapShow:false,

                statisticData:'',
                isActive:0,
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
        mounted() {
            this.rsId=this.$route.params.crossId;
            let extend = parseFloat(this.$route.params.extend);
            let longitude=parseFloat(this.$route.query.lng);
            let latitude=parseFloat(this.$route.query.lat);
            //设置地图的中心点
            this.x = longitude;
            this.y = latitude;
            this.currentExtent = GetExtend.getExtend(longitude,latitude,extend);
            this.center=[longitude ,latitude];

            window.addEventListener('message', this.getMessage);
        },
        methods: {
            getMessage(e) {
                // e.data为父页面发送的数据
                let eventData = e.data;
                if(eventData.isParent) {
                    this.$parent[eventData.type] = eventData.data;
                }else {
                    this[eventData.type] = eventData.data
                }
            },
            onLoadMap() {
                // 获取摄像头列表
                this.getCameraByRsId();
                
                // 获取路侧点列表
                let _sideListData = {
                    type: 'updateSideList',
                    data: sessionStorage.getItem("sideList")
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_sideListData,'*');
                // 获取标识牌和红绿灯信息
                let _lampPoleData = {
                    type: 'updateLampPoleList',
                    data: sessionStorage.getItem("lampPole")
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_lampPoleData,'*');
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
                        this.mapShow=true;

                        let _camData = {
                            type: 'updateCam',
                            animationZ: 0,
                            data: this.camList[0].camParam
                        };
                        document.getElementById("c-iframe").contentWindow.postMessage(_camData,'*');
                    }
                });
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
            changeMap(param){
                let _camData = null;
                if(param==-1){
                    this.param=-1;
                    this.isActive=-1;
                    _camData = {
                        type: 'updatePosition'
                    };
                }else {
                    _camData = {
                        type: 'updateCam',
                        animationZ: 5,
                        data: null
                    };
                    if(this.camList.length>0){
                        let cameraParam = this.camList[param].camParam;
                        if(cameraParam){
                            _camData.data = cameraParam;
                        }
                    }
                }
                document.getElementById("c-iframe").contentWindow.postMessage(_camData,'*');

                this.isActive=param;
                this.param=param;
            },
            screenMagnify(item){
                item.magnify = !item.magnify;
//                let videoUrl = this.camList[param].videoUrl;
//                if(videoUrl!=''){
//                    this.camList[param].videoShow=true;
//                }
            }
        },
        destroyed(){
            window.removeEventListener("message", this.getMessage);
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
        background: $backgroundRgba;
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
        background: $background;
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