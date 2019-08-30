<template>
    <div class="c-view-map" :id="id"></div>
</template>
<script>
import { getRoadCenterIds, getRoadCenterPoints} from '@/api/overview/index.js';
import ConvertCoord from '@/assets/js/coordConvert.js'
export default {
    name: "MapContainer",
    data () {
        return {
            id: "car-map-container",
            AMap: null,
            // 获取在驶车辆实时数据（辆）
            webSocket:{},
            webSocketData: {
                action: "vehicleOnline",
                token: 'fpx',
                vehicleId: 'vehicleOnline'
            },
            // responseData: [],
            responseDataDraw: [],
            setFitViewFlag: true,
            count: 0,
            flag: true,
            prevData: []
        }
    },
    mounted() {
        this.AMap = new AMap.Map(this.id, window.defaultMapOption);
        this.initWebSocket();
    },
    methods: {
        initWebSocket(){
            // console.log('websocket获取地图行驶车辆展示');
            if ('WebSocket' in window) {
                this.webSocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
            }
            this.webSocket.onmessage = this.onmessage;
            this.webSocket.onclose = this.onclose;
            this.webSocket.onopen = this.onopen;
            this.webSocket.onerror = this.onerror;
        },
        onmessage(message){
            let _this = this,
                _json = JSON.parse(message.data),
                _result = _json.result.allVehicle;
            if (_result.length > 0) {
                // console.log(_result.length);
                let _filterData = {};
                _result.forEach((item, index) => {
                    _filterData[item.vehicleId] = {
                        vehicleId: item.vehicleId,
                        plateNo: item.plateNo,
                        source: item.source.join(','),
                        heading: item.heading,
                        speed: item.speed,
                        position: ConvertCoord.wgs84togcj02(item.longitude, item.latitude),
                        marker: null,
                        plateNoMarker: null
                    };
                });
                for (let id in _this.prevData) {
                    if(_filterData[id]) {   //表示有该点，做setPosition
                        // console.log(_this.prevData[id].plateNo, "moveTo");
                        _filterData[id].marker = _this.prevData[id].marker;
                        _filterData[id].plateNoMarker = _this.prevData[id].plateNoMarker;
                        let _currentCar = _filterData[id];
                        _filterData[id].marker.setAngle(_currentCar.heading);
                        _filterData[id].marker.moveTo(_currentCar.position, _currentCar.speed);
                        _filterData[id].plateNoMarker.moveTo(_currentCar.position, _currentCar.speed);
                    }else {   //表示没有该点，做remove
                        // console.log(_this.prevData[id].plateNo, "remove");
                        _this.prevData[id].marker.off('click', _this.showView);
                        _this.prevData[id].plateNoMarker.off('click', _this.showView);
                        _this.prevData[id].marker.stopMove();
                        _this.prevData[id].plateNoMarker.stopMove();
                        _this.AMap.remove(_this.prevData[id].marker);
                        _this.AMap.remove(_this.prevData[id].plateNoMarker);
                        delete _this.prevData[id];
                    }
                }
                for (let id in _filterData) {
                    if(!_this.prevData[id]) {   //表示新增该点，做add
                        // console.log(_filterData[id].plateNo, "add");
                        _this.addMarker(_filterData[id]);
                        _this.addPlateNoMarker(_filterData[id]);
                    }       
                }

                if(_this.setFitViewFlag) {
                    _this.AMap.setFitView();
                    _this.setFitViewFlag = false;
                }
                _this.prevData = _filterData;
            } else {
                // 返回的数据为空
                for (let id in _this.prevData) {
                    // console.log("delete:-"+_this.prevData[id].plateNo);
                    _this.prevData[id].marker.off('click', _this.showView);
                    _this.prevData[id].plateNoMarker.off('click', _this.showView);
                    // _this.prevData[id].marker.setMap(null);
                    // _this.prevData[id].plateNoMarker.setMap(null);
                    _this.prevData[id].marker.stopMove();
                    _this.prevData[id].plateNoMarker.stopMove();
                    _this.AMap.remove(_this.prevData[id].marker);
                    _this.AMap.remove(_this.prevData[id].plateNoMarker);
                    delete _this.prevData[id];
                }
                // this.prevData = {};
            }
        },
        addMarker(obj) {
            obj.marker = new AMap.Marker({
                map: this.AMap,
                position: obj.position,
                icon: "static/images/car/point.png",
                offset: new AMap.Pixel(-2, -2),
                angle: obj.heading,
                zIndex: 50,
                vehicleId: obj.vehicleId
            });
            obj.marker.on('click', this.showView);
        },
        addPlateNoMarker(obj) {
            obj.plateNoMarker = new AMap.Text({
                map: this.AMap,
                text: obj.plateNo+"<br/><span style='color:#e6a23c'>"+obj.source+'</span>',
                // text: '京N123456',
                anchor: 'center', // 设置文本标记锚点
                style: {
                    'padding': '0 5px',
                    'border-radius': '4px',
                    'background-color': 'rgba(55, 186, 123, .2)',
                    'border-width': 0,
                    'text-align': 'center',
                    'font-size': '10px',
                    'line-height': '16px',
                    'letter-spacing': '0',
                    'margin-top': '14px',  //车头
                    'color': '#ccc'
                },
                offset: new AMap.Pixel(0, -35),
                position: obj.position,
                vehicleId: obj.vehicleId
            });
            obj.plateNoMarker.on('click', this.showView);
        },
        showView(e) {
            const { href } = this.$router.resolve({
                name: 'Single',
                params: {
                    vehicleId: e.target.get("vehicleId")
                }
            })
            window.open(href, '_blank')
        },
        onclose(data){
            // console.log("结束--vehicleOnline--连接");
        },
        onopen(data){
            // console.log("建立--vehicleOnline--连接");
            //行程
            this.sendMsg(JSON.stringify(this.webSocketData));
        },
        sendMsg(msg) {
            // console.log("vehicleOnline--连接状态："+this.webSocket.readyState);
            if(window.WebSocket){
                if(this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    this.webSocket.send(msg); //send()发送消息
                    // console.log("vehicleOnline--已发送消息:"+ msg);
                }
            }else{
                return;
            }
        }
    },
    destroyed(){
        //销毁Socket
        this.webSocket.close();
    }
}
</script>
<style scoped lang="scss">
.c-view-map{
    height: 100%;
    width: 100%;
    z-index: -2;
}
</style>

