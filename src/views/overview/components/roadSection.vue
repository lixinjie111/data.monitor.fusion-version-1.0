<template>
  <div>
    <div :id="id" class="road-scan"></div>
  </div>
</template>
<script>
    export default {
        props: {
            id: String,
            mapData: Object
        },
        data() {
            return {
                aMap: null,
                wms: {},
                mapRoadData: this.mapData,
                crossData: {
                    roadLights: [], // 红绿灯数据
                    roadSenseCars: [], // 车辆数据
                    finalFourPosition: [],
                    sideVehicleObj: {}, // 地图上画车辆
                    sideLight: {} //
                },
                mapPointData: [],
                roadWebSocket: null,
                carWebSocket: null,
                prevData: {},
                platformConnectCount:0,
                spatConnectCount:0
            };
        },
        mounted() {
//    this.mapOption.mapStyle=window.mapOption.mapStyleEmpty;
            let _optionWms = Object.assign({},window.mapOption,
                {
                    zoom: 18,
                    dragEnable: false
                }
            );
            this.aMap = new AMap.Map(this.id, _optionWms);
            this.aMap.on('complete',()=>{
                this.aMap.setMapStyle(window.mapOption.mapStyleEmpty);
            });
            this.drawRoadMap();
        },
        methods: {
            drawRoadMap() {
                let position = new AMap.LngLat(
                    this.mapRoadData.longitude,
                    this.mapRoadData.latitude
                );
                let lng = this.mapRoadData.longitude;
                let lat = this.mapRoadData.latitude;
                let _optionWms = Object.assign({},window.dlWmsDefaultOption,
                    {
                        params:{'LAYERS': window.dlWmsOption.LAYERS_gjlk, 'VERSION': window.dlWmsOption.VERSION}
                    }
                );
                this.wms = new AMap.TileLayer.WMS(_optionWms);
                this.wms.setMap(this.aMap);
                this.aMap.setCenter(position);
                this.aMap.setStatus({zoomEnable:false});
                // this.aMap.setZoom(18);
                this.getFourPosition();
                this.initWebsocket();
                this.initCarWebsocket();
            },
            // 获取四周的经纬度
            getFourPosition() {
                let currentExtend = this.getExtend(this.mapRoadData.longitude, this.mapRoadData.latitude,0.001);
                this.crossData.finalFourPosition = currentExtend;
//                let marker11 = new AMap.Marker({
//                    position:  currentExtend[0],
//                    map: this.aMap,
//                    icon: "static/images/road/side.png",
//                    zIndex: 1
//                });
//                let marker22 = new AMap.Marker({
//                    position: currentExtend[1],
//                    map: this.aMap,
//                    icon: "static/images/road/side.png",
//                    zIndex: 1
//                });
//                let marker33 = new AMap.Marker({
//                    position: currentExtend[2],
//                    map: this.aMap,
//                    icon: "static/images/road/side.png",
//                    zIndex: 1
//                });
//                let marker44 = new AMap.Marker({
//                    position: currentExtend[3],
//                    map: this.aMap,
//                    icon: "static/images/road/side.png",
//                    zIndex: 1
//                });

                // this.initWebsocket();
                // this.initCarWebsocket();
            },

            getExtend(x,y,r){
                let currentExtent=[];
                let x0=x+r;
                let y0=y+r;
                let x1=x-r;
                let y1=y-r;
                currentExtent.push([x1, y0]);
                currentExtent.push([x0, y0]);
                currentExtent.push([x0, y1]);
                currentExtent.push([x1, y1]);
                return currentExtent;
            },

            // 获取平台车
            initCarWebsocket() {
                let _this = this;
                try{
                    if ("WebSocket" in window) {
                        _this.carWebSocket = new WebSocket(window.config.websocketUrl); //获得WebSocket对象
                        _this.carWebSocket.onmessage = _this.onCarMessage;
                        _this.carWebSocket.onclose = _this.onCarClose;
                        _this.carWebSocket.onopen = _this.onCarOpen;
                        _this.carWebSocket.onerror = _this.onCarError;
                    }else{
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.carReconnect();
                }
            },
            onCarMessage(message) {
                let _this = this;
                let jsonData = JSON.parse(message.data);
                let result = jsonData.result;
                // 车辆
                if ("vehDataDTO" in result === true) {
                    _this.crossData.roadSenseCars = result.vehDataDTO;
                    if (_this.crossData.roadSenseCars.length > 0) {
                        _this.crossData.roadSenseCars = _this.crossData.roadSenseCars.filter(
                            x => x.targetType === 2 || x.targetType === 5
                        );
                        // console.log('_this.crossData.roadSenseCars', _this.crossData.roadSenseCars);
                        let _filterData = {};
                        _this.crossData.roadSenseCars.forEach((item, index) => {
                            _filterData[item.vehicleId] = {
                                longitude: item.longitude,
                                latitude: item.latitude,
                                heading: item.heading,
                                speed: item.speed,
                                vehicleId: item.vehicleId,
                                devId: item.devId,
                                marker: null,
                                plateNo:item.plateNo
                            };
                        });

                        for (let id in _this.prevData) {
                            if(_filterData[id]) {   //表示有该点，做move
                                _filterData[id].marker = _this.prevData[id].marker;
                                let _currentCar = _filterData[id];
                                _filterData[id].marker.setAngle(_currentCar.heading);
//                            _filterData[id].marker.moveTo([_currentCar.longitude, _currentCar.latitude], _currentCar.speed);

                                _filterData[id].marker.setPosition([_currentCar.longitude, _currentCar.latitude]);
//                            if(_filterData[id].vehicleId=='B21E0005'){
//                                console.log("沪A523456-----"+_filterData[id].plateNo);
//                                let marker =  new AMap.Marker({
//                                    position:  [_currentCar.longitude, _currentCar.latitude],
//                                    map: this.aMap,
//                                    icon: "static/images/road/side.png",
//                                    zIndex: 1
//                                });
//                            }
                            } else {   //表示没有该点，做remove
//                            _this.prevData[id].marker.stopMove();
                                _this.aMap.remove(_this.prevData[id].marker);
                                delete _this.prevData[id];
                            }
                        }
                        for (let id in _filterData) {
                            if(!_this.prevData[id]) {   //表示新增该点，做add
                                _filterData[id].marker = new AMap.Marker({
                                    position: [_filterData[id].longitude, _filterData[id].latitude],
                                    map: _this.aMap,
                                    icon: "static/images/road/car.png",
                                    angle: _filterData[id].heading,
                                    devId: _filterData[id].devId,
                                    offset:new AMap.Pixel(-4, -9),
                                    zIndex: 1
                                });
                            }
                        }

                        _this.prevData = _filterData;

                    } else {
                        // 返回的数据为空
                        for (let id in _this.prevData) {
                            _this.prevData[id].marker.stopMove();
                            _this.aMap.remove(_this.prevData[id].marker);
                            delete _this.prevData[id];
                        }
                    }
                }
            },
            onCarClose(data) {
                console.log("平台车结束连接");
                this.carReconnect();
            },
            onCarError(data) {
                console.log("平台车连接error");
                this.carReconnect();
            },
            onCarOpen(data) {
                // 获取红绿灯
                let _params = {
                    action: "road_real_data_reg",
                    data: {
                        polygon: this.crossData.finalFourPosition,
                        fuselType: 1
                    }
                };
                let carParams = JSON.stringify(_params);
                this.sendCarMsg(carParams);
            },
            sendCarMsg(msg) {
                let _this = this;
                if (window.WebSocket) {
                    if (_this.carWebSocket.readyState == WebSocket.OPEN) {
                        //如果WebSocket是打开状态
                        _this.carWebSocket.send(msg); //send()发送消息
                    }
                } else {
                    return;
                }
            },
            carReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.platformConnectCount>=10){
                    return;
                }
                this.initCarWebsocket();
                //重连不能超过5次
                this.platformConnectCount++;
            },


            // 获取红绿灯
            initWebsocket() {
                let _this = this;
                try{
                    if ("WebSocket" in window) {
                        _this.roadWebSocket = new WebSocket(window.config.websocketUrl); //获得WebSocket对象
                        _this.roadWebSocket.onmessage = _this.onMessage;
                        _this.roadWebSocket.onclose = _this.onClose;
                        _this.roadWebSocket.onopen = _this.onOpen;
                        _this.roadWebSocket.onerror = _this.onError;
                    }else{
                        _this.$message("此浏览器不支持websocket");
                    }
                }catch (e){
                    this.spatReconnect();
                }
            },
            onMessage(message) {
                let _this = this;
                let jsonData = JSON.parse(message.data);
                let result = jsonData.result;
                let lightPosition;
                if ("spatDataDTO" in result === true) {
                    _this.crossData.roadLights = result.spatDataDTO;
                    if (_this.crossData.roadLights.length > 0) {
                        // _this.crossData.roadLights.map((x, index) => {
                        //   lightPosition = new AMap.LngLat(
                        //     x.position.longitude,
                        //     x.position.latitude
                        //   );
                        //   _this.crossData.roadLights[index].position = lightPosition;
                        // });
                        for (let id in _this.crossData.sideLight) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.crossData.roadLights.length; i++) {
                                if (id === _this.crossData.roadLights[i].spatId) {
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
                                _this.crossData.sideLight[
                                    subItem.spatId
                                    ].marker = new AMap.Marker({
                                    position: [subItem.position.longitude, subItem.position.latitude],
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
            },
            onClose(data) {
                console.log("红绿灯结束连接");
                this.spatReconnect();
            },
            onError(){
                console.log("红绿灯连接error");
                this.spatReconnect();
            },
            onOpen(data) {
                // 获取红绿灯
                let _params = {
                    action: "road_real_data_spat",
                    data: {
                        polygon: this.crossData.finalFourPosition,
                        fuselType: 1
                    }
                };
                let roadParams = JSON.stringify(_params);
                this.sendMsg(roadParams);
            },
            sendMsg(msg) {
                let _this = this;
                if (window.WebSocket) {
                    if (_this.roadWebSocket.readyState == WebSocket.OPEN) {
                        //如果WebSocket是打开状态
                        _this.roadWebSocket.send(msg); //send()发送消息
                    }
                } else {
                    return;
                }
            },
            spatReconnect(){
                //实例销毁后不进行重连
                if(this._isDestroyed){
                    return;
                }
                //重连不能超过10次
                if(this.spatConnectCount>=10){
                    return;
                }
                this.initWebsocket();
                //重连不能超过5次
                this.spatConnectCount++;
            },



            // 根据状态返回红，黄，绿灯
            dealLight(data) {
                if ("status" in data === true) {
                    if (data.status === "RED") {
                        return "static/images/road/red.jpg";
                    } else if (data.status === "YELLOW") {
                        return "static/images/road/yellow.jpg";
                    } else if (data.status === "GREEN") {
                        return "static/images/road/green.jpg";
                    }
                } else {
                    return "static/images/road/green.jpg";
                }
            }
        },
        destroyed() {
            this.roadWebSocket&&this.roadWebSocket.close();
            this.carWebSocket&&this.carWebSocket.close();
        }
    };
</script>
<style lang="scss">
  .road-scan {
    display: block;
    height: 100%;
    width: 100%;
  }
</style>