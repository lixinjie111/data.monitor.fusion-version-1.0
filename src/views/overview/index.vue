<template>
    <div class="fusion-style">
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
        <div class="base-info">
            <span class="base-time">{{$parent.formatTime || '--'}}</span>
            <span>
                <em >{{$parent.city.district || '--'}}</em>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <em class="c-middle">{{$parent.weather.wendu || '--'}}°</em>
            </span>
        </div>
        <div class="fusion-right">
            <!-- <right-overview  @queryCrossDetail="queryCrossDetail"></right-overview> -->
            <typical-section  @queryCrossDetail="queryCrossDetail"></typical-section>
        </div>
        <div class="fusion-bottom">
            <!-- 底部车辆信息 -->
            <bottom-overview></bottom-overview>
        </div>
    </div>
</template>
<script>
import LeftOverview from './components/leftOverview.vue';
// import RightOverview from './components/rightOverview.vue';
import MapContainer from './components/mapContainer.vue';
import BottomOverview from './components/bottomOverview.vue';
import TypicalSection from './components/typicalSection.vue';
export default {
    components: {
        LeftOverview,
        // RightOverview,
        MapContainer,
        BottomOverview,
        TypicalSection
    },
    data() {
        return {
            defaultCenterPoint: [121.262939,31.245149],
            requestData: {
                disCode: ''
            },
            webSocket:{},
            socket:{},
            realData:{
                oilDoor:0,
                brakePedal:0,
                headingAngle:0,
                turnLight:'',
                gpsTime:''
            },
            selectedItem:{},
            vehicleId:'B21E-00-021',
        }
    },
    mounted() {
        this.initWebSocket();
    },
    methods: {
        initWebSocket(){
            let _this=this;
            if ('WebSocket' in window) {
                _this.webSocket = new WebSocket('ws://172.17.1.13:9982/mon');  //获得WebSocket对象
            }
            _this.webSocket.onmessage = _this.onmessage;
            _this.webSocket.onclose = _this.onclose;
            _this.webSocket.onopen = _this.onopen;
            _this.webSocket.onerror = _this.onerror;
        },
        // queryCrossDetail(item){
        //     this.dialogVisible=true;
        //     this.selectedItem = item;
        //     console.log('this.selectedItem', this.selectedItem);
        // },
        onmessage(mesasge){
            let _this=this;
            var json = JSON.parse(mesasge.data);
            /*var type = json.action;*/
            // console.log("data.transmission========"+data.transmission);
            if(json.result.transmission=='P'){
                this.realData.transmission='P';
                this.realData.oilDoor=0;
                this.realData.brakePedal=0;
            }else{
                this.realData = json.result;
            }
        },
        onclose(data){
            console.log("结束连接");
        },
        onopen(data){
            var real = {
                'action':'can_real_data',
                /*'vid':this.vehicleID,*/
                'vehicleIds':this.vehicleId
            }
            var realMsg = JSON.stringify(real);
            this.sendMsg(realMsg);
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
        onerror(event){
            console.error("WebSocket error observed:", event);
        },
        initWebSocket1(){
            let _this=this;
            if ('WebSocket' in window) {
                _this.socket = new WebSocket(window.cfg.websocketUrl); //获得WebSocket对象
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
            let currentRoute = _this.$router.currentRoute.name;
            let name;
            if(type=='home'){
                name = 'Overview';
                if(name==currentRoute){
                    return;
                }
                this.$router.push({
                    name: name
                });
            }
            if(type=='vehicle'){
                name = 'Single';
                if(name==currentRoute){
                    return;
                }
                this.$router.push({
                    name: name,
                    params:{id:data.id}
                });
            }
            if(type=='road'){
                name = 'Perception';
                if(name==currentRoute){
                    return;
                }
                this.$router.push({
                    name: name,
                    params:{id:data.id}
                });
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
        },
        mounted() {
            this.initWebSocket();
            this.initWebSocket1();
        },
        destroyed(){
            //销毁Socket
            this.socket.close();
            this.initWebSocket.close();
        }
    }
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