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
            time:0,

        }
    },
    watch: {
        deep: true,
        $route(newVal, oldVal) {
            console.log(newVal);
            if(newVal.name == 'Single') {
                this.isHeaderShow = false;
            }else {
                this.isHeaderShow = true;
            }
        }
    },
    mounted() {},
    computed: {
        socket (){
            let socket = new WebSocket(window.config.websocketUrl);
            /*if(socket.readyState!=WebSocket.OPEN){
                let i=0;
                this.time = setInterval(()=>{
                    i++;
                    //尝试建立连接5次
                    if(i==5){
                        clearInterval(this.time);
                        return;
                    }
                    if(socket.readyState==WebSocket.OPEN){
                        clearInterval(this.time);
                        return;
                    }
                    console.log("i:"+i)
                    socket = new WebSocket(window.config.websocketUrl);
                    return socket;
                },1000)
            }*/
            return socket;
        }
    },
    destroyed(){}
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
