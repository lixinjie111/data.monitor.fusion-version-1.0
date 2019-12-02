<template>
    <div class="fusion-right-style">
        <div class="map-real-time" v-if="nowTime">
            {{nowTime|dateFormat}} 收包时间
            <br/>
            <!-- <template v-if="drawCount>=0 && countTimeList[drawCount]">
                {{countTimeList[drawCount]|dateFormat}}
            </template> -->
            <template v-if="startGpsTime">
            {{domDateFormat.formatTime(startGpsTime, "yy-mm-dd hh:mm:ss:ms")}} 第一个gpsTime
            <!-- {{startGpsTime}} 第一个gpsTime -->
            </template>
            <br/>
            <template v-if="startGpsTime && drawCount >=0">
            {{domDateFormat.formatTime(startGpsTime+(sectionTime*drawCount), "yy-mm-dd hh:mm:ss:ms")}} 当前绘制的gpsTime
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
                sectionTime: 55,
                domDateFormat: DateFormat
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
            // this.getExtend(this.center[0],this.center[1],this.extend);
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
                        perceptionCars.processPerTrack(this.startGpsTime+(this.drawCount*this.sectionTime));
                    }
                }
                if(e && e.keyCode==38){ // 上
                    // console.log("向上");
                    if(this.drawCount>0) {
                        this.drawCount--;
                        if(Object.keys(perceptionCars.devObj).length>0){
                            perceptionCars.processPerTrack(this.drawCount, this.countTimeList);
                        }
                    }
                }
            },
            //感知车
            initPerceptionWebSocket(){
                let _this=this;
                try{
                    if ('WebSocket' in window) {
                        _this.perceptionWebsocket = new WebSocket(window.config.socketTestUrl);
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
                if(this.nowTimeCount < 10) {
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
<style scoped>
.map-real-time{
    position: absolute;
    width: 500px;
    font-size: 20px;
    z-index: 2;
    margin-top: 80px;
    left:50%;
    margin-left:-200px;
    text-align: left;

}
</style>