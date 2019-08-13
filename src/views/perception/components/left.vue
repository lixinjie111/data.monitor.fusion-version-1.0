<template>
    <div class="fusion-left-style">
        <div class="fusion-header">
            <img src="@/assets/images/logo.png" class="header-img"/>
            感知融合平台
        </div>
        <div class="fusion-left-main">
            <p class="c-title">融合结果</p>
            <ul class="perception-style">
                <li>
                    <span class="overview-sign fusion-sign"></span>
                    <span>融合后感知车辆：{{fusionData.veh || 0}}</span>
                </li>
                <li>
                    <span class="overview-sign fusion-sign"></span>
                    <span>融合非机动车：{{fusionData.nonMotor || 0}}</span>
                </li>
                <li>
                    <span class="overview-sign fusion-sign"></span>
                    <span>融合后行人：{{fusionData.person || 0}}</span>
                </li>
            </ul>
            <p class="c-title">感知数据</p>
            <ul  class="perception-style">
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>平台直连：车辆 {{platformData.veh || 0}}</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span class="fusion-font">车辆感知：车辆 {{perceptionData.veh || 0}}，行人 {{perceptionData.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{perceptionData.noMotor || 0}}</span>
                    <!--<span class="fusion-font">车辆感知：车辆 </span>-->
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span class="fusion-font">路侧识别：车辆 {{sideData.veh || 0}}，行人 {{sideData.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{sideData.noMotor || 0}}</span>
                    <!--<span class="fusion-font">路侧识别：车辆 </span>-->
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>V2X通讯：车辆 {{v2xData.veh|| 0}}</span>
                </li>
            </ul>
            <p class="c-title">交通数据</p>
            <ul class="perception-style">
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>下发预警信息：{{warningCount|| 0}}</span>
                </li>
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>接入红绿灯：{{spatCount|| 0}}</span>
                </li>
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>接入交通标志牌：{{signCount|| 0}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                webSocket:{},
                warningWebsocket:{},
                fusionData:{},
                platformData:{},
                perceptionData:{},
                sideData:{},
                v2xData:{},
                warningIdList:[],
                warningCount:0

            }
        },
        props:{
            currentExtent:{
                type:Array,
                default() {
                    return [];
                }
            },
            spatCount:{
                type:Number,
                default:0
            },
            signCount:{
                type:Number,
                default:0
            }
        },
        watch:{
            currentExtent(newValue,oldValue){
//                console.log("大小："+this.currentExtent.length);
                this.warningCount=0;
                this.initWebSocket();
                this.initWarningWebSocket();
            }
        },
        methods: {
            initWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.webSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
                }
                _this.webSocket.onmessage = _this.onmessage;
                _this.webSocket.onclose = _this.onclose;
                _this.webSocket.onopen = _this.onopen;
                _this.webSocket.onerror = _this.onerror;
            },
            onmessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let result = json.result;
                if(result.stat){
                    _this.fusionData = result.stat;
                }
                //"person":"行人"，"noMotor":"非机动车"，"veh":"车辆"
                if(result.cbox){
                    _this.platformData=result.cbox;
                }
                if(result.vehPer){
                    _this.perceptionData=result.vehPer;
                }
                if(result.rcu){
                    _this.sideData=result.rcu;
                }
                if(result.obu){
                    _this.v2xData=result.obu;
                }
            },
            onclose(data){
                console.log("结束连接");
            },
            onopen(data){
                //获取车辆状态
                var fusionStatus = {
                    "action":"road_real_data_stat",
                    "region": this.currentExtent
                }
                var fusionStatusMsg = JSON.stringify(fusionStatus);
                this.sendMsg(fusionStatusMsg);
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
            initWarningWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.warningWebsocket = new WebSocket(window.cfg.socketUrl);  //获得WebSocket对象
                }
                _this.warningWebsocket.onmessage = _this.onWarningMessage;
                _this.warningWebsocket.onclose = _this.onWarningClose;
                _this.warningWebsocket.onopen = _this.onWarningOpen;
            },
            onWarningMessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let warningData = json.result.data;
                let type = json.result.type;
                let warningId;
                if(type=='CLOUD'){
                    warningData.forEach(item=>{
                        warningId = item.warnId;
                        warningId = warningId.substring(0,warningId.lastIndexOf("_"));
                        if(_this.warningIdList.indexOf(warningId)==-1){
                            console.log("warningId:"+warningId);
                            console.log("索引:"+_this.warningIdList.indexOf(warningId));
                            _this.warningIdList.push(warningId);
                            _this.warningCount++;
                        }
                    })
                }
            },
            onWarningClose(data){
                console.log("结束连接");
            },
            onWarningOpen(data){
                //旁车
                var warning = {
                    "action": "clod_event",
                    "region": this.currentExtent
                }
                var warningMsg = JSON.stringify(warning);
                this.sendWarningMsg(warningMsg);
            },
            sendWarningMsg(msg) {
                let _this=this;
                if(window.WebSocket){
                    if(_this.warningWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        _this.warningWebsocket.send(msg); //send()发送消息
                        console.log("warning已发送消息:"+ msg);
                    }
                }else{
                    return;
                }
            }
        },
        mounted() {

        },
        destroyed(){
            this.webSocket.close();
            this.warningWebsocket.close();
        }
    }
</script>
<style lang="scss" scoped>
   /* @import '@/assets/scss/theme.scss';*/
    .perception-style{
        padding: 20px 0px;
        line-height: 28px;
        font-size: 14px;
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
</style>