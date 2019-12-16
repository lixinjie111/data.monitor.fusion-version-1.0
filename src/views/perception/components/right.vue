<template>
    <div class="fusion-right-style" id="fusionRight">
        <img class="img-style" src="@/assets/images/perception/3d1.png" @click="changeMap(0)" v-show="param==-1"/>
        <img class="img-style" src="@/assets/images/perception/2d1.png" @click="changeMap(-1)" v-show="param!=-1&&mapShow"/>
        <div class="c-pulse-time map-time" v-show="isShow=='true'">{{statisticData}}</div>
        <div class="c-pulse-time">{{processDataTime|dateFormat}} </div>
        <div class="video-style">
            <div v-for="(item,index) in camList"  v-if="camList.length>0" :class="[item.magnify?'magnify-style':'video-position']">
                <div class="style">
                    <div class="video-mask" @click="screenMagnify(item)"></div>
                    <live-player
                            :requestVideoUrl="requestVideoUrl"
                            :params="item.params"
                            type="wsUrl"
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
        <div id="cesiumContainer" class="c-map">
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap1 from './TusvnMap.vue';
    import DateFormat from '@/utils/date.js'
    import LivePlayer from '@/components/livePlayer'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData,getCameraByRsId} from '@/api/fusion'

    import GIS3D from '@/utils/GIS3D.js' 
    import PerceptionCars from '@/utils/PerceptionCars.js'
    import ProcessCarTrack from '@/utils/ProcessCarTrack.js'
    import ProcessData from '@/utils/ProcessData.js'
    let gis3d;
    let perceptionCars ;
    let platCars;
    let processData;
    export default {
        data() {
            return {
                spatCount:0,
                signCount:0,
                center:[],
                platformWebsocke:null,
                perceptionWebsocket:null,
                spatWebsocket:null,
                warningWebsocket:null,
                pulseWebsocket:null,
                param:1, //平面 俯视
                statisticData:'',
                x:0,
                y:0,
                isActive:0,
                vehData:[],
                alertCount:0,
                warningData:{},
                warningCount:0,
                lastLightObj:{},
                processDataTime:'',
                mapShow:false,
                mapInitTime:'',
                currentExtent:[],
                mapParam:{}, //参数待定
                camList:[],
                requestVideoUrl:getVideoByNum,
                tabIsExist:true,
                warningConnectCount:0,
                cancelConnectCount:0,
                platformConnectCount:0,
                perceptionConnectCount:0,
                spatConnectCount:0,
                pulseConnectCount:0,
                cancelWarningCount:0, //取消告警重连数量

                warningObj:{}, // 参数待定
                pulseNowTime:'',
                delayTime:'',
                pulseInterval:40,

                pulseCount:0,
                spatPulseCount:0,
                warningPulseCount:0,
                staticPulseCount:0,
                staticCacheCount:0,
                warningCacheCount:0,

                staticWarning:[],
                dynamicWarning:[],
                removeWarning:[],
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
        components: {TusvnMap1,LivePlayer},
        watch: {
            '$route':{
                handler(newValue, oldValue) {
                    this.isShow = newValue.query.isShow;
                },
                immediate: true,
//                deep: true
            }
        },
        filters: {
            dateFormat: function (value) {
                if(value!=''){
                    let time = DateFormat.formatTime(value,'yy-mm-dd hh:mm:ss:ms');
                    return time;
                }
            }
        },
        mounted() {
            let _this = this;
            gis3d=new GIS3D();
            perceptionCars = new PerceptionCars();
            platCars = new ProcessCarTrack();
            processData = new ProcessData();

            gis3d.initload("cesiumContainer",false);
//            gis3d.add3DInfoLabel("TI02_40_20191114151017374_rsi", "限速",  121.1960677,31.2967565, 20)
            perceptionCars.viewer=gis3d.cesium.viewer;
//            perceptionCars.initPerceptionCount(gis3d.cesium.viewer);

            platCars.models={};
            platCars.viewer=gis3d.cesium.viewer;
            // platCars.processPlatformCarsTrack();

            _this.mapParam=window.mapParam;
            _this.rsId = _this.$route.params.crossId;
            /* this.currentExtent=[[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]];*/

            let longitude=parseFloat(_this.$route.query.lng);
            let latitude=parseFloat(_this.$route.query.lat);
            let extend = parseFloat(_this.$route.params.extend);
            _this.delayTime= parseFloat(_this.$route.params.delayTime).toFixed(3)*1000;
            //设置地图的中心点
            if(longitude||latitude) {
//                let utm = gis3d.coordinateTransfer("EPSG:4326", "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs", longitude, latitude);
//                _this.x = utm[0];
//                _this.y = utm[1];
                _this.x = longitude;
                _this.y = latitude;
                _this.getExtend(longitude,latitude,extend);
                console.log(_this.currentExtent)
                _this.center=[longitude ,latitude];
            }else{
                _this.currentExtent=window.currentExtent;
//                _this.center=[121.247,31.242];
                _this.getExtentCenter();
            }
            _this.getCameraByRsId();
            _this.onMapComplete();
            //判断当前标签页是否被隐藏
            document.addEventListener("visibilitychange",this.processTab);
        },
        methods: {
            formatTime(value){
                let time = DateFormat.formatTime(value,'hh:mm:ss:ms');
                return time;
            },
            onMapComplete(){

//                    this.$refs.perceptionMap.updateCameraPosition(x,y,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                /*setInterval(()=>{
                    let camera = this.$refs.perceptionMap.getCamera();
                    console.log(camera.x,camera.y,camera.z,camera.radius,camera.pitch,camera.yaw)
                },500)*/

                //初始化车辆步长以及平台车阀域范围
                platCars.stepTime = this.pulseInterval;
                platCars.pulseInterval = this.pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
                platCars.platMaxValue = this.pulseInterval*1.5;

                perceptionCars.stepTime = this.pulseInterval;
                perceptionCars.pulseInterval = parseInt(this.pulseInterval)*0.8;
                perceptionCars.perMaxValue = this.pulseInterval*1.5;

                let spatPulse = this.pulseInterval*30;
                processData.pulseInterval = spatPulse*0.8;
                processData.spatMaxValue =  spatPulse*1.5;

                let warnPulse = this.pulseInterval*10;
                processData.warnPulseInterval = warnPulse*0.8;
                processData.warnMaxValue = warnPulse*1.5;

                let cancelPulse = this.pulseInterval;
                processData.cancelPulseInterval = cancelPulse*0.8;
                processData.cancelMaxValue = cancelPulse*1.5;

                let count=0;
                let flag=false;
                let camParam;
                gis3d.addRectangle(this.currentExtent[3][0],this.currentExtent[3][1],this.currentExtent[1][0],this.currentExtent[1][1]);
//                this.$refs.perceptionMap.updateCameraPosition(325858.13269265386,3462417.7786351065,2217.2500985424986,2215.0552566139654,-1.5707963267948966,-2.7837857073883954);
                if(this.camList.length>0&&this.camList[0].camParam){
                    camParam = this.camList[0].camParam;
//                    gis3d.updateCameraPosition(camParam.x,camParam.y,camParam.z,camParam.radius,camParam.pitch,camParam.yaw);
//                    gis3d.updateCameraPosition(112.94760914128275, 28.325093927226323,39,70,-0.2369132859032279, 0.0029627735803421373);
//                    gis3d.updateCameraPosition(121.1727923, 31.2840917,39,70,-0.2369132859032279, 0.0029627735803421373);
                     gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                    this.getData();
                    this.mapShow=true;
                    return;
                }
//                5s没有 默认值
                this.mapInitTime = setInterval(()=>{
                    if(this.camList.length>0&&this.camList[0].camParam){
                        camParam = this.camList[0].camParam;
//                      gis3d.updateCameraPosition(camParam.x,camParam.y,camParam.z,camParam.radius,camParam.pitch,camParam.yaw);
                         gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                        this.getData();
                        clearInterval(this.mapInitTime);
                        this.mapShow=true;
                        return;
                    }
                    count++;
                    if(count==10){
//                        gis3d.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,window.defaultMapParam.radius,window.defaultMapParam.pitch,window.defaultMapParam.yaw);
                            gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                        this.getData();
                        this.mapShow=true;
                        clearInterval(this.mapInitTime);
                    }
                },100)
            },
            getData(){
                this.typeRoadData();
                this.initPulseWebSocket();
                this.getMap();
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
                overviewMap.addMultiPolygon([[currentExtend]], "rectangle",
                    [255,0,0,0.4],[255,0,0,1], "round",
                    "round", [5,0], null,
                    null, 1, overviewLayerId);

                overviewMap.centerAt((currentExtend[0][0]+currentExtend[2][0])/2,(currentExtend[0][1]+currentExtend[2][1])/2);
            },
            getCameraByRsId(){
                getCameraByRsId({"rsId":this.rsId}).then(res => {
                    let data = res.data;
                    let cameraList = data.camLst;
                    this.camList = cameraList;
                    if(this.camList.length>0){
                        this.camList.forEach(item=>{
                            let params={
                                "serialNum": item.sn,
                                "protocal": item.protocal
                            }
                            item.params = params;
                            item.rsPtName=data.rsName;
                            this.$set(item,"magnify",false);
//                        item.videoShow=false;
                        })
                    }
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
                let utm1 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
                let utm2 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);

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
                let utm1 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.max.x, result.max.y);
                let utm2 = this.$refs.perceptionMap.coordinateTransfer("+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs","EPSG:4326",result.min.x, result.min.y);
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
            getExtentCenter(){
                let extent = window.currentExtent;
                this.center = [];
                let x0 = extent[1][0];
                let x1 = extent[3][0];
                let y0 = extent[1][1];
                let y1 = extent[3][1];
                let centerX = (x0+x1)/2;
                let centerY = (y0+y1)/2;
                this.center.push(centerX);
                this.center.push(centerY);
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
//                            let utm = this.$refs.perceptionMap.coordinateTransfer("EPSG:4326","+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",item.centerX, item.centerY);
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
                    this.$parent.spatCount = this.spatCount;
                    this.$parent.signCount = this.signCount;
//                    this.$emit("count", this.signCount, this.spatCount);
                })
            },
            changeMap(param){
                if(param==-1){
                    this.param=-1;
                    this.isActive=-1;
                    //  gis3d.updatePosition(112.75003033070373, 28.106432159727982, 121.431, 28.526432159727982);
                    gis3d.updatePosition(121.063,31.113,121.431,31.371);
                    return;
                }
                if(this.camList.length>0){
                    let cameraParam = this.camList[param].camParam;
                    if(cameraParam){
                         gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                        // gis3d.updateCameraPosition(this.x,this.y,cameraParam.z,70,-0.2369132859032279, 0.0029627735803421373);
                    }else{
                         gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                        // gis3d.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,70,-0.2369132859032279, 0.00296277358034？21373);
                    }
                }else{
                     gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);
                    // gis3d.updateCameraPosition(window.defaultMapParam.x,window.defaultMapParam.y,window.defaultMapParam.z,70,-0.2369132859032279, 0.0029627735803421373);
                }
                this.isActive=param;
                this.param=param;
            },
            screenMagnify(item){
                item.magnify = !item.magnify;
//                let videoUrl = this.camList[param].videoUrl;
//                if(videoUrl!=''){
//                    this.camList[param].videoShow=true;
//                }
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
            onWarningMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let data = json.result;
                if(data&&data.length>0){
                    data.forEach(rcuItem=>{
                        let item = rcuItem.data;
                        let warnId = item.warnId.substring(0,item.warnId.lastIndexOf("_"));
                        //判断事件是否被取消
                        if(this.removeWarning.indexOf(item.warnId)==-1){
//                            console.log(processData.cancelWarning.indexOf(item.warnId)==-1);
                            //如果是静态事件
                            if(!item.isD){
                                //如果是静态事件，收到确认
                                let warning = {
                                    "action":"cloud_event",
                                    "body":{
                                        "warnId":item.warnId,
                                        "status":1
                                    },
                                    "type":2
                                }
                                let warningMsg = JSON.stringify(warning);
                                this.sendWarningMsg(warningMsg);
                                item.warnId = warnId;
                                let array = processData.staticWarning[warnId];
                                if(!array){
                                    processData.staticWarning[warnId] = new Object();
                                }
                                processData.staticWarning[warnId]=item;

                            }else{
                                let array = processData.dynamicWarning[warnId];
                                if(!array){
                                    processData.dynamicWarning[warnId] = new Array();
                                }
                                item.warnId = warnId;
                                processData.dynamicWarning[warnId].push(item);
                            }
                        }
//                       let warningData = rcuItem.data;
//                       if(warningData&&warningData.length>0){
//                           warningData.forEach(item=>{
//
//                           })
//                       }
                    });
                }
//                this.processWarn(json);
            },
            onWarningClose(data){
                console.log("告警结束连接");
                this.warningReconnect();
            },
            onWarningError(){
                console.log("告警连接error");
                this.warningReconnect();
            },
            onWarningOpen(data){
                //旁车
                let warning ={
                    "action":"cloud_event",
                    "body":{
                        "region":this.currentExtent,
                    },
                    "type":1
                }
//                let warning ={
//                    "action":"cloud_event",
//                    "body":{
//                        "region":this.currentExtent,
//                    },
//                    "type":1    //发请求
//                }
                let warningMsg = JSON.stringify(warning);
                this.sendWarningMsg(warningMsg);
            },
            sendWarningMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.warningWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.warningWebsocket.send(msg); //send()发送消息
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
            processWarn(warningData){
                let _this = this;
                let warnId = warningData.warnId;
                if(warnId){
                    //如果告警第一次画
                    if(!_this.warningData[warnId]){
                        console.log(warnId);
                        _this.warningCount++;
                        _this.warningData[warnId] = {
                            warnId: warnId,
                            id:warnId,
                            msg:warningData.warnMsg,
                            longitude:warningData.longitude,
                            latitude:warningData.latitude
                        }
                        gis3d.add3DInfoLabel(warnId,warningData.warnMsg,warningData.longitude,warningData.latitude,20);
                    }else{
                        //判断是否需要更新
                        if(warningData.longitude != _this.warningData[warnId].longitude || warningData.latitude != _this.warningData[warnId].latitude) {
                            gis3d.update3DInfoLabel(warnId,warningData.warnMsg);
                        }
                    }
                }
            },

            //取消告警
            initCancelWarningWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.cancelWarningWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                        _this.cancelWarningWebsocket.onmessage = _this.onCancelWarningMessage;
                        _this.cancelWarningWebsocket.onclose = _this.onCancelWarningClose;
                        _this.cancelWarningWebsocket.onopen = _this.onCancelWarningOpen;
                        _this.cancelWarningWebsocket.onerror = _this.onCancelWarningError;
                    }else {
                        _this.$message("此浏览器不支持websocket")
                    }
                }catch (e){
                    _this.cancelWarningReconnect();
                }

            },
            onCancelWarningMessage(message){
                let _this=this;
                let json = JSON.parse(message.data);
                let warnId = json.result;
                let cancelWarning = {
                    "action":"event_cancel",
                    "body":{
                        "events":warnId,
                        "status":1
                    },
                    "type":2
                }
                let cancelWarningMsg = JSON.stringify(cancelWarning);
                this.sendCancelWarningMsg(cancelWarningMsg);
                if(processData.cancelWarning.indexOf(warnId)==-1){
                    processData.cancelWarning.push(warnId);
                }
//                this.processWarn(json);
            },
            onCancelWarningClose(data){
                console.log("告警结束连接");
                this.cancelWarningReconnect();
            },
            onCancelWarningError(){
                console.log("告警连接error");
                this.cancelWarningReconnect();
            },
            onCancelWarningOpen(data){
                //旁车
                let cancelWarning ={
                    "action":"event_cancel",
                    "body":{"busType":"rsi"},
                    "type":1
                }
                let cancelWarningMsg = JSON.stringify(cancelWarning);
                this.sendCancelWarningMsg(cancelWarningMsg);
            },
            sendCancelWarningMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.cancelWarningWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.cancelWarningWebsocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            cancelWarningReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.cancelWarningCount>=10){
                    return;
                }
                this.initWarningWebSocket();
                //重连不能超过5次
                this.cancelWarningCount++;
            },
            processCancelWarn(data){
                data.forEach(warnId=>{
                    if (this.warningCount > 0) {
                        this.warningCount--;
                        this.$parent.warningCount = this.warningCount;
                        delete this.warningData[warnId];
                        console.log("移除事件"+warnId)
                        gis3d.remove3DInforLabel(warnId);
                        this.removeWarning.push(warnId);
                        delete processData.cancelWarning[warnId];
                    }
                })
            },

            //平台车
            initPlatformWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.platformWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
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
                platCars.receiveData(json,this.pulseNowTime);

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
                        "polygon": this.currentExtent
                    },
                    "type": 3
                }
                //旁车
                /*let platform = {
                    "action": "road_real_data_reg",
                    "data": {
//                        "polygon": [[121.431,31.113],[121.063,31.113],[121.063,31.371],[121.431,31.371]]
                        "polygon":this.currentExtent
                    }
                }*/
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

            //感知车
            initPerceptionWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.perceptionWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
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
            onPerceptionMessage(message){
                let _this=this;
                let data = JSON.parse(message.data)
                if(_this.isCapture=='true'){
                    if(_this.captureCount>1000){
                        return;
                    }
                    _this.perCaptureList.push(data);
                    _this.captureCount++;
                    return;
                }
                let sideList = data.result.perList;
                perceptionCars.receiveData(sideList);

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
                        "type":1,
                        "polygon":this.currentExtent
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

            //红绿灯
            initSpatWebSocket(){
                let _this=this;
                try {
                    if ('WebSocket' in window){
                        _this.spatWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
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
                let json = JSON.parse(message.data);
                let data = json.result.data;
                processData.receiveLightData(data);
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
                let spat ={
                    "action":"spat",
                    "data":{
                        "polygon":this.currentExtent
                    },
                    "type":2
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
                        if(array.length==1){
                            array=['0',array[0]]
                        }
                        let img1;
                        let img2;
                        let img3;
                        let lastItem;
                        let keys = Object.keys(_this.lastLightObj);
                        if(keys&&keys.length>0){
                            lastItem = _this.lastLightObj[item.spatId];
                        }
                        if(!_this.tabIsExist){
                            lastItem={};
                        }
//                        console.log(lastItem,item)
                        let _direction = '';
                        if(item.direction==1) {
                            _direction = 'cross';
                        }
                        if(item.direction==2) {
                            _direction = 'left';
                        }
                        if(item.direction==3) {
                            _direction = 'turn';
                        }
                        if(item.direction==4) {
                            _direction = 'right';
                        }
                        let _color = item.light.toLowerCase();
                        //每个路灯相位都是固定的
                        if(lastItem&&lastItem.light==item.light&&lastItem.direction==item.direction){
                            img1="";
                        }else{
                            img1='./static/images/light/'+_direction+'-'+_color+'.png';
                        }
                        if(lastItem&&lastItem.first==array[0]&&lastItem.light==item.light){
                            img2=''
                        }else {
                            img2 = _this.getNumPng(_color,array[0]);
                        }
                        if(lastItem&&lastItem.second==array[1]&&lastItem.light==item.light){
                            img3=''
                        }else {
                            img3 = _this.getNumPng(_color,array[1]);
                        }

                        light.id=item.spatId;
                        light.img1=img1;
                        light.img2=img2;
                        light.img3=img3;
//                        console.log(light)
                        gis3d.updateLight(light);
                        let obj = {
                            direction:item.direction, //直行 左转 右转
                            light:item.light,
                            first:array[0],
                            second:array[1]

                        }
//                        console.log(item.spatId,obj);
//                        if(item.spatId==277){
//                            console.log("---------")
//                            console.log(item)
//                        }
                        _this.lastLightObj[item.spatId]=obj;
//                            console.log(item.spatId,light);
                        // _this.$refs.perceptionMap.addStaticModel_light_1(light);
                        //地图渲染剩余时间
                    })
                }
            },
            getNumPng(color,num){
                let _color = color.toLowerCase();
                let img = './static/images/light/'+_color+'_'+num+'.png';
                return img;
            },
            getExtend(x,y,r){
                this.currentExtent=[];
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                this.currentExtent.push([x1, y0]);
                this.currentExtent.push([x0, y0]);
                this.currentExtent.push([x0, y1]);
                this.currentExtent.push([x1, y1]);
            },
            processTab(){
                if(document.visibilityState == "hidden") {
                    this.tabIsExist=false;
                } else if (document.visibilityState == "visible") {
                    this.tabIsExist=true;
                }
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
            onPulseMessage(message){
                let json = JSON.parse(message.data);
                let result = json.result;
                let _this = this;
                if(_this.pulseNowTime==''){
                   _this.initPerceptionWebSocket();
                   _this.initPlatformWebSocket();
                   _this.initWarningWebSocket();
                   _this.initSpatWebSocket();
                   _this.initCancelWarningWebSocket();
                }
                _this.pulseNowTime = result.timestamp;
                _this.pulseCount++;

                //缓存次数控制
                if(_this.warningCacheCount>0){
                    _this.warningCacheCount++;
                }
                //有告警事件开始缓存
                if(Object.keys(processData.dynamicWarning).length>0){
                    if(_this.warningCacheCount==0){
                        _this.warningCacheCount++;
                    }
                }
                //静态事件缓存次数控制
                if(_this.staticCacheCount>0){
                    _this.staticCacheCount++;
                }
                //静态告警事件开始缓存
                if(Object.keys(processData.staticWarning).length>0){
                    if(_this.staticCacheCount==0){
                        _this.staticCacheCount++;
                    }
                }

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
//                            console.log(vehicleId+"————————"+platCars.cacheAndInterpolateDataByVid[vehicleId].cacheData.length)
                        }
                    }
                }
                if (Object.keys(perceptionCars.devObj).length > 0){
                    for (let devId in perceptionCars.devObj) {
                        let devList = perceptionCars.devObj[devId];
                        /*console.log("*****")
                        console.log(vehicleId,dataList.length)*/
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
                let pulseNum = _this.delayTime*2/40;
                if(_this.pulseCount>=pulseNum) {

                    //当平台车开始插值时，调用其他接口
                    _this.processDataTime = result.timestamp-_this.delayTime;
//                    console.log(_this.pulseCount,_this.pulseCount%3,Object.keys(perceptionCars.devObj).length);
                    if(Object.keys(perceptionCars.devObj).length>0){
                        let perList = perceptionCars.processPerTrack(result.timestamp,_this.delayTime);
                        if(perList){
                            if(perList.length>0){
                                _this.processPerData(perList[0]);
                                let pernum = 0;
                                let persons = 0;
                                let nonNum = 0;
                                let perData={};
                                perList.forEach(item=>{
                                    let cars = item.data;
                                    if(cars.length>0) {
                                        for (let i = 0; i < cars.length; i++) {
                                            let obj = cars[i];
                                            if (obj.targetType == 0){
                                                persons++;
                                            }

                                            if (obj.targetType == 2||obj.targetType == 5 || obj.targetType == 7) {
                                                pernum++;
                                            }

                                            if(obj.targetType == 1 || obj.targetType == 3){
                                                nonNum++;
                                            }
                                        }
                                    }
                                });
                                perData['veh']=pernum;
                                perData['person'] = persons;
                                perData['noMotor'] = nonNum;
//                                console.log(perData)
                                this.$parent.perceptionData = perData;
                            }
                        }
                    }
                    //平台车
                    if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
                       let platCar =  platCars.processPlatformCarsTrack(result.timestamp,_this.delayTime);
                       if(platCar){
                           this.$parent.vehData = platCar['vehData'];
                       }
                    }

                    //取消告警
                    if(processData.cancelWarning.length>0){
                        let cancelData = [];
                        //查找现有告警是否有取消告警
                        processData.cancelWarning.forEach(warnId=>{
                            //如果有告警 则进行删除
                            if(_this.warningData[warnId]){
                                cancelData.push(warnId);
                            }
                        })
                        if(cancelData.length>0){
                            _this.processCancelWarn(cancelData);
                        }
                    }

                    //每隔80ms一次
                    if(_this.spatPulseCount==0||_this.spatPulseCount>=30){
//                        console.log(_this.spatPulseCount);
                        _this.spatPulseCount=1;
                        if(Object.keys(processData.spatObj).length>0){
//                            console.log("spatPulseCount:"+_this.spatPulseCount)
                            let data = processData.processSpatData(result.timestamp,_this.delayTime);
                            if(data&&data.length>0){
                                _this.drawnSpat(data);
                            }
                        }
                    }
                    _this.spatPulseCount++;
                }

                //执行动态告警
                if(_this.warningCacheCount>pulseNum&&(_this.warningPulseCount==0||_this.warningPulseCount>=10)){
                    _this.warningPulseCount=1;
                    if(Object.keys(processData.dynamicWarning).length>0){
                        for(let warnId in processData.dynamicWarning){
                            let data = processData.processWarningData(result.timestamp,_this.delayTime,warnId);
                            if(data){
                                _this.processWarn(data);
                            }
                        }
                        //此次告警结束，将总数传递出去
                        _this.$parent.warningCount = _this.warningCount;
                    }
                }
                _this.warningPulseCount++;

                //执行静态告警
                if(_this.staticCacheCount>pulseNum&&(_this.staticPulseCount==0||_this.staticPulseCount>=10)){
                    _this.staticPulseCount=1;
                    //静态事件的处理
                    if(Object.keys(processData.staticWarning).length>0){
                        for(let warnId in processData.staticWarning){
                            let staticData = processData.processStaticData(result.timestamp,_this.delayTime);
                            if(staticData&&staticData.length>0){
                                console.log("length:"+staticData.length)
                                //静态事件
                                staticData.forEach(item=>{
                                    _this.processWarn(item);
                                })
                            }
                        }
                        //此次告警结束，将总数传递出去
                        _this.$parent.warningCount = _this.warningCount;
                    }
                }
                _this.staticPulseCount++;
            },
            onPulseClose(data){
                console.log("感知车结束连接");
                this.pulseReconnect();
            },
            onPulseError(){
                console.log("感知车连接error");
                this.pulseReconnect();
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
        },
        destroyed(){
            gis3d.destroyed();
            gis3d=null;
            perceptionCars=null ;
            platCars=null;
            processData=null;
            clearInterval(this.mapInitTime);
            this.warningWebsocket&&this.warningWebsocket.close();
            this.cancelWarningWebsocket&&this.cancelWarningWebsocket.close();
            this.platformWebsocket&&this.platformWebsocket.close();
            this.perceptionWebsocket&&this.perceptionWebsocket.close();
            this.spatWebsocket&&this.spatWebsocket.close();
            this.pulseWebsocket&&this.pulseWebsocket.close();
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
        background: #000;
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
        background: #00000082;
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