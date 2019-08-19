<template>
<div >
   <div :id="id"  class="road-scan"></div>
</div>
</template>
<script>
export default {
    props: {
        id: String,
        mapData: Object,
    },
    data() {
        return {
            aMap: null,
            wms: {},
            mapRoadData: this.mapData,
            mapOption:{
                resizeEnable: true,
                zoom: 18,
                mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
            },
            crossData: {
                roadLights: [], // 红绿灯数据
                roadSenseCars: [], // 车辆数据
                roadWebSocket: {}, // websocket对象
                finalFourPosition: [],
                count: 0,
                sideVehicleObj: {}, // 地图上画车辆
                sideLight: {} // 
            },
            roadWebSocket: {}
        }
    },
    mounted() {
        this.aMap = new AMap.Map(this.id, this.mapOption);
        this.drawRoadMap();
    },
    methods: {
        drawRoadMap() {
            console.log('this.mapRoadData', this.mapRoadData);
            let position = new AMap.LngLat(this.mapRoadData.longitude, this.mapRoadData.latitude);
            this.wms  = new AMap.TileLayer.WMS({
                url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
                blend: false,
                tileSize: 256,
                params:{'LAYERS': 'shanghai_qcc:dl_shcsq_wgs84_gjlk',VERSION:'1.1.0'}
            });
            this.wms.setMap(this.aMap);
            this.aMap.setCenter(position);
            this.aMap.setZoom(18);
            this.getFourPosition();
        },
        // 获取四周的经纬度
        getFourPosition(mapOption) {
            let finalFourPosition = [];
            let bounds;
            let northEast = [];
            let southWest = [];
            let northWest = [];
            let southEast = [];
            let southwest;
            let northeast;
            let x = 0.0005;
            let y = 0.0003;
            bounds = this.aMap.getBounds();
            // 西南
            southWest.push(bounds.southwest.lng - x);
            southWest.push(bounds.southwest.lat - y);
            finalFourPosition.push(southWest);
            // 西北
            northWest.push(bounds.southwest.lng - x);
            northWest.push(bounds.northeast.lat + y);
            finalFourPosition.push(northWest);
            // 东北
            northEast.push(bounds.northeast.lng + x);
            northEast.push(bounds.northeast.lat + y);
            finalFourPosition.push(northEast);
            // 东南
            southEast.push(bounds.northeast.lng + x);
            southEast.push(bounds.southwest.lat - y);
            finalFourPosition.push(southEast);
            southwest = [bounds.southwest.lng, bounds.southwest.lat];
            northeast = [bounds.northeast.lng, bounds.northeast.lat];
            this.crossData.finalFourPosition = finalFourPosition;
            this.initWebsocket();
        },
        // 第一个路段
        initWebsocket() {
            let _this = this;
            if ('WebSocket' in window) {
                _this.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.roadWebSocket.onmessage = _this.onMessage;
            _this.roadWebSocket.onclose = _this.onClose;
            _this.roadWebSocket.onopen = _this.onOpen;
            _this.roadWebSocket.onerror = _this.onError;
        },
        onMessage(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let lightPosition;
            let carPosition;
            if ('spatDataDTO' in result === true) {
                _this.crossData.roadLights = result.spatDataDTO;
                if ( _this.crossData.roadLights.length > 0) {
                    _this.crossData.roadLights.map((x, index) => {
                        lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                        _this.crossData.roadLights[index].position = lightPosition;
                    });
                    for (let id in _this.crossData.sideLight) {
                        let flag = false;
                        // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                        for (let i = 0; i <  _this.crossData.roadLights.length; i++) {
                            if (id ===  _this.crossData.roadLights[i].spatId) {
                                if (_this.crossData.sideLight[id].flag) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        // 不存在时，隐藏掉
                        if (!flag) {
                            _this.crossData.sideLight[id].flag = false;
                        }
                    }
                    // 开始打点
                    _this.crossData.roadLights.forEach((subItem, subIndex, subArr) => {
                        if (_this.crossData.sideLight[subItem.spatId]) {
                            let roadLig = _this.crossData.sideLight[subItem.spatId];
                            roadLig.marker.setIcon(this.dealLight(subItem));
                        } else {
                            // 新的
                            _this.crossData.sideLight[subItem.spatId] = {
                                marker: null,
                                flag: true
                            };
                            _this.crossData.sideLight[subItem.spatId].marker = new AMap.Marker({
                                position: subItem.position,
                                map: _this.aMap,
                                icon: this.dealLight(subItem),
                                spatId: subItem.spatId,
                                offset: new AMap.Pixel(-2, -5),
                                zIndex: 100
                            });
                            _this.aMap.add(_this.crossData.sideLight[subItem.spatId].marker);
                        }
                    });
                }
            }
            // 车辆
            if (this.crossData.count === 0) {
                this.crossData.count ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    _this.crossData.roadSenseCars = result.vehDataDTO;
                    let time = jsonData.time;
                    // console.log('路口1', _this.mapOne.roadSenseCars, _this.mapOne.roadSenseCars.length)
                    _this.crossData.roadSenseCars = _this.crossData.roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (_this.crossData.roadSenseCars.length > 0) {
                        _this.crossData.roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.crossData.sideVehicleObj) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.crossData.roadSenseCars.length; i++) {
                                if (id === _this.crossData.roadSenseCars[i].vehicleId) {
                                    if ( _this.crossData.sideVehicleObj[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.crossData.sideVehicleObj[id].marker.hide();
                                _this.crossData.sideVehicleObj[id].flag = false;
                            }
                        }
                        // 开始打点
                        _this.crossData.roadSenseCars.forEach((subItem, subIndex, subArr) => {
                            _this.crossData.count ++;
                            if ( _this.crossData.sideVehicleObj[subItem.vehicleId]) {
                                let sideCar =  _this.crossData.sideVehicleObj[subItem.vehicleId];
                                if (sideCar.flag) {
                                    // console.log('zhiqian', new Date().getTime());
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.moveTo(subItem.position, subItem.speed);
                                    // console.log('vehicleId', subItem.vehicleId);
                                    // console.log('时间', time);
                                    // console.log('当前时间', new Date().getTime());
                                } else {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.setPosition(subItem.position);
                                    sideCar.marker.show();
                                    _this.crossData.sideVehicleObj[subItem.vehicleId].flag = true;
                                }
                            } else {
                                // 新的
                                 _this.crossData.sideVehicleObj[subItem.vehicleId] = {
                                    marker: null,
                                    flag: true
                                };
                                 _this.crossData.sideVehicleObj[subItem.vehicleId].marker = new AMap.Marker({
                                    position: subItem.position,
                                    map:  _this.aMap,
                                    icon: 'static/images/road/car.png',
                                    angle: subItem.heading,
                                    devId: subItem.devId,
                                    // offset: new AMap.Pixel(-15, -10),
                                    zIndex: 1
                                });
                                _this.aMap.add( _this.crossData.sideVehicleObj[subItem.vehicleId].marker);
                            }
                            if (subIndex === subArr.length - 1) {
                                setTimeout(() => {
                                        _this.crossData.count = 0;
                                }, 0);
                            }
                        });
                    }  else {
                        // 返回的数据为空
                        this.crossData.count = 0; 
                        for (let i in _this.crossData.sideVehicleObj)  {
                            if ( _this.crossData.sideVehicleObj[i]) {
                                _this.crossData.sideVehicleObj[i].marker.hide();
                                _this.crossData.sideVehicleObj[i].flag = false;
                            }
                        }
                    }
                }
            }
        },
        onClose(data){
            console.log("结束连接");
        },
        onOpen(data){
            // 获取红绿灯
            let _params = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.crossData.finalFourPosition,
                    'fuselType': 1
                }
            }
            let roadParams = JSON.stringify(_params);
            this.sendMsg(roadParams);
        },
        sendMsg(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.roadWebSocket.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 根据状态返回红，黄，绿灯
        dealLight(data) {
            if ('status' in data === true) {
                if (data.status === 'RED') {
                    return 'static/images/road/red.jpg';
                } else if (data.status === 'YELLOW') {
                    return 'static/images/road/yellow.jpg';
                } else if (data.status === 'GREEN') {
                    return 'static/images/road/green.jpg';
                }
            } else {
                return 'static/images/road/green.jpg';
            }
            
        },
    },
    destroyed(){
        this.roadWebSocket.close();
    }
}
</script>
<style lang="scss">
.road-scan {
    display: block;
    height: 100%;
    width: 100%;
}
</style>