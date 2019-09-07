<template>
    <div class="fusion-left-style">
        <div class="fusion-header">
            <img src="@/assets/images/logo.png" class="header-img" @click="routeGo"/>
            融合感知平台
        </div>
        <div class="fusion-left-main left-style">
            <p class="c-title" style="margin-top: 0px;">融合结果</p>
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
                    <span class="fusion-font">路侧识别：车辆 {{sideData.veh || 0}}，行人 {{sideData.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{sideData.noMotor || 0}}</span>
                    <!--<span class="fusion-font">路侧识别：车辆 </span>-->
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>V2X通讯：车辆 {{v2xData.veh|| 0}}</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span class="fusion-font">车辆感知：车辆 {{perceptionData.veh || 0}}，行人 {{perceptionData.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{perceptionData.noMotor || 0}}</span>
                    <!--<span class="fusion-font">车辆感知：车辆 </span>-->
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
                webSocket:null,
                warningWebsocket:null,
                fusionData:{},
                platformData:{},
                perceptionData:{},
                sideData:{},
                v2xData:{},
                warningIdList:[],
                warningCount:0,
                isFirstCon:true,
                alertCount:0

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
            },
            perceptionData:{
                type:Array,
                default() {
                    return [];
                }
            }
        },
        watch:{
           /* currentExtent: {
                handler: function (val, oldVal) {
                    this.warningCount=0;
                    this.initWebSocket();
                    this.initWarningWebSocket();
                },
                immediate: true,
                deep:true
            }*/
            perceptionData(){
                if(this.perceptionData[0].stat){
                    this.fusionData = this.perceptionData[0].stat;
                }
                //"person":"行人"，"noMotor":"非机动车"，"veh":"车辆"
                if(this.perceptionData[0].cbox){
                    this.platformData=this.perceptionData[0].cbox;
                }
                if(this.perceptionData[0].vehPer){
                    this.perceptionData=this.perceptionData[0].vehPer;
                }
                if(this.perceptionData[0].rcu){
                    this.sideData=this.perceptionData[0].rcu;
                }
                if(this.perceptionData[0].obu){
                    this.v2xData=this.perceptionData[0].obu;
                }
            },
            currentExtent(newValue,oldValue){
//                console.log("大小："+this.currentExtent.length);
                this.warningCount=0;
                if(this.isFirstCon){
                  /*  this.initWebSocket();*/
                    this.initWarningWebSocket();
                    this.isFirstCon=false;
                }
            }
        },
        methods: {
            initWarningWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.warningWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                    _this.warningWebsocket.onmessage = _this.onWarningMessage;
                    _this.warningWebsocket.onclose = _this.onWarningClose;
                    _this.warningWebsocket.onopen = _this.onWarningOpen;
                }
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
                           /* console.log("warningId:"+warningId);
                            console.log("索引:"+_this.warningIdList.indexOf(warningId));*/
                            _this.warningIdList.push(warningId);
                            _this.warningCount++;
                            let msg = item.warnMsg+"   "+item.dis+"米";
                            let obj = {
                                id:'alert'+_this.alertCount,
                                msg:msg,
                                longitude:item.longitude,
                                latitude:item.latitude

                            }
                            this.$emit("getWarningSign",obj);
                            _this.alertCount++;
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
            },
            routeGo(){
                this.$router.push({
                    path: '/overview'
                });
            }
        },
        mounted() {

        },
        destroyed(){
            this.warningWebsocket&&this.warningWebsocket.close();
        }
    }
</script>
<style lang="scss" scoped>
   /* @import '@/assets/scss/theme.scss';*/
   .left-style{
       padding-top:0px!important;
       padding-bottom:0px!important;
   }
    .perception-style{
        padding: 20px 10px;
        line-height: 28px;
        font-size: 14px;
        margin:20px 0px;
        border: 1px solid rgba(211, 134, 0, 0.5);
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
</style>