<template>
    <div class="fusion-style">
        <div class="fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :realData="realData"></left>
                </div>
            </div>
        </div>
        <div class="fusion-right">
            <right :realData="realData"></right>
        </div>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right.vue'
    export default {
        data() {
            return {
                webSocket:{},
                socket:this.$parent.socket,
                realData:{
                    oilDoor:0,
                    brakePedal:0,
                    headingAngle:0,
                    turnLight:'',
                    gpsTime:''
                },
                vehicleId:'B21E-00-021',
            }
        },
        methods: {
            initWebSocket(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.webSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
                }
                _this.webSocket.onmessage = _this.onmessage;
                _this.webSocket.onclose = _this.onclose;
                _this.webSocket.onopen = _this.onopen;
                _this.webSocket.onerror = _this.onerror;
            },
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
            onmessage1(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                let type = json.result.type;
                let data = json.result.data;
                let currentRoute = _this.$router.currentRoute.path;
                let path;
                if(type=='home'){
                    path = '/overview';
                    if(path==currentRoute){
                        return;
                    }
                    this.$router.push({
                        path: path
                    });
                }
                if(type=='vehicle'){
                    path = '/single';
                    if(path==currentRoute){
                        return;
                    }
                    this.$router.push({
                        path: path,
                        query:{vehicleId:data.id}
                    });
                }
                if(type=='road'){
                    path = '/perception';
                    /* if(name==currentRoute){
                         return;
                     }*/
                    this.$router.push({
                        path: path,
                        query:{id:data.id,longitude:data.position.longitude,latitude:data.position.latitude}
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
        components:{Left,Right},
        mounted() {
            this.initWebSocket();
            this.socket.onmessage = this.onmessage1;
            this.socket.onclose = this.onclose1;
            this.socket.onopen = this.onopen1;
            this.socket.onerror = this.onerror1;

        },
        destroyed(){
            //销毁Socket
            this.webSocket.close();
//            this.socket.close();
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
        .fusion-left{
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 270px;
            background: #1a1a1a;;
        }
        .fusion-right{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 270px;
        }
    }
</style>