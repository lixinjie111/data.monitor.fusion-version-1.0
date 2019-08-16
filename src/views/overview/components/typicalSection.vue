<template>
    <div class="fusion-right-style">
        <div class="right-road">
            <div class="perception-road" @click="showRoadDetail(1)">
                <div class="road-word" >
                    <p>{{mapOne.cross.name}}</p>
                </div>
                <div id="map1" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(2)">
                <div class="road-word">
                    <p>{{mapTwo.cross.name}}</p>
                </div>
                <div id="map2" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(3)">
                <div class="road-word" >
                    <p>{{mapThree.cross.name}}</p>
                </div>
                <div id="map3" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(4)">
                <div  class="road-word">
                    <p>{{mapFour.cross.name}}</p>
                </div>
                <div id="map4" class="cross-scan"></div>
            </div>
          </div>
      </div>
</template>
<script>
import {typeCross, getTypicalRoadData, getTypeRoadData} from '@/api/overview/index.js';
import ConvertCoord from '@/assets/js/coordConvert.js';
export default {
    data() {
        return {
            wms: {},
            mapOne: {
                type: 1,
                map: {},  // 地图元素
                cross: {}, // 路段名称 
                position: {}, // 中心位置
                roadLights: [], // 红绿灯数据
                roadSenseCars: [], // 车辆数据
                roadWebSocket: {}, // websocket对象
                finalFourPosition: [],
                count: 0, // 计数
                sideVehicleObj: {}, // 地图上画车辆
                sideLight: {} // 地图上红绿灯
                
            },
            mapTwo: {
                type: 2,
                map: {},  // 地图元素
                cross: {}, // 路段名称 
                position: {}, // 中心位置 
                roadWebSocket: {},
                roadLights: [], // 红绿灯数据
                roadSenseCars: [], // 车辆数据
                finalFourPosition: [],
                count: 0, // 计数
                sideVehicleObj: {}, // 地图上画车辆
                sideLight: {} // 地图上红绿灯
            },
            mapThree: {
                type: 3,
                map: {},  // 地图元素
                cross: {}, // 路段名称
                position: {},  // 中心位置
                roadWebSocket: {},
                roadLights: [], // 红绿灯数据
                roadSenseCars: [], // 车辆数据
                finalFourPosition: [],
                count: 0, // 计数
                sideVehicleObj: {}, // 地图上画车辆
                sideLight: {} // 地图上红绿灯
            },
            mapFour: {
                type: 4,
                map: {},  // 地图元素
                cross: {}, // 路段名称
                position: {},  // 中心位置
                roadWebSocket: {},
                roadLights: [], // 红绿灯数据
                roadSenseCars: [], // 车辆数据
                finalFourPosition: [], // 四个方向角
                count: 0, // 计数
                sideVehicleObj: {}, // 地图上画车辆
                sideLight: {} // 地图上红绿灯
            },
            mapOption:{
                resizeEnable: true,
                zoom: 18,
                mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
            }
        }
    },
    mounted() {
            // this.map1 = new AMap.Map('map1', this.mapOption);
            // this.map2 = new AMap.Map('map2', this.mapOption);
            // this.map3 = new AMap.Map('map3', this.mapOption);
            // this.map4 = new AMap.Map('map4', this.mapOption);
            this.mapOne.map = new AMap.Map('map1', this.mapOption);
            this.mapTwo.map = new AMap.Map('map2', this.mapOption);
            this.mapThree.map = new AMap.Map('map3', this.mapOption);
            this.mapFour.map= new AMap.Map('map4', this.mapOption);
            this.fetchTypicalRoad();
    },
    methods: {
        // 点击路口路由跳转到具体的路口详情
        showRoadDetail(num) {
            if (num === 1) {
                this.$router.push({
                    path: '/perception/' + this.mapOne.cross.longitude + "/" + this.mapOne.cross.latitude,
                });
            } else if (num === 2) {
                this.$router.push({
                    path: '/perception/' + this.mapTwo.cross.longitude + "/" + this.mapTwo.cross.latitude,
                });
            } else if (num === 3) {
                this.$router.push({
                    path: '/perception/' + this.mapThree.cross.longitude+"/" + this.mapThree.cross.latitude,
                });
            } else {
                this.$router.push({
                    path: '/perception/' + this.mapFour.cross.longitude + "/" + this.mapFour.cross.latitude,
                });
            }
        },
        // queryCrossDetail(item) {
        //     var _this = this;
        //     this.dialogVisible = true;
        //     this.$emit("queryCrossDetail",item);
        // },
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
            bounds = mapOption.map.getBounds();
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
            // let mapBounds = new AMap.Bounds(southwest, northeast);
            // var rectangle = new AMap.Rectangle({
            //     bounds: mapBounds,
            //     strokeColor: 'red',
            //     strokeWeight: 6,
            //     strokeOpacity: 0.5,
            //     strokeDasharray: [30, 10],
            //     strokeStyle: 'dashed',
            //     fillOpacity:0.5,
            //     cursor:'pointer',
            //     zIndex:50,
            // });
            // rectangle.setMap(mapOption.map);
            mapOption.finalFourPosition = finalFourPosition;
            this.setWebsocketData(mapOption);
        },
        // 设置websocket
        setWebsocketData(mapOption) {
            if (mapOption.type === 1) {
                this.getRoadRunningData1(mapOption);
            } else if (mapOption.type === 2) {
                this.getRoadRunningData2(mapOption);
            } else if (mapOption.type === 3) {
                this.getRoadRunningData3(mapOption);
            } else {
                this.getRoadRunningData4(mapOption);
            }
        },
        // 设置中心点方法
        setMapCenter(mapOption) {
            // setMap设置图层所属的地图对象
            this.wms.setMap(mapOption.map);
            // 设置中心点（地图的经纬度）
            mapOption.map.setCenter(mapOption.position);
            // 设置缩放级别
            mapOption.map.setZoom(18);
            // 路口1实时数据
            this.getFourPosition(mapOption);
        },
        // 四个点坐标转为经纬度
        fetchTypicalRoad() {
            getTypicalRoadData().then(res => {
                let result = res.data;
                let position; // 位置
                // let wms;
                result.forEach((x, index) => {
                    position = new AMap.LngLat(x.longitude, x.latitude);
                    this.wms  = new AMap.TileLayer.WMS({
                        url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
                        blend: false,
                        tileSize: 256,
                        params:{'LAYERS': 'shanghai_qcc:dl_shcsq_wgs84_gjlk',VERSION:'1.1.0'}
                    });
                    if (index === 0) {
                        this.mapOne.cross = result[index];
                        this.mapOne.position = position;
                        this.setMapCenter(this.mapOne);
                    } else if (index === 1) {
                        this.mapTwo.cross = result[index];
                        this.mapTwo.position = position;
                        this.setMapCenter(this.mapTwo);
                    } else if (index === 2) {
                        this.mapThree.cross = result[index];
                        this.mapThree.position = position;
                        this.setMapCenter(this.mapThree);
                    } else if (index == 3) {
                        this.mapFour.cross = result[index];
                        this.mapFour.position = position;
                        this.setMapCenter(this.mapFour);
                    }
                });
            })
        },

        // 第一个路段
        getRoadRunningData1(mapOption) {
            let _this = this;
            if ('WebSocket' in window) {
                mapOption.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            mapOption.roadWebSocket.onmessage = _this.onRoadMessage1;
            mapOption.roadWebSocket.onclose = _this.onRoadClose1;
            mapOption.roadWebSocket.onopen = _this.onRoadOpen1;
            mapOption.roadWebSocket.onerror = _this.onRoadError1;
        },
        onRoadMessage1(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let roadLights;
            let roadSenseCars;
            let lightPosition;
            let carPosition;
            if ('spatDataDTO' in result === true) {
                _this.mapOne.roadLights = result.spatDataDTO;
               _this.mapOne.roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                    _this.mapOne.roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < _this.mapOne.roadLights.length; i++) {
                    let _data = _this.mapOne.roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map1,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.mapOne.map.add(marker);
                        // _this.map1LightList.push(marker);
                    }
                }
            }
            // 车辆
            if (this.mapOne.count === 0) {
                this.mapOne.count ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    _this.mapOne.roadSenseCars = result.vehDataDTO;
                    _this.mapOne.roadSenseCars = _this.mapOne.roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (_this.mapOne.roadSenseCars.length > 0) {
                        _this.mapOne.roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.mapOne.sideVehicleObj) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.mapOne.roadSenseCars.length; i++) {
                                if (id === _this.mapOne.roadSenseCars[i].vehicleId) {
                                    if ( _this.mapOne.sideVehicleObj[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                 _this.mapOne.sideVehicleObj[id].marker.hide();
                                 _this.mapOne.sideVehicleObj[id].flag = false;
                            }
                        }
                        // 开始打点
                        _this.mapOne.roadSenseCars.forEach((subItem, subIndex, subArr) => {
                            if ( _this.mapOne.sideVehicleObj[subItem.vehicleId]) {
                                let sideCar =  _this.mapOne.sideVehicleObj[subItem.vehicleId];
                                if (sideCar.flag) {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.moveTo(subItem.position, subItem.speed);
                                } else {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.setPosition(subItem.position);
                                    sideCar.marker.show();
                                     _this.mapOne.sideVehicleObj[subItem.vehicleId].flag = true;
                                }
                            } else {
                                // 新的
                                 _this.mapOne.sideVehicleObj[subItem.vehicleId] = {
                                    marker: null,
                                    flag: true
                                };
                                 _this.mapOne.sideVehicleObj[subItem.vehicleId].marker = new AMap.Marker({
                                    position: subItem.position,
                                    map:  _this.mapOne.map,
                                    icon: 'static/images/road/car.png',
                                    angle: subItem.heading,
                                    devId: subItem.devId,
                                    // offset: new AMap.Pixel(-15, -10),
                                    zIndex: 1
                                });
                                _this.mapOne.map.add( _this.mapOne.sideVehicleObj[subItem.vehicleId].marker);
                            }
                            if (subIndex === subArr.length - 1) {
                                setTimeout(() => {
                                        _this.mapOne.count = 0;
                                }, 0);
                            }
                        });
                    }  else {
                        // 返回的数据为空
                        this.mapOne.count = 0; 
                        for (let i in _this.mapOne.sideVehicleObj)  {
                            if ( _this.mapOne.sideVehicleObj[i]) {
                                _this.mapOne.sideVehicleObj[i].marker.hide();
                                _this.mapOne.sideVehicleObj[i].flag = false;
                            }
                        }
                    }
                }
            }
        },
        onRoadClose1(data){
            console.log("结束连接");
        },
        onRoadOpen1(data){
            // 获取红绿灯
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.mapOne.finalFourPosition,
                    'fuselType': 1
                }
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg1(roadStr);
        },
        sendRoadMsg1(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.mapOne.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.mapOne.roadWebSocket.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第二个路段
        getRoadRunningData2(mapOption) {
            let _this = this;
            if ('WebSocket' in window) {
                mapOption.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            mapOption.roadWebSocket.onmessage = _this.onRoadMessage2;
            mapOption.roadWebSocket.onclose = _this.onRoadClose2;
            mapOption.roadWebSocket.onopen = _this.onRoadOpen2;
            mapOption.roadWebSocket.onerror = _this.onRoadError2;
        },
        onRoadMessage2(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            // let roadLights;
            // let roadSenseCars;
            let lightPosition;
            let carPosition;
            // 红绿灯
            if ('spatDataDTO' in result === true) {
                _this.mapTwo.roadLights = result.spatDataDTO;
                if ( _this.mapTwo.roadLights.length > 0) {
                    _this.mapTwo.roadLights.map((x, index) => {
                        lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                        _this.mapTwo.roadLights[index].position = lightPosition;
                    });
                    for (let id in _this.mapTwo.sideLight) {
                        let flag = false;
                        // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                        for (let i = 0; i <  _this.mapTwo.roadLights.length; i++) {
                            if (id ===  _this.mapTwo.roadLights[i].spatId) {
                                if (_this.mapTwo.sideLight[id].flag) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        // 不存在时，隐藏掉
                        if (!flag) {
                            _this.mapTwo.sideLight[id].flag = false;
                        }
                    }
                    // 开始打点
                    _this.mapTwo.roadLights.forEach((subItem, subIndex, subArr) => {
                        if (_this.mapTwo.sideLight[subItem.spatId]) {
                            let roadLig = _this.mapTwo.sideLight[subItem.spatId];
                            roadLig.marker.setIcon(this.dealLight(subItem));
                        } else {
                            // 新的
                            _this.mapTwo.sideLight[subItem.spatId] = {
                                marker: null,
                                flag: true
                            };
                            _this.mapTwo.sideLight[subItem.spatId].marker = new AMap.Marker({
                                position: subItem.position,
                                map: _this.mapTwo.map,
                                icon: this.dealLight(subItem),
                                spatId: subItem.spatId,
                                offset: new AMap.Pixel(-2, -5),
                                zIndex: 100
                            });
                            this.mapTwo.map.add(_this.mapTwo.sideLight[subItem.spatId].marker);
                        }
                    });
                }
            }
            if (this.mapTwo.count === 0) {
                this.mapTwo.count ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    _this.mapTwo.roadSenseCars = result.vehDataDTO;
                    _this.mapTwo.roadSenseCars = _this.mapTwo.roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (_this.mapTwo.roadSenseCars.length > 0) {
                        _this.mapTwo.roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.mapTwo.sideVehicleObj) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.mapTwo.roadSenseCars.length; i++) {
                                if (id === _this.mapTwo.roadSenseCars[i].vehicleId) {
                                    if (_this.mapTwo.sideVehicleObj[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.mapTwo.sideVehicleObj[id].marker.hide();
                                _this.mapTwo.sideVehicleObj[id].flag = false;
                            }
                        }
                        // 开始打点
                        _this.mapTwo.roadSenseCars.forEach((subItem, subIndex, subArr) => {
                            if (_this.mapTwo.sideVehicleObj[subItem.vehicleId]) {
                                let sideCar =_this.mapTwo.sideVehicleObj[subItem.vehicleId];
                                if (sideCar.flag) {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.moveTo(subItem.position, subItem.speed);
                                } else {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.setPosition(subItem.position);
                                    sideCar.marker.show();
                                    _this.mapTwo.sideVehicleObj[subItem.vehicleId].flag = true;
                                }
                            } else {
                                // 新的
                                _this.mapTwo.sideVehicleObj[subItem.vehicleId] = {
                                    marker: null,
                                    flag: true
                                };
                                _this.mapTwo.sideVehicleObj[subItem.vehicleId].marker = new AMap.Marker({
                                    position: subItem.position,
                                    map: _this.mapTwo.map,
                                    icon: 'static/images/road/car.png',
                                    angle: subItem.heading,
                                    devId: subItem.devId,
                                    // offset: new AMap.Pixel(-15, -10),
                                    zIndex: 1
                                });
                                _this.mapTwo.map.add(_this.mapTwo.sideVehicleObj[subItem.vehicleId].marker);
                            }
                            if (subIndex === subArr.length - 1) {
                                setTimeout(() => {
                                        _this.mapTwo.count = 0;
                                }, 0);
                            }
                        });
                    }  else {
                        // 返回的数据为空
                        this.mapTwo.count2 = 0; 
                        for (let i in _this.mapTwo.sideVehicleObj)  {
                            if (_this.mapTwo.sideVehicleObj[i]) {
                                _this.mapTwo.sideVehicleObj[i].marker.hide();
                                _this.mapTwo.sideVehicleObj[i].flag = false;
                            }
                        }
                    }
                }
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
        onRoadClose2(data){
            console.log("结束连接");
        },
        onRoadOpen2(data){
            // 获取红绿灯
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.mapTwo.finalFourPosition,
                    'fuselType': 1
                } 
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg2(roadStr);
        },
        sendRoadMsg2(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.mapTwo.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.mapTwo.roadWebSocket.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第三个路段
        getRoadRunningData3(mapOption) {
            let _this = this;
            if ('WebSocket' in window) {
                mapOption.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            mapOption.roadWebSocket.onmessage = _this.onRoadMessage3;
            mapOption.roadWebSocket.onclose = _this.onRoadClose3;
            mapOption.roadWebSocket.onopen = _this.onRoadOpen3;
            mapOption.roadWebSocket.onerror = _this.onRoadError3;
        },
        onRoadMessage3(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let lightPosition;
            let carPosition;
             if ('spatDataDTO' in result === true) {
                _this.mapThree.roadLights = result.spatDataDTO;
                if ( _this.mapThree.roadLights.length > 0) {
                    _this.mapThree.roadLights.map((x, index) => {
                        lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                        _this.mapThree.roadLights[index].position = lightPosition;
                    });
                    for (let id in _this.mapThree.sideLight) {
                        let flag = false;
                        // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                        for (let i = 0; i <  _this.mapThree.roadLights.length; i++) {
                            if (id ===  _this.mapThree.roadLights[i].spatId) {
                                if (_this.mapThree.sideLight[id].flag) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        // 不存在时，隐藏掉
                        if (!flag) {
                            _this.mapThree.sideLight[id].flag = false;
                        }
                    }
                    // 开始打点
                    _this.mapThree.roadLights.forEach((subItem, subIndex, subArr) => {
                        if (_this.mapThree.sideLight[subItem.spatId]) {
                            let roadLig = _this.mapThree.sideLight[subItem.spatId];
                            roadLig.marker.setIcon(this.dealLight(subItem));
                        } else {
                            // 新的
                            _this.mapThree.sideLight[subItem.spatId] = {
                                marker: null,
                                flag: true
                            };
                            _this.mapThree.sideLight[subItem.spatId].marker = new AMap.Marker({
                                position: subItem.position,
                                map: _this.mapThree.map,
                                icon: this.dealLight(subItem),
                                spatId: subItem.spatId,
                                offset: new AMap.Pixel(-2, -5),
                                zIndex: 100
                            });
                            this.mapThree.map.add(_this.mapThree.sideLight[subItem.spatId].marker);
                        }
                    });
                }
            }
            // 车辆
            if (this.mapThree.count === 0) {
                this.mapThree.count ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    _this.mapThree.roadSenseCars = result.vehDataDTO;
                    _this.mapThree.roadSenseCars = _this.mapThree.roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (_this.mapThree.roadSenseCars.length > 0) {
                        _this.mapThree.roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.mapThree.sideVehicleObj) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.mapThree.roadSenseCars.length; i++) {
                                if (id === _this.mapThree.roadSenseCars[i].vehicleId) {
                                    if (_this.mapThree.sideVehicleObj[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.mapThree.sideVehicleObj[id].marker.hide();
                                _this.mapThree.sideVehicleObj[id].flag = false;
                            }
                        }
                    // 开始打点
                        _this.mapThree.roadSenseCars.forEach((item, index, arr) => {
                            _this.mapThree.count ++;
                            if (_this.mapThree.count === arr.length + 1) {
                                _this.mapThree.roadSenseCars.forEach((subItem, subIndex, subArr) => {
                                if (_this.mapThree.sideVehicleObj[subItem.vehicleId]) {
                                    let sideCar = _this.mapThree.sideVehicleObj[subItem.vehicleId];
                                    // 已有的，moveto
                                    if (sideCar.flag) {
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.moveTo(subItem.position, subItem.speed);
                                    } else {
                                        // 之前hide，然后show的
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.setPosition(subItem.position);
                                        sideCar.marker.show();
                                       _this.mapThree.sideVehicleObj[subItem.vehicleId].flag = true;
                                    }
                                } else {
                                    // 新的
                                    _this.mapThree.sideVehicleObj[subItem.vehicleId] = {
                                        marker: null,
                                        flag: true
                                    };
                                    _this.mapThree.sideVehicleObj[subItem.vehicleId].marker = new AMap.Marker({
                                        position: subItem.position,
                                        map: _this.mapThree.map,
                                        icon: 'static/images/road/car.png',
                                        angle: subItem.heading,
                                        devId: subItem.devId,
                                        // offset: new AMap.Pixel(-15, -10),
                                        zIndex: 1
                                    });
                                    _this.mapThree.map.add(_this.mapThree.sideVehicleObj[subItem.vehicleId].marker); 
                                    }
                                    if (subIndex === subArr.length - 1) {
                                        setTimeout(() => {
                                            _this.mapThree.count = 0;
                                        }, 0);
                                    }
                                });
                            }
                        });
                    } else {
                        this.mapThree.count = 0;
                        for (let i in _this.mapThree.sideVehicleObj)  {
                            if (_this.mapThree.sideVehicleObj[i]) {
                                _this.mapThree.sideVehicleObj[i].marker.hide();
                                _this.mapThree.sideVehicleObj[i].flag = false;
                            }
                        }
                    }
                    
                }
            }
        },
        onRoadClose3(data){
            console.log("结束连接");
        },
        onRoadOpen3(data){
            // 获取红绿灯
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.mapThree.finalFourPosition,
                    'fuselType': 1
                }
               
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg3(roadStr);
        },
        sendRoadMsg3(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.mapThree.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.mapThree.roadWebSocket.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第四个路段
        getRoadRunningData4(mapOption) {
            let _this = this;
            if ('WebSocket' in window) {
                mapOption.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            mapOption.roadWebSocket.onmessage = _this.onRoadMessage4;
            mapOption.roadWebSocket.onclose = _this.onRoadClose4;
            mapOption.roadWebSocket.onopen = _this.onRoadOpen4;
            mapOption.roadWebSocket.onerror = _this.onRoadError4;
        },
        onRoadMessage4(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let lightPosition;
            let carPosition;
            if ('spatDataDTO' in result === true) {
                _this.mapFour.roadLights = result.spatDataDTO;
                 _this.mapFour.roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                     _this.mapFour.roadLights[index].position = lightPosition;
                });
                for (let i = 0; i <  _this.mapFour.roadLights.length; i++) {
                    let _data = _this.mapFour. roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.mapFour.map,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.mapFour.map.add(marker);
                        // _this.map4LightList.push(marker);
                    }
                }
            }
            // 车辆
            if (this.mapFour.count === 0) {
                this.mapFour.count ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    _this.mapFour.roadSenseCars = result.vehDataDTO;
                    _this.mapFour.roadSenseCars = _this.mapFour.roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (_this.mapFour.roadSenseCars.length > 0) {
                        _this.mapFour.roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in this.mapFour.sideVehicleObj) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < _this.mapFour.roadSenseCars.length; i++) {
                                if (id === _this.mapFour.roadSenseCars[i].vehicleId) {
                                    if (_this.mapFour.sideVehicleObj[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.mapFour.sideVehicleObj[id].marker.hide();
                                _this.mapFour.sideVehicleObj[id].flag = false;
                            }
                        }
                    // 开始打点
                        _this.mapFour.roadSenseCars.forEach((item, index, arr) => {
                            _this.mapFour.count ++;
                            if (_this.mapFour.count === arr.length + 1) {
                                _this.mapFour.roadSenseCars.forEach((subItem, subIndex, subArr) => {
                                if (_this.mapFour.sideVehicleObj[subItem.vehicleId]) {
                                    let sideCar = _this.mapFour.sideVehicleObj[subItem.vehicleId];
                                    // 已有的，moveto
                                    if (sideCar.flag) {
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.moveTo(subItem.position, subItem.speed);
                                    } else {
                                        // 之前hide，然后show的
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.setPosition(subItem.position);
                                        sideCar.marker.show();
                                        _this.mapFour.sideVehicleObj[subItem.vehicleId].flag = true;
                                    }
                                } else {
                                    // 新的
                                    _this.mapFour.sideVehicleObj[subItem.vehicleId] = {
                                        marker: null,
                                        flag: true
                                    };
                                    _this.mapFour.sideVehicleObj[subItem.vehicleId].marker = new AMap.Marker({
                                        position: subItem.position,
                                        map: this.mapFour.map,
                                        icon: 'static/images/road/car.png',
                                        angle: subItem.heading,
                                        devId: subItem.devId,
                                        // offset: new AMap.Pixel(-15, -10),
                                        zIndex: 1
                                    });
                                    this.mapFour.map.add(_this.mapFour.sideVehicleObj[subItem.vehicleId].marker); 
                                    }
                                    if (subIndex === subArr.length - 1) {
                                        setTimeout(() => {
                                            _this.mapFour.count = 0;
                                        }, 0);
                                    }
                                });
                            }
                        });
                    } else {
                        this.count4 = 0;
                        for (let i in _this.mapFour.sideVehicleObj)  {
                            if (_this.mapFour.sideVehicleObj[i]) {
                                _this.mapFour.sideVehicleObj[i].marker.hide();
                                _this.mapFour.sideVehicleObj[i].flag = false;
                            }
                        }
                    }
                    
                }
            }
        },
        onRoadClose4(data){
            console.log("结束连接");
        },
        onRoadOpen4(data){
            // 获取红绿灯
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.mapFour.finalFourPosition,
                    'fuselType': 1
                }
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg4(roadStr);
        },
        sendRoadMsg4(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.mapFour.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.mapFour.roadWebSocket.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
    },
    destroyed(){
        //销毁Socket
        this.mapOne.roadWebSocket.close();
        this.mapTwo.roadWebSocket.close();
        this.mapThree.roadWebSocket.close();
        this.mapFour.roadWebSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
    .perception-road{
        position: relative;
        height: 176px;
        width: 315px;
        border: 1px solid #5e5970;
        padding: 5px 6px 6px 6px;
        margin-bottom: 20px;
        top:33px;
        .road-word {
            // position: relative;
            position: absolute;
            z-index: 2;
            padding-left: 7px;
        }
        .cross-scan {
          display: block;
        //   position: relative;
        //   top: -38px;
        //   bottom: 20px;
        //   left: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        //   z-index: 1;
        }
    }
    .base-info{
        padding:30px 0px ;
        text-align: center;
        .weather-icon{
            vertical-align: middle;
            padding-left: 10px;
        }
    }
    .style{
        width: 260px;
        height: 160px;
        border:4px solid #666666;
        position: absolute;
        left: 800px;
        /*top: calc(440px-160px-20px);*/
        top:260px;
        // z-index:1;
        padding-top: 5px;
        box-sizing: border-box;
        animation: move 3s linear;;

    }
    @keyframes move {
        0%{transform:translate(0,0);}
        100%{transform:translate(50px,100px);}
    }
    .style:before{
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-top:20px solid #666666;
        border-right:16px solid transparent;
        bottom: -20px;
        left:16px;

    }
</style>
