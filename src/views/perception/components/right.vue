<template>
    <div class="fusion-right-style">
        <div class="map-right">
            <div class="base-info">
                <span>2019-09-23 08:00:00</span>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <span>15.6°</span>
            </div>
            <div class="perception-road" id="mapRoad"></div>
        </div>
        <div id="map" class="c-map">
            <div class="style" id="message">
                <video-player class="vjs-custom-skin" :options="option" @error="playerError1"></video-player>
            </div>
        </div>
    </div>
</template>
<script>
    const isProduction = process.env.NODE_ENV === 'production'
    import Animation from '@/assets/js/animation.js'
    export default {
        data() {
            return {
                mapOption:{
                    resizeEnable: true,
                    center: [121.17265957261286,31.284096076877844],
                    mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00",
                    expandZoomRange:true,
                    zoom:18
                },
                map:{},
                roadMap:{},
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
            }
        },
        methods: {
            getWms() {
                var wms  = new AMap.TileLayer.WMS({
                    url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
                    blend: false,
                    tileSize: 256,
                    params:{'LAYERS': 'shanghai_qcc:dl_shcsq_wgs84_zc_0708',VERSION:'1.1.0'}
                })
                wms.setMap(this.map);
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

        },
        mounted() {
            this.map = new AMap.Map('map',this.mapOption);
            this.roadMap = new AMap.Map('mapRoad', this.$parent.$parent.defaultMapOption);
            this.getWms();
            var pixel = new AMap.Pixel(800,440);
            var lnglat = this.map.containerToLngLat(pixel);
            var pixel1 = this.map.lnglatTocontainer([121.17265957261286,31.284096076877844]);
            console.log("经纬度："+lnglat)
            console.log("容器像素："+pixel1)
            let marker = new AMap.Marker({
                icon: "http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                position: [121.17265957261286,31.284096076877844],
            });
            marker.setMap(this.map);
           /* Animation.positionMessage('message');*/
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
        animation: move 3s linear;;

    }
    @keyframes move {
        0%{transform:translate(0,0);}
        100%{transform:translate(50px,100px);}
    }
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