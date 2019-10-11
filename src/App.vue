<template>
    <div id="app">
        <!-- 头部 -->
        <header-bar></header-bar>
        <div class="app-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import HeaderBar from '@/components/header/index.vue'
import {getTopWeather} from '@/api/overview/index.js';
import {mapActions} from 'vuex';
export default {
    name: 'App',
    components: {
        HeaderBar
    },
    data() {
        return {
            isHeaderShow: true,
            changeCenterPoint: window.mapOption.center,
            requestData: {
                disCode: ''
            },
            city: {},
            weather: {},
            webSocket:null,
            connectCount:0,
        }
    },
    watch: {
        deep: true,
        $route(newVal, oldVal) {
//            console.log(newVal);
            if(newVal.name == 'Single') {
                this.isHeaderShow = false;
            }else {
                this.isHeaderShow = true;
            }
        }
    },
    mounted() {
        this.initWebSocket();
    },
    methods:{
        ...mapActions(['changeMapRealData']),
        initWebSocket(){
            let _this=this;
            try{
                if ('WebSocket' in window) {
                    _this.webSocket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                    _this.webSocket.onmessage = _this.onmessage;
                    _this.webSocket.onclose = _this.onclose;
                    _this.webSocket.onopen = _this.onopen;
                    _this.webSocket.onerror = _this.onerror;
                }else{
                    _this.$message("此浏览器不支持websocket");
                }
            }catch (e){
                _this.socketReconnect();
            }
        },
        onmessage(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let type = json.result.type;
            let data = json.result.data;
            let currentRoute = _this.$router.currentRoute.path;
            let path;
            if(type=='home'){
                path = '/overview';
                /*if(path==currentRoute){
                    return;
                }*/
                this.$router.push({
                    path: path
                });
            }
            if(type=='vehicle'){
                path = '/single';
                /*if(path==currentRoute){
                    return;
                }*/
                this.$router.push({
                    path: path+"/"+data.id
                });
            }
            if(type=='road'){
                path = '/perception';
                /* if(name==currentRoute){
                     return;
                 }*/
                this.$router.push({
//                        path: path+"/"+data.position.longitude+"/"+data.position.latitude,
//                        query:{crossId:data.id}
                    path: path+"/" + data.position.longitude + "/" + data.position.latitude+"/"+data.id+ "/"+1+ "/"+false+"/"+0.002,
                });
            }
            if(type=='map'){
                this.changeMapRealData(data);
            }

        },
        onclose(data){
            console.log("小程序控制结束连接");
            this.socketReconnect();
        },
        onerror(){
            console.log("小程序控制连接error");
            this.socketReconnect();
        },
        onopen(data){
            //获取车辆状态
            let operationStatus = {
                "action":"operation_command"
            }
            let operationStatusMsg = JSON.stringify(operationStatus);
            this.sendMsg(operationStatusMsg)
        },
        sendMsg(msg) {
            let _this=this;
            if(window.WebSocket){
                if(_this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.webSocket.send(msg); //send()发送消息
                }
            }else{
                return;
            }
        },
        socketReconnect(){
            //实例销毁后不进行重连
            if(this._isDestroyed){
                return;
            }
            //重连不能超过10次
            if(this.connectCount>=10){
                return;
            }
            this.initWebSocket();
            //重连不能超过5次
            this.connectCount++;
        },
    },
    destroyed(){
        this.webSocket&&this.webSocket.close();
    }
}
</script>

<style lang="scss">
    #app {
        font-family: MicrosoftYaHei;
        background: #2a2a2a;
        position: relative;
        width: 100%;
        height: 100%;
        font-size: 14px;
        line-height: 40px;
        letter-spacing: 2px;
        color: #fff;
        overflow: hidden;
        .app-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
    }
</style>
