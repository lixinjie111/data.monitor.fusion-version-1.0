<template>
    <div class="left-overview">
        <div class="left-item-list clearfix">
            <i class="left-item-icon icon-1"></i>
            <div class="left-item-text">
                <p class="left-item-title">车辆总数</p>
                <p class="left-item-num">{{filterData || '--'}}</p>
            </div>
        </div>
        <ul class="left-item-wrapper">
            <li
            class="car-info-li"
            v-for="(item, index) in responseData"
            :key="item.vehicleId"
            @click="showView(item.vehicleId)"
            >
                <div class="car-index">{{index + 1}}</div>
                <div class="car-detail">
                    <img :src="item.vehicleLogo" class="car-img" />
                </div>
                <div class="car-detail-info">
                    <p class="car-plate">{{item.plateNo}}</p>
                    <div class="driving-info">
                        <span class="driving-level">L{{item.autoLevel}}</span>
                        <span class="driving-trans">{{item.transmission}}</span>
                        <span class="direction" :style="{transform:'rotate('+ item.headingAngle +'deg)'}"></span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    import { getGpsRealConfig, getGpsRealList } from "@/api/overview/index.js";
    export default {
        props:['filterData'],
        data() {
            return {
                vehicleIds: "",
                responseData: [],
                // 获取指定车辆实时信息
                webSocket: null,
                webSocketData: {
                    action: "can_real_data",
                    token: "fpx",
                    vehicleIds: ""
                },
                canConnectCount:0
            };
        },
        mounted() {
            this.getGpsRealConfig();
        },
        methods: {
            // 获取典型车辆
            getGpsRealConfig() {
                getGpsRealConfig().then(res => {
                    this.vehicleIds = res.data;
                    this.webSocketData.vehicleIds = res.data;
                    if(this.vehicleIds) {
                        this.initWebSocket();
                    }
                });
            },
            getGpsRealList() {
            // console.log('初始化页面，获取典型车辆列表实时信息');
                getGpsRealList({
                    vehicleId: this.vehicleIds
                }).then(res => {
                    let _responseData = res.data;
                    _responseData.forEach(item => {
                        this.initResult(item.vehicleId, item);
                    });
                });
            },
            initResult(attr, result) {
                let _filterResult = {};
                _filterResult.vehicleId = result.vehicleId;
                _filterResult.transmission = result.transmission;
                if (result.transmission != "P") {
                    _filterResult.speed = result.speed;
                } else {
                    _filterResult.speed = 0;
                }
                _filterResult.headingAngle = result.headingAngle;
                _filterResult.turnLight = result.turnLight;
                _filterResult.autoLevel = result.autoLevel;
                _filterResult.vehicleLogo = result.vehicleLogo;
                _filterResult.plateNo = result.plateNo;
                this.responseData.push(_filterResult);
            },
            initWebSocket() {
            // console.log('websocket获取指定车辆实时信息');
                try{
                    if ("WebSocket" in window) {
                        this.webSocket = new WebSocket(window.config.socketUrl); //获得WebSocket对象
                        this.webSocket.onmessage = this.onmessage;
                        this.webSocket.onclose = this.onclose;
                        this.webSocket.onopen = this.onopen;
                        this.webSocket.onerror = this.onerror;
                    }else{
                        this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.canReconnect();
                }

            },
            onmessage(message) {
                let _json = JSON.parse(message.data);
                let _result = _json.result[_json.result.length-1];
                let _vehicleId = _result.vehicleId;
                this.responseData.forEach((item, index) => {
                    if (item.vehicleId === _vehicleId) {
                        item.transmission = _result.transmission;
                        if (_result.transmission != "P") {
                            item.speed = _result.speed;
                            item.headingAngle = _result.headingAngle;
                            item.turnLight = _result.turnLight;
                        } else {
                            item.speed = 0;
                        }
                    }
                });
            },
            onclose(data) {
                console.log("can数据结束连接");
                this.canReconnect();
            },
            onerror(){
                console.log("can数据连接error");
                this.canReconnect();
            },
            onopen(data) {
                // console.log("建立--vehicleList--连接");
                //行程
                this.sendMsg(JSON.stringify(this.webSocketData));
            },
            sendMsg(msg) {
                // console.log("vehicleList--连接状态："+this.webSocket.readyState);
                if (window.WebSocket) {
                    if (this.webSocket.readyState == WebSocket.OPEN) {
                        //如果WebSocket是打开状态
                        this.webSocket.send(msg); //send()发送消息
                        // console.log("vehicleList--已发送消息:"+ msg);
                        this.getGpsRealList();
                    }
                } else {
                    return;
                }
            },
            canReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.canConnectCount>=10){
                    return;
                }
                this.initWebSocket();
                //重连不能超过5次
                this.canConnectCount++;
            },
            showView(carId) {
                this.$router.push({
                    path: "/single/" + carId,
                    query:{delayTime:4}
                });
            }
        },
        destroyed() {
            //销毁Socket
            this.webSocket&&this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
@import '@/assets/scss/overview.scss';
</style>