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
            webSocket:null,
            webSocketData: {
                action: "vehicleOnline",
                token: 'fpx',
                vehicleId: 'vehicleOnline'
            },
            // responseData: [],
            responseDataDraw: [],
            setFitViewFlag: true,
            count: 0,
            flag: true
        }
    },
    mounted() {
        this.initWebSocket();
        this.AMap = new AMap.Map(this.id, this.$parent.$parent.defaultMapOption);
    },
    methods: {
        initWebSocket(){
            // console.log('websocket获取地图行驶车辆展示');
            if ('WebSocket' in window) {
                this.webSocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                this.webSocket.onmessage = this.onmessage;
                this.webSocket.onclose = this.onclose;
                this.webSocket.onopen = this.onopen;
                this.webSocket.onerror = this.onerror;
            }
        },
        onmessage(message) {
            let _json = JSON.parse(message.data),
            _result = _json.result.allVehicle;
            if (_result.length == 0) {
                console.log(_json);
                console.log("当前数据为空",this.dateUtil.formatTime(_json.result.time));
            }
            if (this.flag) {
                this.flag = false;
                let _responseData = _result.map( item => {
                    let _option = {
                        vehicleId: item.vehicleId,
                        plateNo: item.plateNo,
                        source: item.source.join(','),
                        heading: item.heading,
                        // position: new AMap.LngLat(item.longitude, item.latitude)
                        position: [item.longitude, item.latitude] // （经度，纬度)
                    };
                    return _option;
                });
                this.changeLngLat(_responseData);
            }
        },
        changeLngLat(_allPointData) {
            let _this = this;
            // console.log(_this.count);
            // _allPointData.forEach((item, index, arr) => {
            for ( let i = 0; i < _allPointData.length; i++) {
                // console.log(_allPointData[i].position);
                (function(itemIndex){
                    // 数组中每一项item的position的经纬度转换
                    let _position = ConvertCoord.wgs84togcj02(_allPointData[itemIndex].position[0], _allPointData[itemIndex].position[1]);
                    _allPointData[itemIndex].position = _position;
                    _this.count ++;
                    if(_this.count == _allPointData.length) {
                        //绘制线的轨迹
                        _this.drawMarker(_allPointData);
                    }
                })(i);
            };
        },
        drawMarker(allPointData) {
            let _this = this,
                _responseDataDrawLength = _this.responseDataDraw.length,
                _allPointDataLength = allPointData.length;
            if(_responseDataDrawLength > 0) {
                for(let m = 0; m < _this.responseDataDraw.length; m++) {
                    _this.responseDataDraw[m].marker.off('click', _this.showView);
                    _this.responseDataDraw[m].platNoMarker.off('click', _this.showView);
                    _this.AMap.remove(_this.responseDataDraw[m].marker);
                    _this.AMap.remove(_this.responseDataDraw[m].platNoMarker);
                }
                _this.responseDataDraw = [];
            }
            for(let i = 0; i < _allPointDataLength; i++) {
                let _data = allPointData[i];
                if(_data.position) {
                    let _markerObj = {
                        marker: null,
                        platNoMarker: null
                    };
                    _markerObj.marker = new AMap.Marker({
                        map: _this.AMap,
                        position: _data.position,
                        icon: "static/images/car/point.png",
                        offset: new AMap.Pixel(-2, -2),
                        angle: _data.heading,
                        zIndex: 50,
                        vehicleId: _data.vehicleId
                    });
                    _markerObj.platNoMarker = new AMap.Text({
                        map: _this.AMap,
                        text: _data.plateNo+"<br/><span style='color:#e6a23c'>"+_data.source+'</span>',
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
                        position: _data.position,
                        vehicleId: _data.vehicleId
                    });
                    _markerObj.marker.on('click', _this.showView);
                    _markerObj.platNoMarker.on('click', _this.showView);

                    _this.responseDataDraw.push(_markerObj);
                }

                if(i == _allPointDataLength - 1) {
                    if(_this.setFitViewFlag) {
                        this.AMap.setFitView();
                        _this.setFitViewFlag = false;
                    }
                    setTimeout(() => {
                        _this.count = 0;
                        _this.flag = true;
                        // console.log("绘制结束--------");
                    }, 0);
                }
            }
        },
        showView(e) {
            this.$router.push({
                path: '/single/'+e.target.get("vehicleId"),
            });
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
        this.webSocket&&this.webSocket.close();
    }
}
// export default {
//     name: "MapContainer",
//     data () {
//         return {
//             id: "data-map-container",
//             AMap: null,
//             // 获取在驾驶的实时车辆数据
//             webSocket: {},
//             webSocketData: {
//                 aciton: 'vehicleOnline',
//                 token: 'fpx',
//                 vehicleId: 'vehicleOnline'
//             },
//             responseDataDraw: [],
//             setFitViewFlag: true,
//             count: 0,
//             flag: true
//             // setCenter: [121.262939,31.245149]
//         }
//     },
//     mounted() {
//         this.initWebSocket();
//         this.AMap = new AMap.Map(this.id, this.$parent.$parent.defaultMapOption);
//         // this.getWms();
//     },
//     methods: {
//         // websocket获取地图行驶车辆展示
//         initWebSocket() {
//             if ('WebSocket' in window) {
//                 this.webSocket = new WebSocket(window.config.socketUrl); // 获取websocket对象
//             };
//             this.webSocket.onmessage = this.onmessage;
//             this.webSocket.onclose = this.onclose;
//             this.webSocket.onopen = this.onopen;
//             this.webSocket.onerror = this.onerror; 
//         },
//         // onmessage方法
//         onmessage(message) {
//             let _json = JSON.parse(message.data);
//             _result = _json.result.allVehicle;
//             console.log('_json', _json);
//         },
//         // 将定点坐标的图层添加到地图中
//         getWms() {
//             var wms  = new AMap.TileLayer.WMS({
//                 // url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
//                 blend: false,
//                 tileSize: 256,
//                 params:{'LAYERS': 'shanghai_qcc:gd_dlzc', VERSION:'1.1.0'}
//             })
//             wms.setMap(this.AMap);
//             this.AMap.setZoom(12);
//             this.$parent.$parent.changeCenterPoint = this.setCenter;
//         }
//     }
// }
</script>
<style scoped lang="scss">
.c-view-map{
    height: 100%;
    width: 100%;
    z-index: -2;
}
</style>
