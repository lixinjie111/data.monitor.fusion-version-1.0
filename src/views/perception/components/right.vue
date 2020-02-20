<template>
    <div class="c-position-trbl">
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap(0)" v-show="param==-1"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap(-1)" v-show="param!=-1"/>
        <div class="c-fusion-right video-style">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <div v-for="(item,index) in camList"  v-if="camList.length>0" :class="[item.magnify?'m-magnify-style':'c-fusion-box']">
                        <div class="video-screen-btn" @click="screenMagnify(item)"></div>
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
                    <div v-for="item in new Array(2)" class="c-fusion-box" v-if="camList.length==0">
                        <div class="c-video-16-9">
                            <div class="c-video-empty">暂无数据</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="perception-road clearfix" id="mapRoad">
                <tusvn-map
                    class="c-fusion-box m-tusvn-map"
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
                // iframeUrl: window.config.staticUrl+'cesium-map/modules/fusionMonitor/'+this.$route.name+'.html?crossId='+this.$route.params.crossId+'&delayTime='+this.$route.params.delayTime+'&extend='+this.$route.params.extend+'&lng='+this.$route.query.lng+'&lat='+this.$route.query.lat+'&isShowMapElement='+this.$route.query.isShowMapElement,
                iframeUrl: 'http://127.0.0.1:8082/modules/fusionMonitor/'+this.$route.name+'.html?crossId='+this.$route.params.crossId+'&delayTime='+this.$route.params.delayTime+'&extend='+this.$route.params.extend+'&lng='+this.$route.query.lng+'&lat='+this.$route.query.lat+'&isShowMapElement='+this.$route.query.isShowMapElement,
                center:[],
                currentExtent:[],
                perExtent:[],
                x:0,
                y:0,
                param:1, //平面 俯视
                camList:[],
                mapShow:false,
                isActive:0,
                requestVideoUrl:getVideoByNum
            }
        },
        components: {TusvnMap,LivePlayer},
        mounted() {
            this.rsId=this.$route.params.crossId;
            let extend = parseFloat(this.$route.params.extend);
            let longitude=parseFloat(this.$route.query.lng);
            let latitude=parseFloat(this.$route.query.lat);
            //设置地图的中心点
            this.x = longitude;
            this.y = latitude;
            this.currentExtent = GetExtend.getExtend(longitude,latitude,extend);
            this.perExtent = GetExtend.getExtend(longitude,latitude,window.extend);
            this.center=[longitude ,latitude];
        },
        methods: {
            onLoadMap(){
                // 获取摄像头列表
                if(!sessionStorage.getItem("sTypeRoadCamLst")) {
                    this.getCameraByRsId();
                }else {
                    let _data = sessionStorage.getItem("sTypeRoadCamLst");
                    this.postCamListMessage(_data);
                }
                
                // 获取路侧点列表
                let _sideListData = {
                    type: 'updateSideList',
                    data: sessionStorage.getItem("sideList")
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_sideListData,'*');
            },
            postCamListMessage(data) {
                let _option;
                if (typeof data == 'string') {
                    _option = JSON.parse(data);
                } else {
                    _option = data;
                }
                this.camList = _option.camLst;
                this.camList.forEach(item=>{
                    let params={
                        "serialNum": item.sn,
                        "protocal": item.protocal
                    }
                    item.params = params;
                    item.rsPtName=_option.rsName;
                    this.$set(item,"magnify",false);
                })
                this.mapShow=true;
//                console.log(this.camList);
                let _camData = {
                    type: 'updateCam',
                    animationZ: 0,
                    data: this.camList[0].camParam
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_camData,'*');
            },
            getCameraByRsId(){
                getCameraByRsId({"rsId":this.rsId}).then(res => {
                    let data = res.data;
                    if(data.camLst && data.camLst.length>0){
                        this.postCamListMessage(data);
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
                let overviewLayerIdPre = "overviewLayerPre";
                let overviewLayer = overviewMap.getLayerById(overviewLayerId);
                let overviewLayerPre = overviewMap.getLayerById(overviewLayerIdPre);
                
                if(overviewLayer!=null){
                    overviewMap.removeAllFeature(overviewLayerId);
                }else{
                    overviewMap.addVectorLayer(overviewLayerId);
                }

                if(overviewLayerPre!=null){
                    overviewMap.removeAllFeature(overviewLayerIdPre);
                }else{
                    overviewMap.addVectorLayer(overviewLayerIdPre);
                }

                let currentExtend = this.currentExtent;

                overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.addMultiPolygon([[this.perExtent]], "rectangle",
                    [255,255,255,0.1],[255,255,255,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerIdPre);

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
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    @import '@/assets/scss/live-player-reset.scss';
    .map-time{
        margin-top:100px!important;
        background: #969090;
        font-size: 14px;
    }
    .perception-road{
        margin-top: 16px;
        height: 132px;
        .m-tusvn-map {
            float: right;
            width: 222px;
            margin: 0;
        }
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
        width: 400px;
        padding: 86px 10px 0;
        z-index: 4;
        .c-scroll-wrap {
            height: auto !important;
            max-height: 470px !important;
            .c-fusion-box {
                margin: 0 0 16px;
                background: $background;
                &:last-child {
                    margin: 0;
                }  
            }
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
        .m-magnify-style{
            position: absolute;
            top: 0px;
            right: 0px;
            z-index:6;
            width: 900px;
            border:1px solid rgba(211, 134, 0, 0.5);
            background: #000;
        }
        .video-screen-btn{
            position: absolute;
            right: 50px;
            bottom: 0;
            width: 80px;
            height: 46px;
            z-index: 3;
            cursor: pointer;
        }
    }

</style>