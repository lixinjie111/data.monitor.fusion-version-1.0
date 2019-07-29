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
                        @MapInitComplete='map1InitComplete'>
                </tusvn-map>
            </div>
        </div>
        <div id="map" class="c-map">
            <div class="style" id="message" :style="{left:left+'px',top:top+'px'}">
                <video-player class="vjs-custom-skin" :options="option" @error="playerError1"></video-player>
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
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import TusvnMap from './TusvnMap.vue';
    export default {
        data() {
            return {
                option:{
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
                },
                movement:0,
                left:'800',
                top:'260',
                timer:0,
                zoom:19

            }
        },
        components: { TusvnMap },
        methods: {
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
            animation(left,top){
                if(this.timer!=0){
                    clearTimeout(this.timer);
                }
                let element = document.getElementById('message');
                let ele = document.getElementById('fusionRight');
                let topPosition = ele.clientHeight-160;//整个高度减去弹出框的高度
                let leftPosition = 0;//向左的偏移
                if(top<topPosition){ top++;}          //如果xpos小于终点的left,给它加1.
                if(left >leftPosition){ left--;}       //如果ypos小于终点的left,给它加1.
                /*setTimeout(()=>{
                    this.left=0;
                    this.top=height;
                },10)*/
                if(top==topPosition&&left==leftPosition){
                    clearTimeout(this.timer);
                    return;
                }
                this.timer = setTimeout(()=>{
                    this.left=left;
                    this.top=top;
                    this.animation(left,top)
                },10)
            },
            mapInitComplete(tusvnmap){
                this.$refs.map.centerAt(121.17265957261286,31.284096076877844);
                this.$refs.map.zoomTo(this.zoom);
                this.$refs.map.addImgOverlay('img1', 'http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png', 0, 121.17265957261286, 31.284096076877844, "{'data':'5'}", [0,0], this.imgClick);
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
            },
            levelChange(){

            }
        },
        mounted() {
//            this.animation(800,260);
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
</style>