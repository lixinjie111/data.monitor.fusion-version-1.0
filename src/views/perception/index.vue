<template>
    <div class="fusion-style">
        <!--头部-->
        <div class="header-style">
            <header-top></header-top>
        </div>
        <div class="fusion-layout">
            <div class="fusion-left">
                <div class="c-scroll-wrap">
                    <div class="c-scroll-inner">
                        <left :currentExtent="currentExtent" :spatCount="spatCount" :signCount="signCount" @getWarningSign="getWarningSign" :perceptionData="perceptionData"></left>
                    </div>
                </div>
            </div>
            <right @getCurrentExtent="getCurrentExtent" @count="count" :realData="realData" @getPerceptionData="getPerceptionData" :warningSign="warningSign"></right>
        </div>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right'
    import HeaderTop from '../../components/header/index.vue';
    export default {
        data() {
            return {
                socket:this.$parent.socket,
                currentExtent:[],
                spatCount:0,
                signCount:0,
                realData:{},
                time:0,
                warningSign:{}
//                perceptionData:{}
            }
        },
        components:{
            HeaderTop,Left,Right
        },
        watch:{
            '$route.params':function (newValue,oldValue) {
//                console.log(newValue.lon,newValue.lat);
                this.$router.replace("/refresh");
            }
        },
        methods: {
            getCurrentExtent(currentExtent){
                this.currentExtent = currentExtent;
//                console.log("边界值："+this.currentExtent);
            },
            count(signCount,spatCount){
                this.spatCount = spatCount;
                this.signCount = signCount;
            },
            getPerceptionData(result){
                this.perceptionData = result;
            },
            getWarningSign(result){
                this.warningSign=result;
            },
            initWebSocket1(){
                let _this=this;
                if ('WebSocket' in window) {
                    _this.socket = new WebSocket(window.config.websocketUrl);  //获得WebSocket对象
                }
                _this.socket.onmessage = _this.onmessage1;
                _this.socket.onclose = _this.onclose1;
                _this.socket.onopen = _this.onopen1;
                _this.socket.onerror = _this.onerror1;
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
//                        path: path+"/"+data.position.longitude+"/"+data.position.latitude,
//                        query:{crossId:data.id}
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
                console.log("发送消息")
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
            let _this = this;
            _this.socket.onmessage = _this.onmessage1;
            _this.socket.onclose = _this.onclose1;
            _this.socket.onopen = _this.onopen1;
            _this.socket.onerror = _this.onerror1;

        },
        destroyed(){
            //销毁Socket
//            this.socket.close();
            clearInterval(this.time);
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
            width: 310px;
           /* background: #1a1a1a;;*/
            z-index:1;
        }
        .fusion-layout{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
    }
</style>