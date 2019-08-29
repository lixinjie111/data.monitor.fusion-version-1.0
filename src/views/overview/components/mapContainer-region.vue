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
                vehicleId: 'vehicleOnline',
                region: []
            },
            // responseData: [],
            responseDataDraw: [],
            setFitViewFlag: true,
            count: 0,
            flag: true,
            // rectangle: null,
            zoom: 13
        }
    },
    mounted() {
        // this.initWebSocket();
        this.drawMap(); 
    },
    watch: {
        deep: true,
        "webSocketData.region"(newVal, oldVal) {
            // console.log(this.zoom);
            if(oldVal.length == 0) {
                this.initWebSocket();
            }else {
                if(this.zoom >= 13 ) {
                    if(this.webSocket) {
                        this.onopen();
                    }else {
                        this.initWebSocket();
                    }
                }else {
                    this.webSocket && this.webSocket.close();
                    this.webSocket = null;
                    this.removeMarker();
                }
            }
        }
    },
    methods: {
        drawMap() {
            let _option = Object.assign({}, window.defaultMapOption, {
                zoom: this.zoom
            });
            this.AMap = new AMap.Map(this.id, _option);
            // 鼠标和键盘的一些事件
            // 获取边界值
            this.getFourPosition();
            this.AMap.on('moveend', this.showInfoMove);
        },
        showInfoMove() {
            this.getFourPosition();
        },
        getFourPosition() {
            this.zoom = this.AMap.getZoom();
            let finalFourPosition = [];
            let bounds;
            let northEast = [];
            let southWest = [];
            let northWest = [];
            let southEast = [];
            let southwest;
            let northeast;
            bounds = this.AMap.getBounds();
            // 西南
            southWest.push(bounds.southwest.lng);
            southWest.push(bounds.southwest.lat);
            finalFourPosition.push(southWest);
            // 西北
            northWest.push(bounds.southwest.lng);
            northWest.push(bounds.northeast.lat);
            finalFourPosition.push(northWest);
            // 东北
            northEast.push(bounds.northeast.lng);
            northEast.push(bounds.northeast.lat);
            finalFourPosition.push(northEast);
            // 东南
            southEast.push(bounds.northeast.lng);
            southEast.push(bounds.southwest.lat);
            finalFourPosition.push(southEast);

            southwest = [bounds.southwest.lng, bounds.southwest.lat];
            northeast = [bounds.northeast.lng, bounds.northeast.lat];
            let mapBounds = new AMap.Bounds(southWest, northEast);
            // if(this.rectangle) {
            //     this.AMap.remove(this.rectangle);
            // }
            // this.rectangle = new AMap.Rectangle({
            //     bounds: mapBounds,
            //     strokeColor: "red",
            //     strokeWeight: 6,
            //     strokeOpacity: 0.5,
            //     strokeDasharray: [30, 10],
            //     // strokeStyle还支持 solid
            //     strokeStyle: "dashed",
            //     fillColor: "green",
            //     fillOpacity: 0.5,
            //     cursor: "pointer",
            //     zIndex: 50
            // });
            // this.rectangle.setMap(this.AMap);

            this.webSocketData.region = finalFourPosition;
        },
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
            // console.log('sf', message);
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
                // console.log('_responseData.length', _responseData.length);
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
        removeMarker() {
            let _this = this,
                _responseDataDrawLength = _this.responseDataDraw.length;
            if(_responseDataDrawLength > 0) {
                for(let m = 0; m < _responseDataDrawLength; m++) {
                    _this.responseDataDraw[m].marker.off('click', _this.showView);
                    _this.responseDataDraw[m].platNoMarker.off('click', _this.showView);
                    _this.AMap.remove(_this.responseDataDraw[m].marker);
                    _this.AMap.remove(_this.responseDataDraw[m].platNoMarker);
                }
                _this.responseDataDraw = [];
            }
        },
        drawMarker(allPointData) {
            let _this = this,
                _allPointDataLength = allPointData.length;
            this.removeMarker();
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
                        vehicleId: _data.vehicleId,
                        // anchor: 'top-center'
                    });
                    _markerObj.platNoMarker = new AMap.Text({
                        map: _this.AMap,
                        text: _data.plateNo+"<br/><span style='color:#e6a23c'>"+_data.source+'</span>',
                        // text: '京N123456',
                        // anchor: 'top-center', // 设置文本标记锚点
                        style: {
                            'padding': '0 5px',
                            'border-radius': '4px',
                            'background-color': 'rgba(55, 186, 123, .2)',
                            // 'background-color': 'red',
                            'border-width': 0,
                            'text-align': 'center',
                            'font-size': '10px',
                            'line-height': '16px',
                            'letter-spacing': '0',
                            'margin-top': '14px',  //车头
                            'color': '#ccc',
                            'anchor': 'top'
                        },
                        offset: new AMap.Pixel(0, -35), 
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
            // console.log('this.webSocketData', this.webSocketData);
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
        this.webSocket && this.webSocket.close();
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
