<template>
    <div class="fusion-layout">
        <div class="c-fusion-left fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :realData="realData" :routeData="routeData"></left>
                </div>
            </div>
        </div>
        <right :realData="realData"></right>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right.vue'
    export default {
        data() {
            return {
                webSocket:null,
                realData:{
                    oilDoor:0,
                    brakePedal:0,
                    headingAngle:0,
                    turnLight:'',
                    gpsTime:''
                },
                vehicleId:this.$route.params.vehicleId,
                canConnectCount:0,
                routeData:{}
            }
        },
        methods: {
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
                    _this.canReconnect();
                }
            },
            onmessage(mesasge){
                let _this=this;
                let json = JSON.parse(mesasge.data);
                /*let type = json.action;*/
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
                console.log("can数据结束连接");
                this.canReconnect();
            },
            onerror(){
                console.log("can数据连接error");
                this.canReconnect();
            },
            onopen(data){
                let real = {
                    'action':'can_real_data',
                    'vehicleIds':this.vehicleId
                }
                let realMsg = JSON.stringify(real);
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
            canReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.canConnectCount>=10){
                    return;
                }
                this.initWebSocket();
                //重连不能超过5次
                this.canConnectCount++;
            },
        },
        components:{Left,Right},
        mounted() {
            this.initWebSocket();
        },
       /* beforeRouteEnter(to, from, next) {
            debugger
            console.log(this, 'beforeRouteEnter'); // undefined
            console.log(to, '组件独享守卫beforeRouteEnter第一个参数');
            console.log(from, '组件独享守卫beforeRouteEnter第二个参数');
            console.log(next, '组件独享守卫beforeRouteEnter第三个参数');
            next(vm => {
                //因为当钩子执行前，组件实例还没被创建
                // vm 就是当前组件的实例相当于上面的 this，所以在 next 方法里你就可以把 vm 当 this 来用了。
                console.log(vm);//当前组件的实例
            });
        },*/
        destroyed(){
            //销毁Socket
            this.webSocket&&this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
    .fusion-left{
        width: 310px;
    }
    .fusion-layout{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
</style>