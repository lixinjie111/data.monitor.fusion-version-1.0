<template>
    <div class="c-fusion-right single-right">
        <p class="c-title">前向摄像头</p>
        <div class="fusion-video">
            <live-player
                    :requestVideoUrl="requestVideoUrl"
                    :params="forwardParam"
                    type="rtmp"
                    :autoplay="false"
                    @videoLoadCompleted="videoLoadCompleted"
                    :isBig="false"
                    v-if="forwardShow"
            >
            </live-player>
            <p class="video-position" v-if="!forwardShow">暂无数据</p>
        </div>
        <p class="c-title">车内摄像头</p>
        <div class="fusion-video">
            <live-player
                    :requestVideoUrl="requestVideoUrl"
                    :params="inParam"
                    type="rtmp"
                    :autoplay="false"
                    @videoLoadCompleted="videoLoadCompleted"
                    :isBig="false"
                    v-if="inShow"
            >
            </live-player>
            <p class="video-position"  v-if="!inShow">暂无数据</p>
        </div>
    </div>
</template>
<script>
    import {getLiveDeviceInfo, startStream, sendStreamHeart } from '@/api/single'
    import LivePlayer from '@/components/livePlayer'
    export default {
        data() {
            return {
                vehicleId:this.$route.params.vehicleId,
                requestVideoUrl:startStream,
                forwardParam:{},
                inParam:{},
                forwardShow:false,
                inShow:false,
                timeObj:{}
            }
        },
        mounted(){
            this.getDeviceInfo();
        },
        components:{
            LivePlayer
        },
        methods: {
            //视频报错的方法
            getDeviceInfo(){
                getLiveDeviceInfo({
                    'vehicleId': this.vehicleId,
                }).then(res => {
                    let result = res.data;
                    result.forEach(item=>{
                        let param = {
                            'vehicleId': this.vehicleId,
                            'camId':item.serialNum,
                            'protocal':item.protocol
                        };
                        //前向摄像头
                        if(item.toward==0){
                            this.forwardParam = param;
                            this.forwardShow=true;
                        }
                        //车内摄像头
                        if(item.toward==4){
                            this.inParam = param;
                            this.inShow=true;

                        }
                    })
                });
            },
            videoLoadCompleted(param){
                this.repeatFn(param);
            },
            keepStream(item){
                sendStreamHeart({
                    'vehicleId': this.vehicleId,
                    'camId':item.camId,
                    'protocal':item.protocal
                }).then(res => {
                });
            },
            repeatFn(item){//每5秒直播报活一次
                let _this = this;
                this.keepStream(item);
                if(this.timeObj[item.camId]){
                    clearInterval(this.timeObj[item.camId]);
                }else {
                    this.timeObj[item.camId] = null;
                }
                this.timeObj[item.camId] = setInterval(function(){
                    _this.keepStream(item)
                },5000);
            }
        },
        beforeDestroy(){
            console.log("单车页面销毁");
            //释放定时器
            for(let key in this.timeObj){
                clearTimeout(this.timeObj[key]);
            }
        },
    }
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .single-right {
        width: 270px;
        padding-top: 68px !important;
    }
    .fusion-video{
        border:1px solid rgba(211, 134, 0, 0.5);
        margin: 20px 0px;
        height: 184px;
        box-sizing: border-box;
        /* padding-top: 10px;*/
    }
    .video-position{
        @include layoutMode(both);
        height:100%;
        background: $background;
    }
</style>
<style lang="scss">
.single-right {
    .fusion-video .vjs-error .vjs-error-display:before{
        font-size: 3em;
        color: #ccc;
        top:60%;
        display: none;
    }
    .fusion-video .vjs-modal-dialog-content{
        padding-top:50px!important;
    }
    .fusion-video .vjs-custom-skin > .video-js .vjs-big-play-button{
        font-size: 0.5em!important;
    }
    .fusion-video .video-js{
        height: 180px!important;
    }
}
</style>