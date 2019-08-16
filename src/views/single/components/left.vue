<template>
    <div class="fusion-left-style">
        <div class="fusion-header">
            <img src="@/assets/images/logo.png" class="header-img" @click="routeGo"/>
            感知融合平台
        </div>
        <div class="fusion-left-main">
            <div class="single-info">
                <div class="single-info-header">
                    <span class="info-font">L{{singleVehicle.autoLevel}}</span>
                    <span class="vehicle-number">车牌号：{{singleVehicle.platNo}}</span>
                    <div class="real-content">
                        <!--左-->
                        <img src="@/assets/images/single/left.png"  class="turn-img" v-if="realData.turnLight=='left'">
                        <img src="@/assets/images/single/right.png" class="turn-img director-left " v-else>
                        <!--向右转 亮-->
                        <img src="@/assets/images/single/left.png" class="director-right" v-if="realData.turnLight=='right'">
                        <img src="@/assets/images/single/right.png" v-else >
                    </div>
                </div>
                <div class="info-img">
                    <img :src="singleVehicle.vehicleLogo"/>
                </div>
            </div>
            <ul class="single-real clearfix">
                    <li class="real-li">
                        <p>方向盘转角</p>
                        <div class="real-content">
                            <span class="real-img">
                                 <img src="@/assets/images/single/turn.png" class="real-turn" :style="{transform:'rotate('+realData.angle+'deg)'}"/>
                            </span>
                            <span class="real-text">{{realData.angle}}°</span>
                        </div>
                    </li>
                    <li>
                        <p>转向灯</p>
                        <div class="real-content">
                            <!--左-->
                            <img src="@/assets/images/single/left.png"  class="turn-img" v-if="realData.turnLight=='left'">
                            <img src="@/assets/images/single/right.png" class="turn-img director-left " v-else>
                            <!--向右转 亮-->
                            <!--<img src="@/assets/images/car/car-12.png" class="director-right" v-if="realData.turnLight=='right'">-->
                            <img src="@/assets/images/single/left.png" class="director-right" v-if="realData.turnLight=='right'">
                            <img src="@/assets/images/single/right.png" v-else >
                        </div>
                    </li>
                    <li class="real-li">
                        <p>油门</p>
                        <div class="real-content">
                            <div class="real-img-base oil-base">
                                <span class="real-img-style oil-style" :style="{left:oilLeftWidth+ 'px'}"></span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>刹车</p>
                        <div class="real-content">
                            <div class="real-img-base brake-base">
                                <span class="real-img-style brake-style" :style="{left:brakeLeftWidth+ 'px'}"></span>
                            </div>
                        </div>
                    </li>
                </ul>
            <div class="fusion-left-map">
                <div class="map-style" id="singleMap"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import { getVehicleBaseData,getRouteDataByVehId } from '@/api/single'
    import ConvertCoord from '@/utils/coordConvert.js'
    export default {
        data() {
            return {
                mapOption: {
                    center: this.$parent.defalutCenterPoint,
                    zoom: 11,
                    mapStyle: "amap://styles/7b007636f01d8a19e9cc2841a85dc083"
                },
                singleVehicle:{},
                routeId:'',
                all: 1,
                distanceMap: {}, //创建的地图对象
                prevLastPointPath:[],//上次请求的终点，
                carStartPoint:this.$parent.$parent.defaultCenterPoint,
                markers: {
                    markerStart: null,
                    polyline: [],
                    markerEnd: null
                },
                wholePath: [],
                webSocket:{},
                scale: 10,
                webSocketData: {
                    'action':'route',
                    'vehicleId': '',
                    'scale': 0,
                    'all': 1
                },
                vehicleId:this.$route.params.vehicleId,
                flag: true,
                count:0
            }
        },

        computed:{
            oilLeftWidth(){
                let oilData = parseFloat(this.realData.oilDoor/100);
                return parseInt(oilData*80);
            },
            brakeLeftWidth(){
                let brakeData = parseFloat(this.realData.brakePedal/100);
                return parseInt(brakeData*80)
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
            getBaseData(){
                console.log("id:"+this.$route.params.id);
                var _this = this;
                getVehicleBaseData({
                    'vehicleId': this.vehicleId,
                }).then(res => {
                    this.singleVehicle = res.vehicleBaseDetail[0];
                });
            },
            getRouteDataByVehId() {
                getRouteDataByVehId({
                    "scale": this.scale,
                    'vehicleId': this.vehicleId,
                }).then(res => {
                    let _result = res.data.pointList;
                    if(_result && _result.length > 0) {
                        this.onmessage(res);
                    }
                    this.initWebSocket();
                }).catch(error => {
                });
            },
            initWebSocket(){
                // debugger
                let _this=this;
                if ('WebSocket' in window) {
                    _this.webSocket = new WebSocket(window.cfg.socketUrl);  //获得WebSocket对象
                }
                _this.webSocket.onmessage = _this.onmessage;
                _this.webSocket.onclose = _this.onclose;
                _this.webSocket.onopen = _this.onopen;
                _this.webSocket.onerror = _this.onerror;
            },
            onmessage(message){
                // console.log("行程概览 route *********************************************");
                /*clearInterval(this.countTimer);
                this.countTime = 0;
                this.countTimer = setInterval(() => {
                    this.countTime += 1000;
                }, 1000);*/
                var _this=this;
                var json  = {};
                if(typeof message.data == "string") {
                    json = JSON.parse(message.data);
                }else {
                    json = message;
                }
                var pointList = [];
                if(this.all == 1){
                    if(json.data.pointList && json.data.pointList.length > 0){
                        pointList = json.data.pointList;
                    }else{
                        pointList = [{
                            gnss_LONG: json.data.lon,
                            gnss_LAT: json.data.lat,
                            gnss_HEAD: json.data.head
                        }];
                    }
                }else{
                    pointList = [{
                        gnss_LONG: json.data.lon,
                        gnss_LAT: json.data.lat,
                        gnss_HEAD: json.data.head
                    }];
                }
                if(pointList && pointList.length > 0) {
                    if(this.routeId != ""){
                        if(this.routeId != json.data.routeId) {
                            console.log("重新开启行程");
                            this.all = 1;
                            return false;
                        }
                    }else{
                        console.log("第一次开启行程");
                        this.routeId = json.data.routeId;
                        // console.log(this.routeId);
                        _this.carStartPoint = ConvertCoord.wgs84togcj02(pointList[0].gnss_LONG, pointList[0].gnss_LAT);
                        _this.distanceMapStart();
                    }

                    if(this.prevLastPointPath.length !=0 && pointList.length==1 && this.prevLastPointPath[0] == pointList[0].gnss_LONG && this.prevLastPointPath[1] == pointList[0].gnss_LAT){
                        this.changeLngLat();
                        return false;
                    }

                    if(pointList.length!=0){
                        this.prevLastPointPath = [pointList[pointList.length-1].gnss_LONG, pointList[pointList.length-1].gnss_LAT];
                    }

                    var handlePointList = [];
                    pointList.forEach((item, index) => {
                        if(item.gnss_LONG && item.gnss_LAT){
                            // let lnglatArr = new AMap.LngLat(item.gnss_LONG, item.gnss_LAT);
                            let lnglatArr = [item.gnss_LONG, item.gnss_LAT];
                            handlePointList.push(lnglatArr);
                        }
                    });
                    // console.log(handlePointList);
                    let _dataLength = handlePointList.length;
                    this.wholePath.push( {
                        angle: pointList[_dataLength-1].gnss_HEAD >= 0 ? pointList[_dataLength-1].gnss_HEAD : 90,
                        routeId: json.data.routeId,
                        pathList: handlePointList
                    });
                    this.changeLngLat();

                    this.all = 0;
                }
            },
            changeLngLat(){
                var _this = this;
                if(this.flag && _this.count < this.wholePath.length){
                    // console.log("----------------------------------");
                    this.flag = false;
                    if(_this.count > 0) {
                        _this.wholePath[_this.count].pathList.unshift(_this.wholePath[_this.count-1].pathList[_this.wholePath[_this.count-1].pathList.length-1]);
                    }
                    // console.log(_this.wholePath[_this.count].pathList);
                    let _pathList = _this.wholePath[_this.count].pathList;
                    _this.pointPath = [];
                    for( let i = 0; i < _pathList.length; i++){
                        let _position = ConvertCoord.wgs84togcj02(_pathList[i][0], _pathList[i][1]);
                        _this.pointPath[i] = _position;
                        // console.log(_position);
                        if(i == _pathList.length-1) {
                            //绘制线的轨迹
                            _this.distanceMapLine();
                            _this.count++;
                            _this.flag = true;
                        }
                    };
                }
            },
            onclose(data){
                console.log("结束连接");
            },
            onopen(data){
                //行程
                this.webSocketData.vehicleId = this.vehicleId;
                this.webSocketData.scale = this.scale;
                this.webSocketData.all = this.all;
                this.sendMsg(JSON.stringify(this.webSocketData));
            },
            sendMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.webSocket.send(msg); //send()发送消息
                    }
                }else{
                    return;
                }
            },
            //行程概览--绘制起点
            distanceMapStart(){
                let _this = this;
                if(!this.markers.markerStart) {
                    this.markers.markerStart = new AMap.Marker({
                        position: _this.carStartPoint,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        icon:'static/images/single/start.png',
                        offset: new AMap.Pixel(-8, -20)
                    });
                    // 将创建的点标记添加到已有的地图实例：
                    this.distanceMap.add(_this.markers.markerStart);
                }else{
                    this.markers.markerStart.setPosition(_this.carStartPoint);
                }
                this.distanceMap.setFitView(_this.markers.markerStart);
            },
            //行程概览--绘制路径
            distanceMapLine(){
                let _this = this,
                    polyline = new AMap.Polyline({
                        map: _this.distanceMap,
                        path: _this.pointPath,
                        strokeColor: "#03812e",
                        strokeWeight: 2,
                        // 折线样式还支持 'dashed'
                        strokeStyle: "solid",
                        /* // strokeStyle是dashed时有效
                         strokeDasharray: [10, 5],*/
                        lineJoin: 'round',
                        lineCap: 'round',
                        zIndex: 50
                    });
                this.markers.polyline.push(polyline);
                //绘制终点
                _this.distanceMapEnd();
                // 缩放地图到合适的视野级别
                this.distanceMap.setFitView();
                //获取缩放级别
//                this.zoom = this.distanceMap.getZoom();

            },
            //行程概览--绘制终点
            distanceMapEnd(){
                let _this = this;
                if(!this.markers.markerEnd) {
                    var _pointPath = _this.pointPath;
                    this.markers.markerEnd = new AMap.Marker({
                        position: _pointPath[_pointPath.length-1],
                        icon:'static/images/single/end.png',
                        offset: new AMap.Pixel(-20, -10),
                        autoRotation: true,
                        // angle: _this.direction-90
                        angle: _this.wholePath[_this.count].angle ? _this.wholePath[_this.count].angle-90 : 0
                    });
                    // 将创建的点标记添加到已有的地图实例：
                    this.distanceMap.add(_this.markers.markerEnd);
                }else{
                    this.markers.markerEnd.setPosition(_this.pointPath[_this.pointPath.length-1]);
                    this.markers.markerEnd.setAngle(_this.wholePath[_this.count].angle-90);
                }
                /*console.log("缩放级别:"+this.distanceMap.getZoom())*/
            },
            routeGo(){
                this.$router.push({
                    path: '/overview'
                });
            }
        },
        mounted() {
            this.distanceMap = new AMap.Map('singleMap', this.mapOption);
            this.getBaseData();
            this.getRouteDataByVehId();
        },
        destroyed(){
            //销毁Socket
            this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .single-info{
        border:1px solid rgba(211,134,0,0.5);
        text-align: center;
        height: 150px;
        .single-info-header{
           /* @include layoutMode(between);*/
            padding:10px 10px ;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0px;
            color: #ddd9d1;
            text-align: left;
            .vehicle-number{
                padding:0 6px;
            }
            .info-font{
                color: #fff;
                width: 20px;
                height: 20px;
                background:#0b5330;
                border-radius: 2px;
                letter-spacing: 2px;
                padding-left: 2px;
            }
            .real-content{
                position: relative;
                color: #d38600;
                /*@include layoutMode(both);*/
                box-sizing: border-box;
                display: inline-block;
                img{
                    height: 16px;
                }
                .real-img{
                    display: inline-block;
                    width: 46px;
                    height: 46px;
                    border:1px solid #d38600;
                    border-radius: 50%;
                    position: relative;
                    &:before{
                        content: '';
                        width: 0;
                        height: 0;
                        border-width:6px;
                        border-color: transparent #d38600 transparent transparent;
                        display: block;
                        border-style: solid;
                        position: absolute;
                        left:-18px;
                        top: 16px;
                    }
                    &:after{
                        content: '';
                        width: 0;
                        height: 0;
                        border-width:6px;
                        border-color: transparent  transparent transparent #d38600;
                        display: block;
                        border-style: solid;
                        position: absolute;
                        right:-18px;
                        top: 16px;
                    }
                    .real-turn{
                        position: absolute;
                        left: 20px;
                    }
                }
                .real-text{
                    position: relative;
                    right: -18px;
                }

                .turn-img{
                   /* margin-right: 4px;*/

                }
                .director-right,.director-left{
                    transform: rotate(180deg);
                }
            }
        }
        .info-img{
            display: block;
            line-height: 110px;
            height: 110px;
            img{
                height:80px;
            }
        }
    }
    .single-real{
        padding-top: 20px;
        padding-bottom: 20px;
        li{
            float: right;
            width: 48%;
            text-align: center;
            margin-bottom: 6px;
            border:1px solid rgba(211, 134, 0, 0.5);
            p{
                font-size: 14px;
                line-height: 40px;
                color: #ddd9d1;
            }

        }
        .real-li{
            float: left!important;
        }
        .real-img-base{
            display: inline-block;
            width: 80px;
            height: 0px;
            position: relative;
            .real-img-style{
                display: inline-block;
                width: 0px;
                height: 16px;
                position: absolute;
                top: -8px;
            }
        }
        .oil-base{
            border-top:2px solid #23b318;
            .oil-style{
                border-left:4px solid #23b318;
            }
        }
        .brake-base{
            border-top:2px solid #c73610;
            .brake-style{
                border-left:4px solid #c73610;
            }
        }

    }
    .fusion-left-map{
        height:150px;
        border:1px solid rgba(211,134,0,0.5);
        .map-style{
            height: 100%;
        }
    }
</style>