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
                spatConnectCount:0,
                messageCount:0,
                messageTime:null
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
                let data = result.vehDataDTO;
                if(data.length>0){
//                    console.log(data[0].gpsTime+".........");
                    let flag = false;
                    for(let i=0;i<data.length;i++){
                        let id = data[i].vehicleId;
                        if(_this.prevData[id]){
                            if(_this.prevData[id].gpsTime>=data[i].gpsTime){
//                                console.log(id+"---车辆数据到达错误！")
                                flag=true;
                                break;
                            }
                        }
                    }
                    if(flag){
                        return;
                    }

                }
                clearInterval(_this.messageTime);
                _this.messageCount=0;
                _this.messageTime = setInterval(()=>{
                    _this.messageCount++;
//                    console.log(_this.messageCount);
                    if(_this.messageCount==3){
                        clearInterval(_this.messageTime);
                        return;
                    }
                    _this.predictMove();
                },1000)
                // 车辆
                if ("vehDataDTO" in result === true) {
                    _this.crossData.roadSenseCars = data;
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
                                plateNo:item.plateNo,
                                gpsTime:item.gpsTime
                            };
                        });

                        for (let id in _this.prevData) {
                            if(_filterData[id]) {   //表示有该点，做move
                                _filterData[id].marker = _this.prevData[id].marker;
                                _filterData[id].marker.setAngle(_filterData[id].heading);
                                //计算速度AMap.GeometryUtil.distance(p1, p2);
                                let p1 =  new AMap.LngLat(_filterData[id].longitude,_filterData[id].latitude);
                                let time1 = _filterData[id].gpsTime;
                                let p2 ;
                                let time2;
                                let item = _this.prevData[id];//上一个点
//                                    console.log(item.gpsTime+"--------")
                                p2 = new AMap.LngLat(item.longitude,item.latitude);
                                time2 = item.gpsTime;
                                let distance = AMap.GeometryUtil.distance(p1, p2);
                                let t = Math.abs(time1-time2)/1000;
                                let speed = (distance/t*3.6);
//                                    console.log("speed:"+speed);
                                _filterData[id].marker.setPosition(p2);
                                _filterData[id].marker.moveTo([_filterData[id].longitude, _filterData[id].latitude], speed);
                                _filterData[id].distance = distance;
                                _filterData[id].speed = speed;
//                                    _filterData[id].marker.setPosition([_currentCar.longitude, _currentCar.latitude]);
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
                                _this.prevData[id].marker.stopMove();
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
                            _filterData[id].distance = 16;
                            _filterData[id].speed = 55;
                        }

                        _this.prevData = _filterData;
//                        console.log(_this.prevData)

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
            getNextPosition(distance,p1,heading){
                let lng0 = p1.lng;
                let lat0 = p1.lat;
                let lng;
                let lat;
                //y1=y0
                if(heading==90){
                    //tan@=x1-x0/y1-y0    (x1-x0)2+(y1-y0)2 = d2
                    lng = lng0+(distance/108000);
                    lat = lat0;
                    return;
                }
                if(heading==270){
                    //tan@=x1-x0/y1-y0    (x1-x0)2+(y1-y0)2 = d2
                    lng = lng0;
                    lat = lat0-(distance/108000);
                    return;
                }

                let d = (distance/108000)*(distance/108000);
                let e = Math.tan(heading)*Math.tan(heading)+1;

                lng = Math.sqrt(d/e)+lng0;
                lat = lat0+Math.tan(heading)*(lng-lng0);
                let position = new AMap.LngLat(lng,lat);
                let marker = new AMap.Marker({
                    position: position,
                    map: this.aMap,
                    icon: "static/images/road/side.png",
                    angle: heading,
                    offset:new AMap.Pixel(-4, -9),
                    zIndex: 1
                });
                return position;
            },
            predictMove(){
                let _this = this;
                let prevData={
                    distance: 16,
                    heading: 265.27497921635324,
                    latitude: 31.282431364646282,
                    longitude: 121.16241199121829,
                    plateNo: "仿A523456",
                    speed: 55,
                    vehicleId: "B21E0005"
                }
                for (let id in prevData) {
                    //上一个点
                    let p2 = new AMap.LngLat(prevData[id].longitude,prevData[id].latitude)
                    let time2 = prevData[id].gpsTime;

                    let heading = prevData[id].heading;
                    //此次的点
                    let p1 = _this.getNextPosition(prevData[id].distance,p2,heading);
                    console.log(id,prevData[id].heading);
                    //预判的速度
                    let speed = prevData[id].speed;
                    prevData[id].marker.setPosition(p2);
                    prevData[id].marker.moveTo([p1.lng, p1.lat], speed);
                    prevData[id].longitude = p1.lng;
                    prevData[id].latitude = p1.lat;

                }
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