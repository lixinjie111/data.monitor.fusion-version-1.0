<template>
    <div class="fusion-right-style">
        <div class="right-road">
            <div class="perception-road" @click="showRoadDetail(1)">
                <div class="road-word" >
                    <p>{{cross1.name}}</p>
                </div>
                <div id="map1" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(2)">
                <div class="road-word">
                    <p>{{cross2.name}}</p>
                </div>
                <div id="map2" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(3)">
                <div class="road-word" >
                    <p>{{cross3.name}}</p>
                </div>
                <div id="map3" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(4)">
                <div  class="road-word">
                    <p>{{cross4.name}}</p>
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
            cross1:{},
            cross2:{},
            cross3:{},
            cross4:{},
            map1:{},
            map2:{},
            map3:{},
            map4:{},
            mapOption:{
                resizeEnable: true,
                zoom: 18,
                mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
            },
            map1List:[], // 车辆
            map2List:[],
            map3List:[],
            map4List:[],
            basicRoadData1: [],
            basicRoadData2: [],
            basicRoadData3: [],
            basicRoadData4: [],
            finalFourPosition: [],
            fourRoadLight: [],
            roadWebSocket1: {},
            roadWebSocket2: {},
            roadWebSocket3: {},
            roadWebSocket4: {},
            finalFourPosition1: [],
            finalFourPosition2: [],
            finalFourPosition3: [],
            finalFourPosition4: [],
            map1LightList: [],
            map2LightList: [],
            map3LightList: [],
            map4LightList: [],
            roadWebSocket: {},
            queryData: {
                index: null,
                params: {}
            },
            WebSocketQuery: [],
            roadLights: [
                {
                    type: 1,
                    dataList: {}
                },
                {
                    type: 2,
                    dataList: {}
                },
                {
                    type: 3,
                    dataList: {}
                },
                {
                    type: 4,
                    dataList: {}
                },
            ],
            count1: 0,
            count2: 0,
            count3: 0,
            count4: 0,
            prevData: [],
            isInit: true,
            interval: null,
            sideVehicleObj1: {},
            sideVehicleObj2: {},
            sideVehicleObj3: {},
            sideVehicleObj4: {},
        }
    },
    mounted() {
            this.map1 = new AMap.Map('map1', this.mapOption);
            this.map2 = new AMap.Map('map2', this.mapOption);
            this.map3 = new AMap.Map('map3', this.mapOption);
            this.map4 = new AMap.Map('map4', this.mapOption);
            this.fetchTypicalRoad();
    },
    methods: {
        // 点击路口路由跳转到具体的路口详情
        showRoadDetail(num) {
            if (num === 1) {
                this.$router.push({
                    path: '/perception/'+this.cross1.longitude+"/"+this.cross1.latitude,
                });
            } else if (num === 2) {
                this.$router.push({
                    path: '/perception/'+this.cross2.longitude+"/"+this.cross2.latitude,
                });
            } else if (num === 3) {
                this.$router.push({
                    path: '/perception/'+this.cross3.longitude+"/"+this.cross3.latitude,
                });
            } else {
                this.$router.push({
                    path: '/perception/'+this.cross4.longitude+"/"+this.cross4.latitude,
                });
            }
        },
        // queryCrossDetail(item) {
        //     var _this = this;
        //     this.dialogVisible = true;
        //     this.$emit("queryCrossDetail",item);
        // },
        // 获取各个路段的四个角的位置
        getPositionData(bounds, num) {
            this.finalFourPosition = [];
            let northEast = [];
            let southWest = [];
            let northWest = [];
            let southEast = [];
            let southwest;
            let northeast;
            // 西南
            southWest.push(bounds.southwest.lng);
            southWest.push(bounds.southwest.lat);
            this.finalFourPosition.push(southWest);
            // 西北
            northWest.push(bounds.southwest.lng);
            northWest.push(bounds.northeast.lat);
            this.finalFourPosition.push(northWest);
            // 东北
            northEast.push(bounds.northeast.lng);
            northEast.push(bounds.northeast.lat);
            this.finalFourPosition.push(northEast);
            // 东南
            southEast.push(bounds.northeast.lng);
            southEast.push(bounds.southwest.lat);
            this.finalFourPosition.push(southEast);
            if (num === 0) {
                this.finalFourPosition1 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds1 = new AMap.Bounds(southwest, northeast);
                this.map1.setBounds(mapBounds1);
                // this.fetchRoadData(this.finalFourPosition1, num);
                this.WebSocketQuery.push(this.finalFourPosition1);
            } else if (num === 1) {
                this.finalFourPosition2 = this.finalFourPosition;
                var mapBounds2 = new AMap.Bounds(this.finalFourPosition2[1], this.finalFourPosition2[3]);
                this.map2.setBounds(mapBounds2);
                this.WebSocketQuery.push(this.finalFourPosition2);
                // this.fetchRoadData(this.finalFourPosition2, num);
            } else if (num === 2) {
                this.finalFourPosition3 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds3 = new AMap.Bounds(southwest, northeast);
                this.map3.setBounds(mapBounds3);
                this.WebSocketQuery.push(this.finalFourPosition3);
                // this.fetchRoadData(this.finalFourPosition3, num);
            } else if (num === 3) {
                this.finalFourPosition4 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds4 = new AMap.Bounds(southwest, northeast);
                this.map4.setBounds(mapBounds4);
                this.WebSocketQuery.push(this.finalFourPosition4);
                // this.fetchRoadData(this.finalFourPosition4, num);
            }
        },
        fetchRoadData(finalFourPosition, num) {
            getTypeRoadData([{'polygon': finalFourPosition}]).then(res => {
                if (num === 0) {
                    this.basicRoadData1 = res.data;
                } else if (num === 1) {
                    this.basicRoadData2 = res.data;
                } else if (num === 2) {
                    this.basicRoadData3 = res.data;
                } else {
                    this.basicRoadData4 = res.data;
                }
            });
        },
        getFourPosition(num) {
            let bounds;
            let northEast = [];
            let southWest = [];
            let northWest = [];
            let southEast = [];
            this.finalFourPosition = [];
            if (num === 0) {
                bounds = this.map1.getBounds();
                this.getPositionData(bounds, num);
            } else if (num === 1) {
                bounds = this.map2.getBounds();
                this.getPositionData(bounds, num);
            } else if (num === 2) {
                bounds = this.map3.getBounds();
                this.getPositionData(bounds, num);
            } else if (num === 3) {
                bounds = this.map4.getBounds();
                this.getPositionData(bounds, num);
            };
        },
        // 四个点坐标转为经纬度
        fetchTypicalRoad() {
            getTypicalRoadData().then(res => {
                let result = res.data;
                let position; // 位置
                let wms;
                result.forEach((x, index) => {
                    position = new AMap.LngLat(x.longitude, x.latitude);
                    wms  = new AMap.TileLayer.WMS({
                        url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
                        blend: false,
                        tileSize: 256,
                        params:{'LAYERS': 'shanghai_qcc:dl_shcsq_wgs84_gjlk',VERSION:'1.1.0'}
                    })
                    if (index === 0) {
                        this.cross1 = result[index];
                        // setMap设置图层所属的地图对象
                        wms.setMap(this.map1);
                        // 设置中心点（地图的经纬度）
                        this.map1.setCenter(position);
                        this.cross1.longitude=x.longitude;
                        this.cross1.latitude=x.latitude;
                        // 设置缩放级别
                        this.map1.setZoom(18);
                        this.getFourPosition(index);
                        // 路口1实时数据
                        this.getRoadRunningData1();
                    }
                    if (index === 1) {
                        this.cross2 = result[index];
                        wms.setMap(this.map2);
                        this.map2.setCenter(position);
                        this.cross2.longitude=x.longitude;
                        this.cross2.latitude=x.latitude;
                        this.map2.setZoom(18);
                        this.getFourPosition(index);
                        // 路口2实时数据
                        this.getRoadRunningData2();
                    }
                    if (index === 2) {
                        this.cross3 = result[index];
                        wms.setMap(this.map3);
                        this.map3.setCenter(position);
                        this.cross3.longitude=x.longitude;
                        this.cross3.latitude=x.latitude;
                        this.map3.setZoom(18);
                        this.getFourPosition(index);
                        // 路口3实时数据
                        this.getRoadRunningData3();
                    }
                    if (index === 3) {
                        this.cross4 = result[index];
                        wms.setMap(this.map4);
                        this.map4.setCenter(position);
                        this.cross4.longitude=x.longitude;
                        this.cross4.latitude=x.latitude;
                        this.map4.setZoom(18);
                        this.getFourPosition(index);
                        // 路口4实时数据
                        this.getRoadRunningData4();
                    }
                    // 将四个路口的websocket接口写成一个
                    // this.getRoadRunningData();

                });
            })
        },

        // 四个路段的websocket
        // getRoadRunningData() {
        //     if ('WebSocket' in window) {
        //         this.roadWebSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
        //     }
        //     this.roadWebSocket.onmessage = this.onRoadMessage;
        //     this.roadWebSocket.onclose = this.onRoadClose;
        //     this.roadWebSocket.onopen = this.onRoadOpen;
        //     this.roadWebSocket.onerror = this.onRoadError;
        // },
        // onRoadMessage(message) {
        //     if (this.count === 4) {
        //         this.count = 0;
        //     }
        //     ++ this.count;
        //     let jsonData = JSON.parse(message.data);
        //     let result = jsonData.result;
        //     console.log('返回的车辆数据', this.count, result);
        //     this.roadLights.map((x, index) => {
        //         if (x.type === this.count) {
        //             this.roadLights[index].dataList = result;
        //         }
        //     });
        // },
        // onRoadClose() {
        //     console.log("结束连接");
        // },
        // onRoadOpen() {
        //     // 获取红绿灯
        //     let roadLight;
        //     this.WebSocketQuery.map((x, index) => {
        //         roadLight = {
        //            'action': 'road_real_data',
        //             'data': { 
        //                 'polygon': x
        //             }
        //         };
        //         let roadStr = JSON.stringify(roadLight);
        //         this.sendRoadMsg(roadStr);
        //     });
        // },
        // sendRoadMsg(msg) {
        //     if (window.WebSocket) {
        //         if (this.roadWebSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
        //             this.roadWebSocket.send(msg); //send()发送消息
        //         }
        //     } else {
        //         return false;
        //     }
        // },
        // onRoadError() {
        //     console.log("链接错误");
        // },

        // 第一个路段
        getRoadRunningData1() {
            let _this = this;
            if ('WebSocket' in window) {
                _this.roadWebSocket1 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.roadWebSocket1.onmessage = _this.onRoadMessage1;
            _this.roadWebSocket1.onclose = _this.onRoadClose1;
            _this.roadWebSocket1.onopen = _this.onRoadOpen1;
            _this.roadWebSocket1.onerror = _this.onRoadError1;
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
                roadLights = result.spatDataDTO;
                roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                    roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < roadLights.length; i++) {
                    let _data = roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map1,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.map1.add(marker);
                        _this.map1LightList.push(marker);
                    }
                }
            }
            if (this.count1 === 0) {
                this.count1 ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars = roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (roadSenseCars.length > 0) {
                        roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.sideVehicleObj1) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < roadSenseCars.length; i++) {
                                if (id === roadSenseCars[i].vehicleId) {
                                    if (_this.sideVehicleObj1[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.sideVehicleObj1[id].marker.hide();
                                _this.sideVehicleObj1[id].flag = false;
                            }
                        }
                        // 开始打点
                        roadSenseCars.forEach((subItem, subIndex, subArr) => {
                            if (_this.sideVehicleObj1[subItem.vehicleId]) {
                                let sideCar = _this.sideVehicleObj1[subItem.vehicleId];
                                if (sideCar.flag) {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.moveTo(subItem.position, subItem.speed);
                                } else {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.setPosition(subItem.position);
                                    sideCar.marker.show();
                                    _this.sideVehicleObj1[subItem.vehicleId].flag = true;
                                }
                            } else {
                                // 新的
                                _this.sideVehicleObj1[subItem.vehicleId] = {
                                    marker: null,
                                    flag: true
                                };
                                _this.sideVehicleObj1[subItem.vehicleId].marker = new AMap.Marker({
                                    position: subItem.position,
                                    map: this.map1,
                                    icon: 'static/images/road/car.png',
                                    angle: subItem.heading,
                                    devId: subItem.devId,
                                    // offset: new AMap.Pixel(-15, -10),
                                    zIndex: 1
                                });
                                this.map1.add(_this.sideVehicleObj1[subItem.vehicleId].marker);
                            }
                            if (subIndex === subArr.length - 1) {
                                setTimeout(() => {
                                        _this.count1 = 0;
                                }, 0);
                            }
                        });
                    }  else {
                        // 返回的数据为空
                        this.count1 = 0; 
                        for (let i in _this.sideVehicleObj1)  {
                            if (this.sideVehicleObj1[i]) {
                                this.sideVehicleObj1[i].marker.hide();
                                this.sideVehicleObj1[i].flag = false;
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
                    'polygon': this.finalFourPosition1,
                    'fuselType': 1
                }
               
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg1(roadStr);
        },
        sendRoadMsg1(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.roadWebSocket1.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.roadWebSocket1.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第二个路段
        getRoadRunningData2() {
            let _this = this;
            if ('WebSocket' in window) {
                _this.roadWebSocket2 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.roadWebSocket2.onmessage = _this.onRoadMessage2;
            _this.roadWebSocket2.onclose = _this.onRoadClose2;
            _this.roadWebSocket2.onopen = _this.onRoadOpen2;
            _this.roadWebSocket2.onerror = _this.onRoadError2;
        },
        onRoadMessage2(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let roadLights;
            let roadSenseCars;
            let lightPosition;
            let carPosition;
            if ('spatDataDTO' in result === true) {
                roadLights = result.spatDataDTO;
                roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                    roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < roadLights.length; i++) {
                    let _data = roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map2,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.map2.add(marker);
                        _this.map2LightList.push(marker);
                    }
                }
            }
            if (this.count2 === 0) {
                this.count2 ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars = roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (roadSenseCars.length > 0) {
                        roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in _this.sideVehicleObj2) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < roadSenseCars.length; i++) {
                                if (id === roadSenseCars[i].vehicleId) {
                                    if (_this.sideVehicleObj2[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                _this.sideVehicleObj2[id].marker.hide();
                                _this.sideVehicleObj2[id].flag = false;
                            }
                        }
                        // 开始打点
                        roadSenseCars.forEach((subItem, subIndex, subArr) => {
                            if (_this.sideVehicleObj2[subItem.vehicleId]) {
                                let sideCar = _this.sideVehicleObj2[subItem.vehicleId];
                                if (sideCar.flag) {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.moveTo(subItem.position, subItem.speed);
                                } else {
                                    sideCar.marker.setAngle(subItem.heading);
                                    sideCar.marker.setPosition(subItem.position);
                                    sideCar.marker.show();
                                    _this.sideVehicleObj2[subItem.vehicleId].flag = true;
                                }
                            } else {
                                // 新的
                                _this.sideVehicleObj2[subItem.vehicleId] = {
                                    marker: null,
                                    flag: true
                                };
                                _this.sideVehicleObj2[subItem.vehicleId].marker = new AMap.Marker({
                                    position: subItem.position,
                                    map: _this.map2,
                                    icon: 'static/images/road/car.png',
                                    angle: subItem.heading,
                                    devId: subItem.devId,
                                    // offset: new AMap.Pixel(-15, -10),
                                    zIndex: 1
                                });
                                _this.map2.add(_this.sideVehicleObj2[subItem.vehicleId].marker);
                            }
                            if (subIndex === subArr.length - 1) {
                                setTimeout(() => {
                                        _this.count2 = 0;
                                }, 0);
                            }
                        });
                    }  else {
                        // 返回的数据为空
                        this.count2 = 0; 
                        for (let i in _this.sideVehicleObj2)  {
                            if (this.sideVehicleObj2[i]) {
                                this.sideVehicleObj2[i].marker.hide();
                                this.sideVehicleObj2[i].flag = false;
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
                    'polygon': this.finalFourPosition2,
                    'fuselType': 1
                } 
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg2(roadStr);
        },
        sendRoadMsg2(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.roadWebSocket2.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.roadWebSocket2.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第三个路段
        getRoadRunningData3() {
            let _this = this;
            if ('WebSocket' in window) {
                _this.roadWebSocket3 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.roadWebSocket3.onmessage = _this.onRoadMessage3;
            _this.roadWebSocket3.onclose = _this.onRoadClose3;
            _this.roadWebSocket3.onopen = _this.onRoadOpen3;
            _this.roadWebSocket3.onerror = _this.onRoadError3;
        },
        onRoadMessage3(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let roadLights;
            let roadSenseCars = [];
            let lightPosition;
            let carPosition;
            // 红绿灯
            if ('spatDataDTO' in result === true) {
                roadLights = result.spatDataDTO;
                roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                    roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < roadLights.length; i++) {
                    let _data = roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map3,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.map3.add(marker);
                        _this.map3LightList.push(marker);
                    }
                }
            }
            // 车辆
            if (this.count3 === 0) {
                this.count3 ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars = roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (roadSenseCars.length > 0) {
                        roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in this.sideVehicleObj3) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < roadSenseCars.length; i++) {
                                if (id === roadSenseCars[i].vehicleId) {
                                    if (this.sideVehicleObj3[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                this.sideVehicleObj3[id].marker.hide();
                                this.sideVehicleObj3[id].flag = false;
                            }
                        }
                    // 开始打点
                        roadSenseCars.forEach((item, index, arr) => {
                            _this.count3 ++;
                            if (_this.count3 === arr.length + 1) {
                                roadSenseCars.forEach((subItem, subIndex, subArr) => {
                                if (this.sideVehicleObj3[subItem.vehicleId]) {
                                    let sideCar = this.sideVehicleObj3[subItem.vehicleId];
                                    // 已有的，moveto
                                    if (sideCar.flag) {
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.moveTo(subItem.position, subItem.speed);
                                    } else {
                                        // 之前hide，然后show的
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.setPosition(subItem.position);
                                        sideCar.marker.show();
                                        _this.sideVehicleObj3[subItem.vehicleId].flag = true;
                                    }
                                } else {
                                    // 新的
                                    this.sideVehicleObj3[subItem.vehicleId] = {
                                        marker: null,
                                        flag: true
                                    };
                                    this.sideVehicleObj3[subItem.vehicleId].marker = new AMap.Marker({
                                        position: subItem.position,
                                        map: this.map3,
                                        icon: 'static/images/road/car.png',
                                        angle: subItem.heading,
                                        devId: subItem.devId,
                                        // offset: new AMap.Pixel(-15, -10),
                                        zIndex: 1
                                    });
                                    this.map3.add(this.sideVehicleObj3[subItem.vehicleId].marker); 
                                    }
                                    if (subIndex === subArr.length - 1) {
                                        setTimeout(() => {
                                            _this.count3 = 0;
                                        }, 0);
                                    }
                                });
                            }
                        });
                    } else {
                        this.count3 = 0;
                        for (let i in this.sideVehicleObj3)  {
                            if (this.sideVehicleObj3[i]) {
                                this.sideVehicleObj3[i].marker.hide();
                                this.sideVehicleObj3[i].flag = false;
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
                    'polygon': this.finalFourPosition3,
                    'fuselType': 1
                }
               
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg3(roadStr);
        },
        sendRoadMsg3(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.roadWebSocket3.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.roadWebSocket3.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
        // 第四个路段
        getRoadRunningData4() {
            let _this = this;
            if ('WebSocket' in window) {
                _this.roadWebSocket4 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.roadWebSocket4.onmessage = _this.onRoadMessage4;
            _this.roadWebSocket4.onclose = _this.onRoadClose4;
            _this.roadWebSocket4.onopen = _this.onRoadOpen4;
            _this.roadWebSocket4.onerror = _this.onRoadError4;
        },
        onRoadMessage4(message) {
            let _this = this;
            let jsonData = JSON.parse(message.data);
            let result = jsonData.result;
            let roadLights;
            let roadSenseCars;
            let lightPosition;
            let carPosition;
            if ('spatDataDTO' in result === true) {
                roadLights = result.spatDataDTO;
                roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.position.longitude, x.position.latitude);
                    roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < roadLights.length; i++) {
                    let _data = roadLights[i];
                    if(_data.position) {
                        let marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map4,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -5),
                            spatId: _data.spatId,
                            zIndex: 100
                        });
                        _this.map4.add(marker);
                        _this.map4LightList.push(marker);
                    }
                }
            }
            // 车辆
            if (this.count4 === 0) {
                this.count4 ++;
                // 新建点
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars = roadSenseCars.filter(x => x.targetType === 2 || x.targetType === 5);
                    if (roadSenseCars.length > 0) {
                        roadSenseCars.map((x, index) => {
                            carPosition = new AMap.LngLat(x.longitude, x.latitude);
                            _this.$set(x, 'position', carPosition);
                        });
                        for (let id in this.sideVehicleObj4) {
                            let flag = false;
                            // 比对已经打点的id和返回的将要打点的车辆， 有，设置flag = true
                            for (let i = 0; i < roadSenseCars.length; i++) {
                                if (id === roadSenseCars[i].vehicleId) {
                                    if (this.sideVehicleObj4[id].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            // 不存在时，隐藏掉
                            if (!flag) {
                                this.sideVehicleObj4[id].marker.hide();
                                this.sideVehicleObj4[id].flag = false;
                            }
                        }
                    // 开始打点
                        roadSenseCars.forEach((item, index, arr) => {
                            _this.count4 ++;
                            if (_this.count4 === arr.length + 1) {
                                roadSenseCars.forEach((subItem, subIndex, subArr) => {
                                if (this.sideVehicleObj4[subItem.vehicleId]) {
                                    let sideCar = this.sideVehicleObj4[subItem.vehicleId];
                                    // 已有的，moveto
                                    if (sideCar.flag) {
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.moveTo(subItem.position, subItem.speed);
                                    } else {
                                        // 之前hide，然后show的
                                        sideCar.marker.setAngle(subItem.heading);
                                        sideCar.marker.setPosition(subItem.position);
                                        sideCar.marker.show();
                                        _this.sideVehicleObj4[subItem.vehicleId].flag = true;
                                    }
                                } else {
                                    // 新的
                                    this.sideVehicleObj4[subItem.vehicleId] = {
                                        marker: null,
                                        flag: true
                                    };
                                    this.sideVehicleObj4[subItem.vehicleId].marker = new AMap.Marker({
                                        position: subItem.position,
                                        map: this.map4,
                                        icon: 'static/images/road/car.png',
                                        angle: subItem.heading,
                                        devId: subItem.devId,
                                        // offset: new AMap.Pixel(-15, -10),
                                        zIndex: 1
                                    });
                                    this.map4.add(this.sideVehicleObj4[subItem.vehicleId].marker); 
                                    }
                                    if (subIndex === subArr.length - 1) {
                                        setTimeout(() => {
                                            _this.count4 = 0;
                                        }, 0);
                                    }
                                });
                            }
                        });
                    } else {
                        this.count4 = 0;
                        for (let i in this.sideVehicleObj4)  {
                            if (this.sideVehicleObj4[i]) {
                                this.sideVehicleObj4[i].marker.hide();
                                this.sideVehicleObj4[i].flag = false;
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
                    'polygon': this.finalFourPosition4,
                    'fuselType': 1
                }
            }
            var roadStr = JSON.stringify(roadLight);
            this.sendRoadMsg4(roadStr);
        },
        sendRoadMsg4(msg) {
            let _this = this;
            if (window.WebSocket) {
                if (_this.roadWebSocket4.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.roadWebSocket4.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        },
    },
    destroyed(){
        //销毁Socket
        this.roadWebSocket1.close();
        this.roadWebSocket2.close();
        this.roadWebSocket3.close();
        this.roadWebSocket4.close();
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
