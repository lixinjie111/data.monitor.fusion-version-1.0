<template>
    <div class="fusion-left-main">
        <div class="single-info">
            <div class="single-info-header">
                <span class="info-font">L{{singleVehicle.autoLevel}}</span>
                <span class="vehicle-number">{{singleVehicle.platNo}}</span>
                <div class="real-content">
                    <!--左-->
                    <img src="@/assets/images/single/left.png"  class="turn-img" v-if="canData.turnLight=='left'">
                    <img src="@/assets/images/single/right.png" class="turn-img director-left " v-else>
                    <!--向右转 亮-->
                    <img src="@/assets/images/single/left.png" class="director-right" v-if="canData.turnLight=='right'">
                    <img src="@/assets/images/single/right.png" v-else >
                </div>
            </div>
            <div class="info-img">
                <img :src="singleVehicle.vehicleLogo"/>
            </div>
            <div class="pedal-style">
                <div class="real-img-base oil-base">
                    <span class="real-img-style oil-style" :style="{left:oilLeftWidth+ 'px'}"></span>
                </div>
                <div class="real-img-base brake-base">
                    <span class="real-img-style brake-style" :style="{left:brakeLeftWidth+ 'px'}"></span>
                </div>
            </div>
        </div>
        <div class="fusion-left-map">
            <div class="map-style" id="singleMap"></div>
        </div>
    </div>
</template>
<script>
    import { getVehicleBaseData } from '@/api/single'
    import ConvertCoord from '@/utils/coordConvert.js'
    export default {
        data() {
            return {
                mapOption:{},
                singleVehicle:{},
                distanceMap: {}, //创建的地图对象
                prevLastPoint:[],//上次请求的终点，
                carStartPoint:this.$parent.$parent.defaultCenterPoint,
                markers: {
                    markerStart: null,
                    polyline: [],
                    markerEnd: null
                },
                webSocket:null,
                scale: 10,
                webSocketData: {
                    'action':'route',
                    'vehicleId': '',
                    'scale': 0,
                    'all': 1
                },
                vehicleId:this.$route.params.vehicleId,
                flag: true,
                count:0,
                routeConnectCount:0,
                isExist:false
            }
        },
        computed:{
            oilLeftWidth(){
                let oilData = parseFloat(this.canData.oilDoor/100);
                if(!oilData){
                   return 0;
                }
                return parseInt(oilData*80);
            },
            brakeLeftWidth(){
                let brakeData = parseFloat(this.canData.brakePedal/100);
                if(!brakeData){
                    return 0;
                }
                return parseInt(brakeData*80);
            },
        },
        props:{
            routeData:{
                type:Object,
                default() {
                    return {

                    };
                }
            },
            canData:{
                type:Object,
                default() {
                    return {
                        oilDoor:0,
                        brakePedal:0,
                        turnLight:'',
                    };
                }
            },
            pulseStart:{
                type:Boolean,
                default:false
            }
        },
        watch:{
            routeData:{
                handler(newValue, oldValue) {
                    this.onmessage(this.routeData);
                },
//                immediate: true,
                deep: true
            }
        },
        methods: {
            getBaseData(){
                console.log("id:"+this.$route.params.id);
                let _this = this;
                getVehicleBaseData({
                    'vehicleId': this.vehicleId,
                }).then(res => {
                    this.singleVehicle = res.vehicleBaseDetail[0];
                });
            },
            onmessage(data){
                let _this=this;
                let p = ConvertCoord.wgs84togcj02(data.longitude, data.latitude);
                console.log("------------------")
                let point = new AMap.LngLat(p[0], p[1]);
                let pointPath = [];
                //如果被隐藏
                //绘制第一个点
                if(!_this.markers.markerStart){
                    _this.markers.markerStart = new AMap.Marker({
                        position:point,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        icon:'static/images/single/start.png',
                        offset: new AMap.Pixel(-10, -10)
                    });
                    //记录上一个点
                    // 将创建的点标记添加到已有的地图实例：
                    _this.distanceMap.add(_this.markers.markerStart);
                }else{
                    console.log("****************")
                    //当隐藏有点则将历史点进行绘制
                    pointPath.push(_this.prevLastPoint);
                    //绘制线
                    pointPath.push(point);
                    let polyline = new AMap.Polyline({
                            map: _this.distanceMap,
                            path: pointPath,
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
                    _this.markers.polyline.push(polyline);
                    //绘制终点
                    _this.distanceMapEnd(point,data.heading);
                    // 缩放地图到合适的视野级别
                    _this.distanceMap.setFitView();
                    //获取缩放级别
                }
                _this.prevLastPoint=point;
            },
            //行程概览--绘制起点
            distanceMapStart(startPoint){
                let _this = this;
                if(!this.markers.markerStart) {
                    this.markers.markerStart = new AMap.Marker({
                        position: _this.carStartPoint,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                        icon:'static/images/single/start.png',
                        offset: new AMap.Pixel(-10, -10)
                    });
                    // 将创建的点标记添加到已有的地图实例：
                    this.distanceMap.add(_this.markers.markerStart);
                }else{
                    this.markers.markerStart.setPosition(_this.carStartPoint);
                }
                this.distanceMap.setFitView(_this.markers.markerStart);
            },
            //行程概览--绘制终点
            distanceMapEnd(point,heading){
                let _this = this;
                if(!this.markers.markerEnd) {
                    this.markers.markerEnd = new AMap.Marker({
                        position:point,
                        icon:'static/images/single/end.png',
                        offset: new AMap.Pixel(-20, -10),
                        autoRotation: true,
                        // angle: _this.direction-90
                        angle: heading-90
                    });
                    // 将创建的点标记添加到已有的地图实例：
                    this.distanceMap.add(_this.markers.markerEnd);
                }else{
                    this.markers.markerEnd.setPosition(point);
                    this.markers.markerEnd.setAngle(heading-90);
                }
            }
        },
        mounted() {
            this.mapOption=window.defaultMapOption;
            this.distanceMap = new AMap.Map('singleMap', this.mapOption);
            //避免加载空白地图
            this.distanceMap.on('complete',()=>{
                this.distanceMap.setMapStyle(window.defaultMapOption.mapStyle);
            });
            this.getBaseData();
        },
        destroyed(){
            //销毁Socket
            this.webSocket&&this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .single-info{
        border:1px solid rgba(211,134,0,0.5);
        text-align: center;
        height: 180px;
        position: relative;
        margin-bottom: 40px;
        background: #00000082;
        .pedal-style{
            display: inline-block;
            position: absolute;
            bottom: 10px;
            left: 30px;
            width: 270px;
            .oil-base{
                border-top:2px solid #23b318;
                .oil-style{
                    border-left:4px solid #23b318;
                }
            }
            .brake-base{
                border-top:2px solid #c73610;
                margin-left: 120px;
                .brake-style{
                    border-left:4px solid #c73610;
                }
            }
            .real-img-base{
                /*display: inline-block;*/
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
        }
        .single-info-header{
           /* @include layoutMode(between);*/
            padding:0px 10px ;
            font-size: 16px;
            line-height: 40px;
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
                float: right;
                img{
                    height: 18px;
                    display: inline-block;
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
                height:110px;
                display: inline-block;
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
        height:180px;
        border:1px solid rgba(211,134,0,0.5);
        .map-style{
            height: 100%;
        }
    }
</style>