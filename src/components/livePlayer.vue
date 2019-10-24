<template> 
    <div :class="[isBig?'c-video-16-9':'c-video-4-3']">
        <div class="c-video">
            <div class="c-video-title">
                <!-- <span class="title">路侧点：16:9</span> -->
                <slot></slot>
                <i class="el-icon-refresh" v-if="refreshFlag" @click="refreshVideo"></i>
            </div>
            <div class="c-video-mask" v-if="videoOption.videoMaskFlag">
                <i class="el-icon-video-play" v-if="videoOption.playFlag" @click="requestVideo"></i>
                <i class="el-icon-loading" v-if="videoOption.loadingFlag"></i>
                <span class="c-video-tip" v-if="videoOption.playError">{{videoOption.videoText}}</span>
                <i class="el-icon-refresh" v-if="videoOption.playError" @click="refreshVideo"></i>
            </div>
            <live-player 
                class="c-live-player" 
                ref="livePlayer" 
                :videoUrl="videoUrl" 
                autoplay
                :muted="true"
                :fluent="true" 
                :live="true"
                @message="onPlayerMessage"
                @error="onPlayerError"
                @ended="onPlayerEnded"
                @timeupdate="onPlayerTimeupdate"
                @pause="onPlayerPause"
                @play="onPlayerPlay"
                >
            </live-player>
        </div>
    </div>
</template>

<script>
// 视频插件
import LivePlayer from '@liveqing/liveplayer'
export default {
    name: 'LivePlayerLive',
    props: {
        requestVideoUrl: [Function, String],  //请求视频axios封装方法/视频地址
        params: Object, //请求视频参数
        type: String,   //视频字段名
        refreshFlag: {     //是否显示标题栏的刷新按钮
            default: false,
            type: Boolean
        },
        autoplay: {     //是否自动加载视频，true-自动加载视频，false-手动加载视频
            default: false,
            type: Boolean
        },
        isBig: {
            default: true,
            type: Boolean
        }
    },
    components: {
        LivePlayer
    },
    data () {
        return {
            videoUrl: "",
            videoOption: {
                videoMaskFlag: true,
                playFlag: true,
                loadingFlag: false,
                playError: false,
                videoText: "暂无视频数据"
            },
            videoLoadingDelay: {
                timer: null,
                countTime:15,
                count: 0
            }
        }
    },
    computed: {
        player() {
            return this.$refs.livePlayer.player
        }
    },
    watch: {
        deep: true,
        'videoOption.loadingFlag'(newVal, oldVal) {
            this.initVideoTimer();
            if(newVal) {
                this.videoTimer();
            }
        },
        'videoLoadingDelay.count'(newVal, oldVal) {
            console.log(newVal);
        }
    },
    mounted() {
        if(this.autoplay) {
            this.requestVideo();
        }
    },
    methods: {
        initVideoTimer() {
            clearInterval(this.videoLoadingDelay.timer);
            this.videoLoadingDelay.count = 0;
        },
        videoTimer() {
            this.videoLoadingDelay.timer = setInterval(() => {
                if(this.videoLoadingDelay.count >= this.videoLoadingDelay.countTime) {
                    this.setVideoOptionError("此视频暂无法播放，请稍后再试");
                    this.videoUrl = "";
                }else {
                    this.videoLoadingDelay.count ++;
                }
            }, 1000);
        },
        setVideoOptionPause() {
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = true;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = false;
        },
        setVideoOptionLoading() {
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = true;
            this.videoOption.playError = false;
        },
        setVideoOptionError(errorMsg) {
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = true;
            this.videoOption.videoText = errorMsg;
            this.videoUrl = '';
        },
        setVideoOptionClose() {
            this.videoOption.videoMaskFlag = false;
        },
        onPlayerMessage(player) {
            // console.log("onPlayerMessage");
        },
        onPlayerError(player) {
            this.$emit("onPlayerError",player);
            // console.log("onPlayerError");
        },
        onPlayerEnded(player) {
            // console.log("onPlayerEnded");
        },
        onPlayerTimeupdate(player) {
            // console.log("onPlayerTimeupdate");
            this.initVideoTimer();
            this.setVideoOptionClose();
        },
        onPlayerPause() {
            // console.log("onPlayerPause");
            this.setVideoOptionPause();
        },
        // listen event
        onPlayerPlay(player) {
            // console.log('player play!');
        },
        requestVideo() {
            this.setVideoOptionLoading();

            if(!this.videoUrl) {
                // 请求接口
                if(typeof this.requestVideoUrl == "function") {
                    this.requestVideoUrl(this.params).then(res => {
                        if(res.status == 200) {
                            if(res.data[this.type]) {
                                this.videoUrl = res.data[this.type];
                                this.params.videoUrl=this.videoUrl;
                                this.$emit("videoLoadCompleted",this.params);
                            }else {
                                this.videoUrl = '';
                                this.setVideoOptionError("暂无视频数据");
                            }
                        }else {
                            this.setVideoOptionError(res.message || "接口响应失败，请稍后再试");
                        }
                    }).catch(err => {
                        this.setVideoOptionError("接口响应失败，请稍后再试");
                    });
                }else {
                    if(this.requestVideoUrl) {
                        this.videoUrl = this.requestVideoUrl;
                        this.params.videoUrl=this.videoUrl;
                        this.$emit("videoLoadCompleted",this.params);
                    }else {
                        this.setVideoOptionError("暂无视频数据");
                    }
                }
                
            }else {
                let _oldUrl = this.videoUrl;
                this.videoUrl = "";
                setTimeout(() => {
                    this.videoUrl = _oldUrl;
                }, 0);
                // this.player.play();
            }
        },
        // refreshVideo(){
        //     if(this.videoUrl == ''){
        //         this.requestVideo();
        //     }else {
        //         this.setVideoOptionLoading();
        //         this.videoLoadingDelay.count = 0;
        //         this.$emit("refreshVideo");
        //         // this.$refs.livePlayer && this.player.pause();
        //         // setTimeout(() => {
        //         //     this.setVideoOptionLoading();
        //         //     setTimeout(() => {
        //         //         this.player.play();
        //         //     }, 500);
        //         // }, 0);
        //     }
        // },
        refreshVideo(){
            this.videoUrl = '';
            this.initVideoTimer();
            // this.initVideo();
            setTimeout(() => {
                this.requestVideo();
                this.$emit("refreshVideo");
            }, 0);
        },
        initVideo() {
            this.initVideoTimer();
            this.setVideoOptionPause();
            this.videoUrl = '';
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/live-player-reset.scss';
</style>