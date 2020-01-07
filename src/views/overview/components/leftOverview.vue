<template>
    <div class="left-overview">
        <div class="left-item-list clearfix">
            <i class="left-item-icon icon-1"></i>
            <div class="left-item-text">
                <span class="left-item-title">车辆：</span>
                <span class="left-item-num">{{$parent.onlineCount}}/{{filterData || '--'}}</span>
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
    import WebSocketObj from '@/assets/js/webSocket.js'
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
                timeOut:1000*60*5,
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
                        this.getGpsRealList();
                    }
                });
            },
            getGpsRealList() {
            // console.log('初始化页面，获取典型车辆列表实时信息');
                this.responseData=[];
                getGpsRealList({
                    vehicleId: this.vehicleIds
                }).then(res => {
                    let _responseData = res.data;
                    _responseData.forEach(item => {
                        this.initResult(item.vehicleId, item);
                    });
                    this.initWebSocket();
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
                _filterResult.timer = null;
                this.responseData.push(_filterResult);

                this.responseData.forEach((item, index) => {
                    this.resetData(item);
                });
            },
            resetData(obj) {
                obj.timer = setTimeout(() => {
                    obj.transmission = "P";
                    obj.turnLight = "";
                    obj.speed = 0;
                }, this.timeOut);
            },
            initWebSocket() {
                this.webSocket = new WebSocketObj(this, window.config.socketUrl, this.webSocketData, this.onmessage);
            },
            onmessage(message) {
                let _json = JSON.parse(message.data);
                let _result = _json.result[_json.result.length-1];
                let _vehicleId = _result.vehicleId;

                // console.log(_json)
               
                this.responseData.forEach((item, index) => {
                    if (item.vehicleId === _vehicleId) {
                        clearTimeout(item.timer);
                        item.transmission = _result.transmission;

                        if (_result.transmission != "P") {
                            item.headingAngle = _result.headingAngle;
                        }

                        this.resetData(item);
                    }
                });
            },
            showView(carId) {
                this.$router.push({
                    path: "/single/" + carId,
                    query:{delayTime: window.delayTime}
                });
            }
        },
        destroyed() {
            //销毁Socket
            this.webSocket&&this.webSocket.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
@import '@/assets/scss/overview.scss';
</style>