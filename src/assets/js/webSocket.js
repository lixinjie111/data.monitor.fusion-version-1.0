/**
 * 实时接口发送
 */
class WebSocketObj {
    constructor(vueObj, url = '', params = {}, callback, optionCallback = {}){
    	this.vueObj = vueObj;
        this.webSocketUrl = url;
    	this.params = params;
    	this.callback = callback;
    	this.webSocket = null;
    	this.connectCount = 0;
        this.optionCallback = optionCallback;
        this.initWebSocket();
        // setInterval(() => {
        //     this.webSocket.close();
        // }, 2000);
    }
    initWebSocket(){
        try{
            if ('WebSocket' in window) {
                this.webSocket = new WebSocket(this.webSocketUrl);  //获得WebSocket对象
                this.webSocket.onmessage = this.onMessage.bind(this);
                this.webSocket.onclose = this.onClose.bind(this);
                this.webSocket.onopen = this.onOpen.bind(this);
                this.webSocket.onerror=this.onError.bind(this);
            }else{
                this.$message("此浏览器不支持websocket");
            }
        }catch (e){
            this.reconnect();
        }

    }
    onMessage(message){
        this.callback(message);
    }
    onClose(){
        console.log("结束连接:"+this.params.action);
        this.reconnect();
    }
    onError(){
        console.log("连接error:"+this.params.action);
        this.reconnect();
    }
    onOpen(){
        let _params = JSON.stringify(this.params);
        this.sendMsg(_params);
        if(this.optionCallback.openMeg) {
            let _paramsMore = JSON.stringify(this.optionCallback.openMeg);
            this.sendMsg(_paramsMore);
        }
    }
    sendMsg(params) {
        if(window.WebSocket){
            if(this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                this.webSocket.send(params); //send()发送消息
                this.connectCount = 0;
                if(this.optionCallback.sendMsg && typeof this.optionCallback.sendMsg == 'function') {
                    this.optionCallback.sendMsg();
                }
            }
        }else{
            return;
        }
    }
    reconnect(){
        //实例销毁后不进行重连
        if(this.vueObj._isDestroyed){
            console.log("实例销毁后不进行重连:"+this.params.action);
            return;
        }
        //重连不能超过5次
        if(this.connectCount >= 5){
            console.log("重连不能超过5次");
            return;
        }
        this.initWebSocket();
        //重连不能超过5次
        this.connectCount++;
        console.log("第"+this.connectCount+"次重连");
    }
}
export default WebSocketObj;