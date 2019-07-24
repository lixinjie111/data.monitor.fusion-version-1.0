<template>
    <div class="fusion-right-style">
        <div class="map-right">
            <p class="c-title">前向摄像头</p>
            <div class="fusion-video">
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1"></video-player>
            </div>
            <p class="c-title">车内摄像头</p>
            <div class="fusion-video">
                <video-player class="vjs-custom-skin" :options="option2" @error="playerError2"></video-player>
            </div>
        </div>
        <div></div>
        <div class="spat-detail clearfix">
            <div  v-for="(item,key) in lightData" class="spat-layout" :key="key">
                <div v-show="key=='key_3'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img" >
                        <img src="@/assets/images/single/light/turn-yellow.png" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/turn-red.png" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/turn-green.png" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_2'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img">
                        <img src="@/assets/images/single/light/left-yellow.png" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_1'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-straight">
                        <img src="@/assets/images/single/light/left-yellow.png" v-show="item.lightColor=='YELLOW'" />
                        <img src="@/assets/images/single/light/left-red.png" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
                <div v-show="key=='key_4'&&item.flag" class="spat-detail-style">
                    <div class="spat-detail-img spat-right">
                        <img src="@/assets/images/single/light/left-yellow.png" v-show="item.lightColor=='YELLOW'"/>
                        <img src="@/assets/images/single/light/left-red.png" v-show="item.lightColor=='RED'"/>
                        <img src="@/assets/images/single/light/left-green.png" v-show="item.lightColor=='GREEN'"/>
                    </div>
                    <span class="spat-detail-font" :class="[item.lightColor=='YELLOW' ? 'light-yellow' : item.lightColor=='RED'?'light-red':'light-green']">{{item.spareTime}}</span>
                </div>
            </div>
            <!--<div class="spat-detail-style">
              <div class="spat-detail-img">
                <img src="@/assets/images/car/left-red.png"/>
              </div>
              <span class="spat-detail-font">20</span>
            </div>
            <div class="spat-detail-style">
              <div class="spat-detail-img">
                <img src="@/assets/images/car/car-28.png"/>
              </div>

              <span class="spat-detail-font spat-detail-color">43</span>
            </div>
            <div class="spat-detail-style">
              <div class="spat-detail-img spat-right">
                <img src="@/assets/images/car/car-28.png"/>
              </div>
              <span class="spat-detail-font spat-detail-color">10</span>
            </div>-->
        </div>
        <div class="travel-detail">
            <div class="detail1">
                <span>{{realData.longitude? realData.longitude.toFixed(8):'--'}}</span>
                <span class="detail2">E</span>
            </div>
            <div class="detail1">
                <span>{{realData.latitude ?realData.latitude.toFixed(8):'--'}}</span>
                <span class="detail2">N</span>
            </div>
            <div class="detail1">
                <span>{{realData.speed?realData.speed.toFixed(1):'--'}}</span>
                <span class="detail2">km/h</span>
            </div>
            <div class="detail1">
                <span>航向角5°</span>
            </div>
            <div class="detail1">
                <span>{{nowYear}}</span>
                <span class="detail2">{{nowTime}}</span>
            </div>
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    export default {
        data() {
            return {
                option1:{
                    overNative: true,
                    autoplay: true,
                    controls: true,
                    fluid: true,
                    techOrder: ['flash', 'html5'],
                    sourceOrder: true,
                    flash: {
                        swf: isProduction ? '/fusionMonitor/static/media/video-js.swf' : '/static/media/video-js.swf'
                    },
                    sources: [
                        {
                            type: 'rtmp/mp4',
                            src: ''
                        }
                    ],
                    muted:true,
                    width:'100%',
                    height:'100%',
                    notSupportedMessage: '视频无法播放，请稍候再试!',
                    bigPlayButton : false,
                    /*errorDisplay : false,*/
                    controlBar: {
                        timeDivider: false,
                        durationDisplay: false,
                        remainingTimeDisplay: false,
                        currentTimeDisplay:false,
                        fullscreenToggle: true, //全屏按钮
                        captionsButton : false,
                        chaptersButton: false,
                        subtitlesButton:false,
                        liveDisplay:false,
                        playbackRateMenuButton:false
                    }
                },
                option2:{
                    overNative: true,
                    autoplay: true,
                    controls: true,
                    /*fluid: true,*/
                    techOrder: ['flash', 'html5'],
                    sourceOrder: true,
                    flash: {
                        swf: isProduction ? '/fusionMonitor/static/media/video-js.swf' : '/static/media/video-js.swf'
                    },
                    sources: [
                        {
                            type: 'rtmp/mp4',
                            src: ''
                        }
                    ],
                    muted:true,
                    width:'100%',
                    height:'100%',
                    notSupportedMessage: '视频无法播放，请稍候再试!',
                    bigPlayButton : false,
                    /* errorDisplay : false,*/
                    controlBar: {
                        timeDivider: false,
                        durationDisplay: false,
                        remainingTimeDisplay: false,
                        currentTimeDisplay:false,
                        fullscreenToggle: true, //全屏按钮
                        captionsButton : false,
                        chaptersButton: false,
                        subtitlesButton:false,
                        liveDisplay:false,
                        playbackRateMenuButton:false
                    }
                },
                lightData:{
                     'key_3':{spareTime:10,time:null,lightColor:'GREEN',flag:true},
                     'key_2':{spareTime:10,time:null,lightColor:'RED',flag:true},
                     'key_1':{spareTime:10,time:null,lightColor:'YELLOW',flag:true},
                     'key_4':{spareTime:10,time:null,lightColor:'RED',flag:true},
                    /*'key_3':{},
                    'key_2':{},
                    'key_1':{},
                    'key_4':{}*/
                },
                realData:{
                    'longitude':116.40741300,
                    'latitude':39.904214,
                    'speed':56.6
                },
                nowYear:'2019-09-03',
                nowTime:'06:53:00'
            }

        },
        methods: {
            //视频报错的方法
            playerError1(e) {
                console.log("playerError");
                if(this.option1.sources[0].src != '') {
                    let _videoUrl = this.option1.sources[0].src;
                    this.option1.sources[0].src = '';
                    setTimeout(() => {
                        this.option1.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
            playerError2(e) {
                console.log("playerError");
                if(this.option2.sources[0].src != '') {
                    let _videoUrl = this.option2.sources[0].src;
                    this.option2.sources[0].src = '';
                    setTimeout(() => {
                        this.option2.sources[0].src = _videoUrl;
                    }, 2000);
                }
            },
        },
        mounted() {

        }
    }
</script>
<style>
    .fusion-video .vjs-error .vjs-error-display:before{
        font-size: 3em;
        color: #ccc;
        top:60%;
        display: none;
    }
    .fusion-video .vjs-modal-dialog-content{
        padding-top:50px!important;
    }
</style>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .fusion-right-style{
        .map-right{
            .fusion-video{
                border:1px solid rgba(211, 134, 0, 0.5);
                margin: 20px 0px;
                height: 172px;
            }
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 270px;
            padding: 0px 30px;
            background-image: linear-gradient(90deg,
                    #000000 0%,
                    #000000 100%);
        }
        .spat-detail{
            position: absolute;
            top: 30px;
            /*left: 0;
            text-align: center;*/
            z-index: 1;
            left:-300px;
            margin-left:40%;
            .spat-layout{
                float: left;
                margin-left: 20px;
            }
            .spat-detail-style{
                width: 130px;
                height: 60px;
                border-radius: 30px;
                background-color: #313131;
                box-sizing: border-box;
                padding:6px 2px;
                /*float: left;
                margin-left: 20px;*/
                @include layoutMode(align);
                .spat-detail-img{
                    width: 48px;
                    height: 48px;
                    background-color: #454545;
                    border-radius: 50%;
                    display: inline-block;
                    position: relative;
                    img{
                        position: absolute;
                        top: 50%;
                        margin-top:-15px;
                        left: 50%;
                        margin-left: -14px;
                    }
                }
                .spat-detail-font{
                    letter-spacing: 4px;
                    color: #c8360f;
                    font-size: 36px;
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
        .travel-detail{
            position: absolute;
            left: -400px;
            margin-left:40%;
            bottom: 20px;
            font-size: 20px;
            letter-spacing: 0px;
           /* background: #24212c;*/
            z-index:1;
            .detail1{
                display: inline-block;
                padding:5px 10px;
                .detail2{
                    color: #37ba7b;
                    display: inline-block;
                    padding: 0px 2px;
                }
            }
        }
    }
</style>