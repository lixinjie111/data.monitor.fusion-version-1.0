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
        },
        refName:{
            default:'',
            type:String
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
                countTime: 20,
                reloadTime: 3,
                reloadCountLimit: 3,
                reloadCount: 0,
                lastTimeupdate: -1,
                count: 0
            }
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
        },
        'requestVideoUrl'(newVal,oldVal){
            if(newVal){
                this.videoLoadingDelay.count = 0;
                this.requestVideoUrl = newVal;
                this.videoUrl = "";
                this.requestVideo();
            }
        },
        'videoUrl'(newVal,oldVal){
            if(!newVal){
                this.videoLoadingDelay.lastTimeupdate = -1;
            }
        }
    },
    mounted() {
        this.player = this.$refs.livePlayer.player ? this.$refs.livePlayer.player : this.$refs.livePlayer;
        if(this.autoplay) {
            this.requestVideo();
        }
    },
    methods: {
        initVideoTimer() {
            if(this.videoLoadingDelay.timer) {
                clearInterval(this.videoLoadingDelay.timer);
                clearInterval(this.videoLoadingDelay.timer._id);
            }
            this.videoLoadingDelay.count = 0;
            this.videoLoadingDelay.reloadCount = 0;
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
        videoTimerReload() {
            clearInterval(this.videoLoadingDelay.timer);
            this.videoLoadingDelay.timer = setInterval(() => {
                this.videoLoadingDelay.count ++;
                this.videoLoadingDelay.reloadCount ++;
                console.log("视频卡顿"+this.videoLoadingDelay.reloadTime,this.videoLoadingDelay.count,"连续加载次数", this.videoLoadingDelay.reloadCount);
                if(this.videoLoadingDelay.count >= this.videoLoadingDelay.reloadTime) {
                    if(this.videoLoadingDelay.reloadCount >= this.videoLoadingDelay.reloadCountLimit) {
                        console.log("连续加载已达上限，关闭加载");
                        this.setVideoOptionError("此视频暂无法播放，请稍后再试");
                    }else {
                        console.log("视频卡顿重新加载");
                        this.requestVideo();
                    }
                }
            }, 2000);
//            console.log("第一个定时器："+this.videoLoadingDelay.timer );
        },
        setVideoOptionPause() {
            this.initVideoTimer();
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
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = true;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = true;
            this.videoOption.videoText = errorMsg;
            this.videoUrl = '';
        },
        setVideoOptionClose() {
            this.initVideoTimer();
            this.videoOption.videoMaskFlag = false;
            this.videoOption.playFlag = false;
            this.videoOption.loadingFlag = false;
            this.videoOption.playError = false;
        },
        onPlayerMessage(player) {
            // console.log("onPlayerMessage");
        },
        onPlayerError(player) {
            this.$emit("onPlayerError",player);
            // console.log("onPlayerError");
            this.setVideoOptionError("此视频暂无法播放，请稍后再试");
        },
        onPlayerEnded(player) {
            // console.log("onPlayerEnded");
            this.setVideoOptionPause();
        },
        onPlayerTimeupdate(player) {
//             console.log("onPlayerTimeupdate",player);
            console.log("timeupdate", player, this.videoLoadingDelay.lastTimeupdate);
            if(this.videoLoadingDelay.lastTimeupdate != player) {
                console.log("---------更新");
                this.videoLoadingDelay.lastTimeupdate = player;
                this.setVideoOptionClose();
            }
            setTimeout(() => {
                this.videoTimerReload();
            }, 0);
            this.$emit("videoTimeupdate",player);
        },
        onPlayerPause() {
            // console.log("onPlayerPause");
//            this.setVideoOptionPause();
            this.setVideoOptionPause();
        },
        // listen event
        onPlayerPlay(player) {
            // console.log('player play!');
            this.setVideoOptionPause();
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
        refreshVideo(){
            this.videoUrl = '';
            this.initVideoTimer();
            this.initVideo();
            setTimeout(() => {
                this.requestVideo();
                this.$emit("refreshVideo");
            }, 0);
        },
        initVideo() {
            this.setVideoOptionPause();
            this.videoUrl = '';
        }
    },
    destoryed() {
        if(this.videoLoadingDelay.timer) {
            clearInterval(this.videoLoadingDelay.timer);
            clearInterval(this.videoLoadingDelay.timer._id);
        }
        if(this.player) {
            this.player.pause();
        }else {
            this.initVideoTimer();
            this.videoUrl = '';
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/live-player-reset.scss';
</style>