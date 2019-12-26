<template>
    <div class="fusion-left-style">
        <div class="fusion-left-main left-style">
            <p class="c-title">感知数据</p>
            <ul  class="perception-style">
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>平台直连：车辆 {{vehData.platVeh || 0}}</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span class="fusion-font">路侧识别：车辆 {{perceptionData.veh || 0}}，行人 {{perceptionData.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{perceptionData.noMotor || 0}}</span>
                    <!--<span class="fusion-font">路侧识别：车辆 </span>-->
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>V2X通讯：车辆 {{vehData.v2xVeh|| 0}}</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span class="fusion-font">车辆感知：车辆 {{vehPer.veh || 0}}，行人 {{vehPer.person || 0}}，<br/>&nbsp;&nbsp;&nbsp;&nbsp;非机动车 {{vehPer.noMotor || 0}}</span>
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
    import {typeRoadData} from '@/api/fusion'
    export default {
        data() {
            return {
                spatCount:0,
                signCount:0,
                vehPer: {
                    veh: 0,
                    person: 0,
                    noMotor: 0
                }
            }
        },
        props:{
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
        methods: {
            typeRoadData(){
                let extend = parseFloat(this.$route.params.extend);
                let longitude=parseFloat(this.$route.query.lng);
                let latitude=parseFloat(this.$route.query.lat);
                let currentExtent = this.getExtend(longitude,latitude,extend);
                typeRoadData(
                    {
                        "polygon":currentExtent,
                        "type": 'signs,spats'
                    }
                ).then(res=>{
                    if(res.data){
                        let signs = res.data.signs || [];
                        let spats = res.data.spats || [];
                        let signCount=0;
                        let spatCount=0;
                        if(signs&&signs.length>0){
                            signs.forEach(item=>{
                                signCount++;
                            })
                        }
                        if(spats&&spats.length>0) {
                            this.spatCount = spats.length;
                        }
                        this.signCount = signCount;
                    }
                })
            },
            getExtend(x,y,r){
                let currentExtent=[];
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                currentExtent.push([x1, y0]);
                currentExtent.push([x0, y0]);
                currentExtent.push([x0, y1]);
                currentExtent.push([x1, y1]);
                return currentExtent;
            }
        },
        mounted(){
            this.typeRoadData();
        }
    }
</script>
<style lang="scss" scoped>
     @import '@/assets/scss/theme.scss';
    .left-style{
        padding-top:0px!important;
        padding-bottom:0px!important;
    }
    .perception-style{
        padding: 20px 10px;
        line-height: 28px;
        font-size: 14px;
        margin:20px 0px;
        border: 1px solid rgba(211, 134, 0, 0.4);
        /*@borderLine();*/
        background: $backgroundRgba;
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