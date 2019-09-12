<template>
    <div class="fusion-style">
        <!--头部-->
        <div class="header-style">
            <header-top></header-top>
        </div>
        <!-- 左侧 -->
        <div class="fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left-overview></left-overview>
                </div>
            </div>
        </div>
        <!-- 地图 -->
        <map-container></map-container>
        <!-- 右侧 -->
        <div class="fusion-right">
            <special-road></special-road>
        </div>
        <div class="fusion-bottom">
            <!-- 底部车辆信息 -->
            <bottom-overview></bottom-overview>
        </div>
    </div>
</template>
<script>
import LeftOverview from './components/leftOverview.vue';
import MapContainer from './components/mapContainer.vue';
import BottomOverview from './components/bottomOverview.vue';
import SpecialRoad from './components/specialRoad';
import HeaderTop from '../../components/header/index.vue';
export default {
    components: {
        LeftOverview,
        MapContainer,
        BottomOverview,
        SpecialRoad,
        HeaderTop
    },
    data() {
        return {
            socket:this.$parent.socket
        }
    },
    methods: {
        initWebSocket1(){
            let _this=this;
            if ('WebSocket' in window) {
                _this.socket = new WebSocket(window.config.websocketUrl); //获得WebSocket对象
                _this.socket.onmessage = this.onmessage1;
                _this.socket.onclose = this.onclose1;
                _this.socket.onopen = this.onopen1;
                _this.socket.onerror = this.onerror1;
            }
        },
        onmessage1(mesasge){
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
//                    path: path+"/"+data.position.longitude+"/"+data.position.latitude
                    path: path+"/" + data.position.longitude + "/" + data.position.latitude+"/"+data.id+ "/"+1+ "/"+false,
                });
            }
            if(type=='map'){
                this.realData = data;
            }


        },
        onclose1(data){
            console.log("结束连接");
        },
        onopen1(data){
            //获取车辆状态
            var operationStatus = {
                "action":"operation_command"
            }
            var operationStatusMsg = JSON.stringify(operationStatus);
            this.sendMsg1(operationStatusMsg);
        },
        sendMsg1(msg) {
            let _this=this;
            if(window.WebSocket){
                if(_this.socket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.socket.send(msg); //send()发送消息
                }
            }else{
                return;
            }
        }
    },
    mounted() {
        this.socket.onmessage = this.onmessage1;
        this.socket.onclose = this.onclose1;
        this.socket.onopen = this.onopen1;
        this.socket.onerror = this.onerror1;
    },
    destroyed(){}
}
</script>
<style lang="scss" scoped>
.fusion-style{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // overflow: scroll;
    .fusion-left{
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 330px;
        // background: #1a1a1a;
        // background-image: linear-gradient(90deg, #000 0%, #000 100%);
        // opacity: 0.5;
        background: linear-gradient(to right, rgba(0, 0 ,0 , .6) 30%, rgba(0, 0 ,0 , 0));
    }
    .fusion-right{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
        background: linear-gradient(to right, rgba(0, 0 ,0 , .6) 30%, rgba(0, 0 ,0 , 0));
        // width:327px; 
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
    .fusion-bottom {
        position: absolute;
        bottom: 30px;
        margin: auto;
        left: 0;
        right: 0;
        height: 80px;
    } 
}   
</style>