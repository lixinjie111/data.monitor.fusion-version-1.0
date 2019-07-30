<template>
    <div class="fusion-right-style" id="fusionRight">
        <div class="map-right">
            <div class="base-info">
                <span>2019-09-23 08:00:00</span>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <span>15.6°</span>
            </div>
            <div class="perception-road" id="mapRoad">
                <tusvn-map
                        ref="map1"
                        targetId="map1"
                        overlayContainerId="overlay1"
                        :isMasker='false'
                        :isCircle='false'

                        @ViewLevelChange="levelChange"
                        @MapInitComplete='map1InitComplete'
                        @MapRenderComplete='mapRenderComplete'>
                </tusvn-map>
            </div>
        </div>
        <div class="map-left"></div>
        <div id="map" class="c-map">
            <div class="style" id="message1" :style="{left:left1+'px',top:top1+'px'}">
                <video-player class="vjs-custom-skin" :options="option1" @error="playerError1"></video-player>
            </div>
            <div class="style" id="message2" :style="{left:left2+'px',top:top2+'px'}">
                <video-player class="vjs-custom-skin" :options="option2" @error="playerError2"></video-player>
            </div>
            <tusvn-map
                    ref="map"
                    targetId="ddd"
                    overlayContainerId="ccc"
                    :isMasker='false'
                    :isCircle='false'

                    @ViewLevelChange="viewLevelChange"
                    @MapInitComplete='mapInitComplete'
                    @ExtentChange="dragEnd"
                    >

            </tusvn-map>
        </div>
        <div class="spat-detail clearfix">
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
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap from './TusvnMap.vue';
    export default {
        data() {
            return {
                option1:{},
                option2:{},
                movement:0,
                left1:'800',
                top1:'260',
                isEnd1:false,
                isEnd2:false,
                left2:'700',
                top2:'560',
                timer1:0,
                timer2:0,
                zoom:19,
                topPosition:0,
                lastPosition:0,
                lightData:{
                    'key_3':{spareTime:10,time:null,lightColor:'GREEN',flag:true},
                    'key_2':{spareTime:10,time:null,lightColor:'RED',flag:true},//左转
                    'key_1':{spareTime:10,time:null,lightColor:'YELLOW',flag:true},//直行
                    'key_4':{spareTime:10,time:null,lightColor:'RED',flag:true},//右转
                },

            }
        },
        components: { TusvnMap },
        methods: {
            getOption(){
               let option = {
                    overNative: true,
                    autoplay: false,
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
                }
                return option;
            },
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
            animation(left,top,leftPosition,flag,timer,leftFlag){
                if(timer!=0){
                    clearTimeout(timer);
                }
                if(top<this.topPosition){ top=top+2;}          //如果xpos小于终点的left,给它加1.
                if(leftFlag==0){
                    if(left>leftPosition){
                        left = left-3;
                        if(top>=this.topPosition&&left<=leftPosition){
                            clearTimeout(timer);
                            return;
                        }
                    }else{
                        left = left;
                        if(top>=this.topPosition&&left<=leftPosition){
                            clearTimeout(timer);
                            return;
                        }
                    }
                }
                if(leftFlag==1){
                    left = left+3;
                    if(top>=this.topPosition&&left>=leftPosition){
                        clearTimeout(timer);
                        return;
                    }
                }
                //如果ypos小于终点的left,给它加1.
                /*if(left <leftPosition){ left = left+3;}  */     //如果ypos小于终点的left,给它加1.

                timer = setTimeout(()=>{
                    if(flag==1){
                        this.left1=left;
                        this.top1=top;
                        this.animation(left,top,leftPosition,flag,timer,leftFlag)
                    }
                    if(flag==2){
                        this.left2=left;
                        this.top2=top;
                        this.animation(left,top,leftPosition,flag,timer,leftFlag)
                    }
                },10)
            },
            mapInitComplete:function(tusvnmap){
                this.$refs.map.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map.zoomTo(this.zoom);
                this.$refs.map.addImgOverlay('img1', 'http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png', 0, 121.17265957261286, 31.284096076877844, "{'data':'5'}", [0,0], this.imgClick);
                this.$refs.map.addImgOverlay('img2', 'http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png', 0, 121.17244854150163, 31.283475072766722, "{'data':'5'}", [0,0], this.imgClick);
                this.$refs.map.addWms("shanghai_qcc:dl_shcsq_wgs84_zc_0708","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:dl_shcsq_wgs84_zc_0708","",1,true,null); // 上海汽车城
            //    setTimeout(()=>{

                    // },2000);
            },
            mapRenderComplete:function(map){
                var coord = map.getCoordinateFromPixel([24,35]);
                    console.log(coord);
                    var pixel = map.getPixelFromCoordinate([(121.17188977862558+121.17342936660013)/2,(31.28308488407923+31.28510726967646)/2]);
                    console.log(pixel);
            },



            viewLevelChange(tusvnmap,mevent){
                // console.log("============================viewLevelChange=============================");
                // console.log(tusvnmap);
                // console.log(mevent);
            },
            dragEnd(map,currentExtend){
                //拖拽完成后获取边界范围，同时设置地图的中心点
                console.log("当前的边界范围："+currentExtend);
            },
            imgClick(data){
                debugger

            },
            map1InitComplete(){
                this.$refs.map1.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map1.zoomTo(10);
                this.$refs.map1.addWms("shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:dl_shcsq_wgs84_rc_withoutz","gd_road_centerline",1,true,null); // 上海汽车城

            },
            levelChange(){

            }
        },
        mounted(){
            let _this = this;
            let ele = document.getElementById('fusionRight');
            this.topPosition = ele.clientHeight-160;//整个高度减去弹出框的高度
            this.lastPosition = this.topPosition;
            console.log("改变前topPosition:"+this.topPosition);
            this.animation(800,260,0,1,this.timer1,0);//left>leftPosition
            this.animation(700,560,300,2,this.timer2,0); //left>leftPosition
            this.option1 = this.getOption();
            this.option2 = this.getOption();
            window.onresize = function(){ // 定义窗口大小变更通知事件
                _this.topPosition = ele.clientHeight-160;
                //全屏
                if(_this.topPosition>_this.lastPosition){
                    _this.animation(_this.left1,_this.top1,0,1,_this.timer1,0);//left>leftPosition
                    _this.animation(_this.left2,_this.top2,300,2,_this.timer2,0); //left>leftPosition
                }else{
//                    debugger
                    _this.left1 = 0;
                    _this.left2 = 300;
                    _this.top1 = _this.topPosition;
                    _this.top2 = _this.topPosition;
                }

                _this.lastPosition = _this.topPosition;
            };
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
        bottom: 30px;
        background: #000;
    }
    .base-info{
        padding:30px 0px ;
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
        top: 30px;
        /*left: 0;
        text-align: center;*/
        z-index: 1;
        left:-300px;
        margin-left:40%;
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