<template>
    <div class="fusion-style">
        <div class="fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :currentExtent="currentExtent" :spatCount="spatCount" :signCount="signCount"></left>
                </div>
            </div>
        </div>
        <div class="base-info">
            <span class="base-time">{{$parent.formatTime || '--'}}</span>
            <span>
                    <em >{{$parent.city.district || '--'}}</em>
                    <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                    <em class="c-middle">{{$parent.weather.wendu || '--'}}°</em>
                </span>
        </div>
        <div class="fusion-right">
            <right @getCurrentExtent="getCurrentExtent" @count="count" :realData="realData"></right>
        </div>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right'
    export default {
        data() {
            return {
                socket:{},
                vehicleId:'B21E-00-021',
                currentExtent:[],
                spatCount:0,
                signCount:0,
                realData:{}
            }
        },
        methods: {
            getCurrentExtent(currentExtent){
                this.currentExtent = currentExtent;
//                console.log("边界值："+this.currentExtent);
            },
            count(spatCount,signCount){
                this.spatCount = spatCount;
                this.signCount = signCount;
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
            this.initWebSocket1();
        },
        destroyed(){
            //销毁Socket
            this.socket.close();
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