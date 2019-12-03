<template>
    <div class="c-fusion-right right-road">
        <div class="perception-road" v-for="(item, index) in centerPointData" :key="index"  >
            <div class="road-word" @click="showRoadDetail(item)">
                <p>{{item.rsName}}</p>
            </div>
            <road-section :id="'map' + index" :mapData="item" class="cross-scan" :processTime="processTime"></road-section>
        </div>
    </div>
</template>
<script>
import {typeCross, getTypicalRoadData, getTypeRoadData} from '@/api/overview/index.js';
import ConvertCoord from '@/assets/js/coordConvert.js';
import RoadSection from './roadSection';
export default {
    components: {
        RoadSection
    },
    data(){
        return {
            centerPointData: [],
            pulseWebsocket:null,
            pulseNowTime:'',
            pulseCount:0,
            platCount:0,
            delayTime:'',
            pulseStart:false,
            drawStart:false

        }
    },
    mounted(){
        this.fetchTypicalRoad();
        this.delayTime = parseFloat(this.$route.params.delayTime).toFixed(3)*1000;
        this.initPulseWebSocket();//启动脉冲
    },
    methods: {
        showRoadDetail(item) {
//            sessionStorage.setItem(item.rsId,JSON.stringify(item));
            let centPos = item.centPos.split(",");
            this.$router.push({
                path: '/perception/'+item.rsId+ "/"+3+"/"+0.004+"/"+true,
                query:{lng:centPos[0],lat:centPos[1],isShow:false}
            });
        },
        // 路段中心点位置
        fetchTypicalRoad() {
            getTypicalRoadData().then(res => {
                let data = res.data;
                this.centerPointData = data.slice(0,4);
            });
        },
        //脉冲
        initPulseWebSocket(){
            let _this=this;
            try{
                if ('WebSocket' in window) {
                    _this.pulseWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                    _this.pulseWebsocket.onmessage = _this.onPulseMessage;
                    _this.pulseWebsocket.onclose = _this.onPulseClose;
                    _this.pulseWebsocket.onopen = _this.onPulseOpen;
                    _this.pulseWebsocket.onerror= _this.onPulseError;
                }else{
                    _this.$message("此浏览器不支持websocket");
                }
            }catch (e){
                this.pulseReconnect();
            }

        },
        onPulseMessage(message){
            let json = JSON.parse(message.data);
            let result = json.result;
            if(this.pulseNowTime==''){
                this.pulseStart=true;
            }
            this.pulseNowTime = result.timestamp;
            this.pulseCount++;
            this.drawStart=false;
            //缓存的时间
            let pulseNum = this.delayTime*2/40;
            let delayTime = this.delayTime*2*0.6;
            if(this.pulseCount>=pulseNum){
                //当平台车开始插值时，调用其他接口
                this.processDataTime = result.timestamp-delayTime;
                //每隔1s调用一次
                if(this.platCount==0||this.platCount>=25){
                    console.log(this.platCount);
                    this.platCount=1;
                    this.drawStart = true;
                }
                this.platCount++;
            }
        },
        onPulseClose(data){
            console.log("感知车结束连接");
            this.pulseReconnect();
        },
        onPulseError(){
            console.log("感知车连接error");
            this.PulseReconnect();
        },
        onPulseOpen(data){
            //旁车
            let pulse = {
                "action":"pulse",
                "data":{
//                        "frequency":39
                    "frequency":this.pulseInterval
                }
            }
            let pulseMsg = JSON.stringify(pulse);
            this.sendPulseMsg(pulseMsg);
        },
        sendPulseMsg(msg) {
            let _this=this;
            if(window.WebSocket){
                if(_this.pulseWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.pulseWebsocket.send(msg); //send()发送消息
                }
            }else{
                return;
            }
        },
        pulseReconnect(){
            //实例销毁后不进行重连
            if(this._isDestroyed){
                return;
            }
            //重连不能超过10次
            if(this.pulseConnectCount>=10){
                return;
            }
            this.initPulseWebSocket();
            //重连不能超过5次
            this.pulseConnectCount++;
        },
    },
    destroyed(){
        this.pulseWebsocket&&this.pulseWebsocket.close();
    }
}
</script>
<style lang="scss" scoped>
    .perception-road{
        position: relative;
        height: 176px;
        width: 315px;
        border: 1px solid #5e5970;
        padding: 5px 6px 6px 6px;
        margin-bottom: 20px;
        top:33px;
        overflow: hidden;
        cursor: pointer;
        .road-word {
            // position: relative;
            position: absolute;
            z-index: 2;
            padding-left: 7px;
        }
        .cross-scan {
          display: block;
          height: 100%;
          width: 100%;
          z-index: 555;
        }
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
        // z-index:1;
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
