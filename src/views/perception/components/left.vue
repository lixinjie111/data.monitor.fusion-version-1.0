<template>
    <div class="fusion-left-style">
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
                platformData:{},
                perceptionData:{},
                sideData:{},
                v2xData:{},
                isFirstCon:true,
                fusionData:{}

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
                type:Object,
                default() {
                    return {};
                }
            },
            warningCount:{
                type:Number,
                default:0
            },
            vehData:{
                type:Object,
                default() {
                    return {};
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
           vehData:{
               handler:function (val,oldVal) {
                   if(this.vehData.cbox){
                       this.platformData=this.vehData.cbox;
                   }
                   if(this.vehData.obu){
                       this.v2xData=this.vehData.obu;
                   }
               },
               deep:true
           },
           perceptionData:{
                handler: function (val, oldVal) {
                    let vehCount=0;
                    let noMotorCount=0;
                    let personCount=0;
                    if(this.vehData.cbox){
                        vehCount=vehCount+this.vehData.cbox.veh;
                    }
                    //v2x通讯
                    if(this.vehData.obu){
                        vehCount=vehCount+this.vehData.obu.veh;
                    }
                    //车辆感知
                    if(this.perceptionData.vehPer){
                        this.perceptionData=this.perceptionData.vehPer;
                        vehCount=vehCount+this.perceptionData.vehPer.veh;
                        noMotorCount=noMotorCount+this.perceptionData.vehPer.noMotor;
                        personCount=personCount+this.perceptionData.vehPer.person;
                    }
                    //路侧识别车
                    if(this.perceptionData.rcu){
                        this.sideData=this.perceptionData.rcu;
                        vehCount=vehCount+this.perceptionData.rcu.veh;
                        noMotorCount=noMotorCount+this.perceptionData.rcu.noMotor;
                        personCount=personCount+this.perceptionData.rcu.person;
                    }
                    this.fusionData.veh = vehCount;
                    this.fusionData.nonMotor = noMotorCount;
                    this.fusionData.person = personCount;
                },
                deep:true
            }
        },
        methods: {},
        mounted(){},
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