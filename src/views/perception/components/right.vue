<template>
    <div class="fusion-right-style" id="fusionRight">
        <div class="map-right">
            <div class="base-info">
                <span>2019-09-23 08:00:00</span>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <span>15.6°</span>
            </div>
            <div class="perception-road" id="mapRoad">

            </div>
        </div>
        <div class="map-left"></div>
        <div id="map" class="c-map">

            <tusvn-map :target-id="'mapFusion'"  ref="map"
                       background="black" minX=325295.155400   minY=3461941.703700  minZ=50
            maxX=326681.125700  maxY=3462723.022400  maxZ=80
            @mapcomplete="onMapComplete">

            </tusvn-map>
        </div>
        <!--<div class="spat-detail clearfix" v-for="item in lightList" :style="{left:item.left+'px',top:item.top+'px'}">
            <div  v-for="(item,key) in lightData" class="spat-layout" :key="key">
                <div v-show="key=='key_2'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img">
                        <img src="@/assets/images/single/light/left-yellow.png" class="left-img" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png" class="left-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="left-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_1'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-straight">
                        <img src="@/assets/images/single/light/left-yellow.png" class="straight-img" v-show="item.lightColor=='YELLOW'" />
                        <img src="@/assets/images/single/light/left-red.png" class="straight-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="straight-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_4'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-right">
                        <img src="@/assets/images/single/light/left-yellow.png" class="right-img" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png"  class="right-img" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" class="right-img" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
            </div>
        </div>-->
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import {getMap} from '@/utils/tusvnMap.js';
    import TusvnMap from '@/components/Tusvn3DMap2'
    import {getPerceptionAreaInfo,getVideoByNum,typeRoadData} from '@/api/fusion'
    export default {
        data() {
            return {
                option1:{},
                rtmp1:'',
                option2:{},
                lightData:{
                    /*'key_3':{spareTime:10,time:null,lightColor:'GREEN',flag:true},
                    'key_2':{spareTime:10,time:null,lightColor:'RED',flag:true},//左转
                    'key_1':{spareTime:10,time:null,lightColor:'YELLOW',flag:true},//直行
                    'key_4':{spareTime:10,time:null,lightColor:'RED',flag:true},//右转*/
                }
            }
        },
        components: { TusvnMap },
        methods: {
            onMapComplete(){
                getMap(this.$refs.map);
                this.$refs.map.updateCameraPosition(326297.1669125299,3462321.135051115,30.651420831899046,30.905553118989463,-0.5303922863908559,-2.6312825799826953);
        }
    },
    mounted() {
    }
}
</script>
<style>
    .style .vjs-error .vjs-error-display:before{
        font-size: 3em;
        color: #ccc;
        top:60%;
        display: none;
    }
    .style .vjs-modal-dialog-content{
        padding-top:50px!important;
    }
    .style .vjs-custom-skin > .video-js .vjs-big-play-button{
        font-size: 0.5em!important;
    }
</style>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .perception-road{
        height: 180px;
        width: 270px;
        border:1px solid rgba(211, 134, 0, 0.5);
        position: absolute;
        bottom: 10px;
        background: #000;
    }
    .base-info{
        padding:10px 0px ;
        text-align: center;
        .weather-icon{
            vertical-align: middle;
            padding-left: 10px;
        }
    }
    .style{
        width: 260px;
        height: 160px;
        border:4px solid #666666;
        position: absolute;
        left: 800px;
        /*top: calc(440px-160px-20px);*/
        top:260px;
        z-index:1;
        padding-top: 5px;
        box-sizing: border-box;
        /*animation: move 3s linear;;*/

    }
   /* @keyframes move {
        0%{transform:translate(0,0);}
        100%{transform:translate(50px,100px);}
    }*/
    .style:before{
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-top:20px solid #666666;
        border-right:16px solid transparent;
        bottom: -20px;
        left:16px;

    }
    .spat-detail{
        position: absolute;
        z-index: 1;
        .spat-layout{
            float: left;
            margin-left: 8px;
        }
        .spat-detail-style{
            width: 86px;
            height: 40px;
            border-radius: 20px;
            background-color:rgba(0,0,0,0.5);
            box-sizing: border-box;
            padding:6px 2px;
            /*float: left;
            margin-left: 20px;*/
            @include layoutMode(align);

            .spat-detail-img{
                width: 32px;
                height: 32px;
                background-color: rgba(0,0,0,0.8);
                border-radius: 50%;
                display: inline-block;
                position: relative;
                img{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                }
                .left-img{
                    width: 20px;
                    height: 18px;
                    margin-left: -10px;
                    margin-top: -9px;
                }
                .straight-img{
                    width: 20px;
                    height: 16px;
                    margin-left: -10px;
                    margin-top: -8px;
                }
                .right-img{
                    width: 20px;
                    height: 18px;
                    margin-left: -10px;
                    margin-top: -9px;
                }
            }
            .spat-detail-font{
                letter-spacing: 4px;
                color: #c8360f;
                font-size: 24px;
                display: inline-block;
                margin-left: 12px;
            }
            .spat-detail-color{
                color: #23b318;
            }
            .spat-straight{
                transform: rotate(90deg);
            }
            .spat-right{
                transform: rotate(180deg);
            }
            .light-yellow{
                color: #d99f04;
            }
            .light-red{
                color: #c93710;
            }
            .light-green{
                color: #28b51d;
            }
        }
    }
</style>