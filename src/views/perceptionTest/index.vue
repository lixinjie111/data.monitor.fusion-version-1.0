<template>
    <div class="fusion-right-style">
        <div class="fusion-left-main left-style">
            <div v-for="(item, key) in drawObj">
                <p class="c-title" style="margin-top: 0px;">{{key}}</p>
                <ul class="perception-style" style="display: none;">
                    <li>
                        <span class="overview-sign fusion-sign"></span>
                        <span>感知车辆：{{item.data.length}}</span>
                    </li>
                    <li>
                        <span class="overview-sign fusion-sign"></span>
                        <!-- <span>车辆gpsTime：{{item.gpsTime}}</span> -->
                        <span>车辆gpsTime：{{domDateFormat.formatTime(item.gpsTime, "yy-mm-dd hh:mm:ss:ms")}}</span>
                    </li>
                    <li>
                        <span class="overview-sign fusion-sign"></span>
                        <!-- <span>车辆updateTime：{{item.updateTime}}</span> -->
                        <span>车辆updateTime：{{domDateFormat.formatTime(item.updateTime, "yy-mm-dd hh:mm:ss:ms")}}</span>
                    </li>
                    <li>
                        <span class="overview-sign fusion-sign"></span>
                        <span>车辆处理时间：{{item.updateTime-item.gpsTime}}ms</span>
                    </li>
                    <li>
                        <span class="overview-sign fusion-sign"></span>
                        <span>绘制gpsTime-车辆gpsTime：{{startGpsTime+(runTime*drawCount)-item.gpsTime}}ms</span>
                    </li>
                </ul>
                <ul class="perception-style">
                    <!-- <li v-for="items in item.data">
                        <span class="overview-sign perception-sign"></span>
                        <span>{{items.vehicleId.substr(0,4)+"_"+items.vehicleId.substring(items.vehicleId.length-4)}}: {{items.longitude}}, {{items.latitude}}, {{items.speed}}km/h, {{items.heading}}°, {{domDateFormat.formatTime(items.gpsTime, "hh:mm:ss:ms")}}, {{domDateFormat.formatTime(items.updateTime, "hh:mm:ss:ms")}}, {{items.updateTime-items.gpsTime}}, {{startGpsTime+(runTime*drawCount)-items.gpsTime}}</span>
                    </li> -->
                    <li v-for="items in item.data">
                        <span class="overview-sign perception-sign"></span>
                        <!--<span>{{items.vehicleId.substr(0,4)+"_"+items.vehicleId.substring(items.vehicleId.length-4)}}: {{items.longitude.toFixed(9)}}, {{items.latitude.toFixed(9)}}, {{items.speed.toFixed(1)}}km/h, {{items.heading.toFixed(1)}}°, {{domDateFormat.formatTime(items.gpsTime, "hh:mm:ss:ms")}}, {{domDateFormat.formatTime(items.updateTime, "hh:mm:ss:ms")}}, {{items.updateTime-items.gpsTime}}, {{startGpsTime+(runTime*drawCount)-items.gpsTime}}</span>-->
                        <span>{{items.vehicleId}}: {{items.longitude.toFixed(9)}}, {{items.latitude.toFixed(9)}}, {{items.speed.toFixed(1)}}km/h, {{items.heading.toFixed(1)}}°, {{domDateFormat.formatTime(items.gpsTime, "hh:mm:ss:ms")}}, {{domDateFormat.formatTime(items.updateTime, "hh:mm:ss:ms")}}, {{items.updateTime-items.gpsTime}}, {{startGpsTime+(runTime*drawCount)-items.gpsTime}}</span>
                    </li>
                </ul>
            </div>
        </div>
        <!-- <div class="map-real-time perception-style">
            <template>
                拿到第一包的数据的gpsTime作为第一帧的时间，每隔{{runTime}}ms画下一帧数据，寻找{{sectionTime}}ms间隔内的最接近点
            </template>
            <br/>
            <br/>
            <template v-if="nowTime">
                收包时间 {{nowTime|dateFormat}}
            </template>
            <br/>
            <template v-if="startGpsTime">
                第一个gpsTime {{domDateFormat.formatTime(startGpsTime, "yy-mm-dd hh:mm:ss:ms")}}
            </template>
            <br/>
            <template v-if="startGpsTime && drawCount >=0">
                当前绘制的gpsTime {{domDateFormat.formatTime(startGpsTime+(runTime*drawCount), "yy-mm-dd hh:mm:ss:ms")}}
            </template>
            <br/>
            <template v-if="startGpsTime && drawCount >=0">
                当前绘制的gpsTime {{startGpsTime+(runTime*drawCount)}}
            </template>
        </div> -->
        <div class="map-real-time perception-style">
            <template>
                {{runTime}}ms画下一帧，{{sectionTime}}ms间隔
            </template>
            <br/>
            <template v-if="nowTime">
                {{nowTime|dateFormat}}
            </template>
            <br/>
            <template v-if="startGpsTime">
                {{domDateFormat.formatTime(startGpsTime, "yy-mm-dd hh:mm:ss:ms")}}
            <!-- {{startGpsTime}} 第一个gpsTime -->
            </template>
            <br/>
            <template v-if="startGpsTime && drawCount >=0">
                {{domDateFormat.formatTime(startGpsTime+(runTime*drawCount), "yy-mm-dd hh:mm:ss:ms")}}
            </template>
        </div>
        <div id="cesiumContainer" class="c-map"></div>
    </div>
</template>
<script>
    import DateFormat from '@/utils/date.js'
    import GIS3D from '@/utilsTest/GIS3D.js'
    import PerceptionCars from '@/utilsTest/PerceptionCars.js'
    let gis3d=new GIS3D();
    let perceptionCars = new PerceptionCars();
    export default {
        data() {
            return {
                center: [parseFloat(this.$route.query.lng), parseFloat(this.$route.query.lat)],
                extend: parseFloat(this.$route.params.extend),
                currentExtent: [
                            [121.17403069999999,31.2836193],
                            [121.1760307,31.2836193],
                            [121.1760307,31.2816193],
                            [121.17403069999999,31.2816193]
                        ],
                perceptionWebsocket: null,
                perceptionConnectCount: 0,
                delayTime: parseFloat(this.$route.params.delayTime).toFixed(3)*1000*3,
                nowTime: '',
                nowTimeCount: -1,
                countTimeList: [],
                startGpsTime: '',
                drawCount: -1,
                runTime: 80,
                sectionTime: 55,
                domDateFormat: DateFormat,
                drawObj: {},
            }
        },
        filters: {
            dateFormat: function (value) {
                /*debugger*/
                if(value!=''){
                    return DateFormat.formatTime(value, "yy-mm-dd hh:mm:ss:ms");
                }else{
                    return "--"
                }
            }
        },
        watch: {
            drawCount(newVal, oldVal) {
                console.log("第"+newVal+"组数据");
            }
        },
        mounted() {
            gis3d.initload("cesiumContainer",false);
            perceptionCars.viewer=gis3d.cesium.viewer;
            //获取地图的感知区域
            this.getExtend(this.center[0],this.center[1],this.extend);
            this.onMapComplete();
            document.addEventListener('keydown',this.stepHandle);
        },
        methods: {
            onMapComplete(){
                gis3d.updateCameraPosition(this.center[0],this.center[1],39,70,-0.2369132859032279, 0.0029627735803421373);
                perceptionCars.pulseInterval = this.sectionTime;
                this.initPerceptionWebSocket();
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
                console.log(this.currentExtent);
            },
            stepHandle(event) {
                if(this.nowTime) {
                    this.drawObj = {};
                    var e = event || window.event || arguments.callee.caller.arguments[0];

                    if(e && e.keyCode==40){ //下
                        console.log("向下");
                        // if (Object.keys(perceptionCars.devObj).length > 0) {
                        //     for (let devId in perceptionCars.devObj) {
                        //         let devList = perceptionCars.devObj[devId];
                        //         if (devList.length > 0) {
                        //             //分割之前将车辆移动到上一个点
                        //             //将第一个点进行分割
                        //             let data = devList.shift();
                        //             perceptionCars.cacheAndInterpolatePerCar(data);
                        //         }
                        //     }
                        // }
                        this.drawCount++;
                        if(Object.keys(perceptionCars.devObj).length>0){
                            perceptionCars.processPerTrack(this.startGpsTime+(this.drawCount*this.runTime));
                            console.log("**************************");
                            console.log(perceptionCars.drawObj);
                            for(let attr in perceptionCars.drawObj) {
                                if(perceptionCars.drawObj[attr].length) {
                                    this.$set(this.drawObj,attr,{});
                                    this.$set(this.drawObj[attr],"data",perceptionCars.drawObj[attr]);
                                    this.$set(this.drawObj[attr],"gpsTime",perceptionCars.drawObj[attr][0].gpsTime);
                                    this.$set(this.drawObj[attr],"updateTime",perceptionCars.drawObj[attr][0].updateTime);
                                    // this.drawObj[attr] = {};
                                    // this.drawObj[attr].rcuId = attr;
                                    // this.drawObj[attr].data = perceptionCars.drawObj[attr];
                                    // this.drawObj[attr].gpsTime = perceptionCars.drawObj[attr][0].gpsTime;
                                    // this.drawObj[attr].updateTime =  perceptionCars.drawObj[attr][0].updateTime;
                                }
                            }
                            console.log(this.drawObj);
                        }
                    }
                    if(e && e.keyCode==38){ // 上
                        // console.log("向上");
                        if(this.drawCount>0) {
                            this.drawCount--;
                            if(Object.keys(perceptionCars.devObj).length>0){
                                perceptionCars.processPerTrack(this.startGpsTime+(this.drawCount*this.runTime));
                                console.log("**************************");
                                console.log(perceptionCars.drawObj);
                                for(let attr in perceptionCars.drawObj) {
                                    if(perceptionCars.drawObj[attr].length) {
                                        this.$set(this.drawObj,attr,{});
                                        this.$set(this.drawObj[attr],"data",perceptionCars.drawObj[attr]);
                                        this.$set(this.drawObj[attr],"gpsTime",perceptionCars.drawObj[attr][0].gpsTime);
                                        this.$set(this.drawObj[attr],"updateTime",perceptionCars.drawObj[attr][0].updateTime);
                                        // this.drawObj[attr] = {};
                                        // this.drawObj[attr].rcuId = attr;
                                        // this.drawObj[attr].data = perceptionCars.drawObj[attr];
                                        // this.drawObj[attr].gpsTime = perceptionCars.drawObj[attr][0].gpsTime;
                                        // this.drawObj[attr].updateTime =  perceptionCars.drawObj[attr][0].updateTime;
                                    }
                                }
                                console.log(this.drawObj);
                            }
                        }
                    }
                }
            },
            //感知车
            initPerceptionWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.perceptionWebsocket = new WebSocket(window.config.socketUrl);
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
            onPerceptionMessage(mesasge){
                if(this.nowTimeCount < 1000) {
                    let data = JSON.parse(mesasge.data);
                    let sideList = data.result.perList;
                    perceptionCars.receiveData(sideList);
                    if(!this.startGpsTime && sideList.length > 0) {
                        this.startGpsTime = sideList[0].gpsTime;
                    }
                    this.nowTime = data.time;
                    this.nowTimeCount ++;
                    this.countTimeList.push(data.time);
                }else {
                    console.log(perceptionCars.devObj);
                    this.perceptionWebsocket&&this.perceptionWebsocket.close();
                }
            },
            onPerceptionClose(data){
                console.log("感知车结束连接");
            },
            onPerceptionError(){
                console.log("感知车连接error");
                this.perceptionReconnect();
            },
            onPerceptionOpen(data){
                let perception ={
                    "action":"road_real_data_per",
                    "data":{
                        "type": 1,
                        "polygon": this.currentExtent
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
        },
        destroyed(){
            this.perceptionWebsocket&&this.perceptionWebsocket.close();
            document.removeEventListener('keydown', this.stepHandle);
        }
    }
</script>
<style lang="scss" scoped>
.left-style{
    position: absolute;
    left: 0;
    top: 100px;
    z-index: 2;
    padding-top:0px!important;
    padding-bottom:0px!important;
}
.perception-style{
    padding: 10px;
    line-height: 28px;
    font-size: 14px;
    margin:20px 0px;
    border: 1px solid rgba(211, 134, 0, 0.7);
    background: #00000082;
    li{
        letter-spacing: 1px;
        color: #cccccc;
        font-size: 14px;
        .overview-sign{
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: inline-block;
            margin-right:2px;
        }
        .fusion-font{
            word-wrap:break-word
        }
        .fusion-sign{
            background:#9b9b9b;
        }
        .perception-sign{
            background:#4eaf6b ;
        }
        .traffic-sign{
            background: #d1d151;
        }
    }
}
.map-real-time{
    position: absolute;
    width: 320px;
    font-size: 20px;
    z-index: 2;
    top: 0;
    left:50%;
    text-align: left;
    margin-left: -155px;

}
</style>