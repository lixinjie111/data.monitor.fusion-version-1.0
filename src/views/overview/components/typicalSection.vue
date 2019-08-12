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
                    <p >{{cross3.name}}</p>
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
            map1LightList: [], // 红绿灯
            map2LightList: [],
            map3LightList: [],
            map4LightList: [],
            count1:0,
            count2:0,
            count3:0,
            count4:0,
            traficLight: [],
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
        }
    },
    mounted() {
            this.map1 = new AMap.Map('map1', this.mapOption);
            this.map2 = new AMap.Map('map2', this.mapOption);
            this.map3 = new AMap.Map('map3', this.mapOption);
            this.map4 = new AMap.Map('map4', this.mapOption);
            // this.getTypeCross();
            this.fetchTypicalRoad();
    },
    methods: {
        // 点击路口路由跳转到具体的路口详情
        showRoadDetail(num) {
            if (num === 1) {
                this.$router.push({
                    path: '/perception',
                    query:{id:this.cross1.id,longitude:this.cross1.longitude,latitude:this.cross1.latitude}
                });
            } else if (num === 2) {
                this.$router.push({
                    path: '/perception',
                    query:{id:this.cross2.id,longitude:this.cross2.longitude,latitude:this.cross2.latitude}
                });
            } else if (num === 3) {
                this.$router.push({
                    path: '/perception',
                    query:{id:this.cross3.id,longitude:this.cross3.longitude,latitude:this.cross3.latitude}
                });
            } else {
                this.$router.push({
                    path: '/perception',
                    query:{id:this.cross4.id,longitude:this.cross4.longitude,latitude:this.cross4.latitude}
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
            } else if (num === 1) {
                this.finalFourPosition2 = this.finalFourPosition;
                var mapBounds2 = new AMap.Bounds(this.finalFourPosition2[1], this.finalFourPosition2[3]);
                this.map2.setBounds(mapBounds2);
                // this.center = this.map2.getCenter();
                // this.map2.setCenter(this.center);
                // this.fetchRoadData(this.finalFourPosition2, num);
            } else if (num === 2) {
                this.finalFourPosition3 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds3 = new AMap.Bounds(southwest, northeast);
                this.map3.setBounds(mapBounds3);
                // this.fetchRoadData(this.finalFourPosition3, num);
            } else if (num === 3) {
                this.finalFourPosition4 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds4 = new AMap.Bounds(southwest, northeast);
                this.map4.setBounds(mapBounds4);
                // this.fetchRoadData(this.finalFourPosition4, num);
            }
        },
        fetchRoadData(finalFourPosition, num) {
            getTypeRoadData([{'polygon': finalFourPosition}]).then(res => {
                if (num === 0) {
                    this.basicRoadData1 = res.data;
                    this.changeLngLatData1(this.basicRoadData1);
                } else if (num === 1) {
                    this.basicRoadData2 = res.data;
                    this.changeLngLatData2(this.basicRoadData2);
                } else if (num === 2) {
                    this.basicRoadData3 = res.data;
                    this.changeLngLatData3(this.basicRoadData3);
                } else {
                    this.basicRoadData4 = res.data;
                    this.changeLngLatData4(this.basicRoadData4);
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
                        // this.initWebSocket1();
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
                        // this.initWebSocket2();
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
                        // this.initWebSocket3();
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
                        // this.initWebSocket4();
                        // 路口4实时数据
                        this.getRoadRunningData4();
                    } 
                });
            })
        },
        // 画红绿灯1
        // changeLngLatData1(basicRoadData) {
        //     let spatsLight;
        //     if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
        //         spatsLight = basicRoadData[0].baseData.spats;
        //         spatsLight.map((x, index) => {
        //             let position = new AMap.LngLat(x.centerX, x.centerY);
        //             this.$set(x, 'position', position);
        //         });
        //         this.drawRoadLight1(spatsLight);
        //     }
        // },
        // // 画红绿灯2
        // changeLngLatData2(basicRoadData) {
        //     let spatsLight;
        //     if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
        //         spatsLight = basicRoadData[0].baseData.spats;
        //         spatsLight.map((x, index) => {
        //             let position = new AMap.LngLat(x.centerX, x.centerY);
        //             this.$set(x, 'position', position);
        //         });
        //         // this.drawRoadLight2(spatsLight);
        //     }
        // },
        // // 画红绿灯3
        // changeLngLatData3(basicRoadData) {
        //     let spatsLight;
        //     if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
        //         spatsLight = basicRoadData[0].baseData.spats;
        //         spatsLight.map((x, index) => {
        //             let position = new AMap.LngLat(x.centerX, x.centerY);
        //             this.$set(x, 'position', position);
        //         });
        //         // this.traficLight3 = spatsLight;
        //         console.log('this.traficLight3 --- xxx', spatsLight);
        //         this.drawRoadLight3(spatsLight);
        //     }
        // },
        // // 画红绿灯4
        // changeLngLatData4(basicRoadData) {
        //     let spatsLight;
        //     if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
        //         spatsLight = basicRoadData[0].baseData.spats;
        //         spatsLight.map((x, index) => {
        //             let position = new AMap.LngLat(x.centerX, x.centerY);
        //             this.$set(x, 'position', position);
        //         });
        //         this.drawRoadLight2(spatsLight);
        //     }
        // },
        // drawRoadLight1(traficLight) {
        //     let roadLight = traficLight;
        //     let self = this,
        //     _responseDataDrawLength = self.traficLight1.length,
        //     spatsLightLength = traficLight.length;
        //     if (self.traficLight1.length > 0) {
        //         for(let m = 0; m < self.traficLight1.length; m++) {
        //             self.map1.remove(self.traficLight1[m].marker);
        //             self.map1.remove(self.traficLight1[m].spatIdMarker);
        //         }
        //         self.traficLight1 = [];
        //     }
        //     for(let i = 0; i < roadLight.length; ++i) {
        //         let _data = roadLight[i];
        //         console.log('roadLight', roadLight[i].uid);
        //         if(_data.position) {
        //             let _markerObj = {
        //                 marker: null,
        //                 uidMarker: null
        //             };
        //             _markerObj.marker = new AMap.Marker({
        //                 map: self.map1,
        //                 position: _data.position,
        //                 icon: "static/images/road/green.png",
        //                 offset: new AMap.Pixel(0, 0),
        //                 zIndex: 50,
        //                 uid: _data.uid,
        //                 anchor: 'top-left'
        //             });
        //             _markerObj.uidMarker = new AMap.Text({
        //                 map: self.map1,
        //                 text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
        //                 anchor: 'center', // 设置文本标记锚点
        //                 style: {
        //                     'padding': '0 5px',
        //                     'border-radius': '4px',
        //                     'background-color': 'red',
        //                     'border-width': 0,
        //                     'text-align': 'center',
        //                     'font-size': '10px',
        //                     'line-height': '16px',
        //                     'letter-spacing': '0',
        //                     'color': '#ccc'
        //                 },
        //                 position: _data.position,
        //                 uid: _data.uid
        //             });
        //             self.traficLight1.push(_markerObj);
        //             console.log('self.traficLight1.', self.traficLight1);
        //         }
        //     }
        // },
        // drawRoadLight2(traficLight) {
        //     let roadLight = traficLight;
        //     let self = this,
        //     _responseDataDrawLength = self.traficLight2.length,
        //     spatsLightLength = traficLight.length;
        //     if (_responseDataDrawLength > 0) {
        //         for(let m = 0; m < self.traficLight2.length; m++) {
        //             self.map2.remove(self.traficLight2[m].marker);
        //             self.map2.remove(self.traficLight2[m].spatIdMarker);
        //         }
        //         self.traficLight2 = [];
        //     }
        //     for(let i = 0; i < roadLight.length; ++i) {
        //         let _data = roadLight[i];
        //         console.log('roadLight', roadLight[i].uid);
        //         if(_data.position) {
        //             let _markerObj = {
        //                 marker: null,
        //                 uidMarker: null
        //             };
        //             _markerObj.marker = new AMap.Marker({
        //                 map: self.map2,
        //                 position: _data.position,
        //                 icon: "static/images/road/green.png",
        //                 offset: new AMap.Pixel(0, 0),
        //                 zIndex: 50,
        //                 uid: _data.uid
        //             });
        //             _markerObj.uidMarker = new AMap.Text({
        //                 map: self.map2,
        //                 text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
        //                 // text: '京N123456',
        //                 anchor: 'center', // 设置文本标记锚点
        //                 style: {
        //                     'padding': '0 5px',
        //                     'border-radius': '4px',
        //                     // 'background-color': 'rgba(55, 186, 123, .2)',
        //                     'background-color': 'red',
        //                     'border-width': 0,
        //                     'text-align': 'center',
        //                     'font-size': '10px',
        //                     'line-height': '16px',
        //                     'letter-spacing': '0',
        //                     'color': '#ccc'
        //                 },
        //                 position: _data.position,
        //                 uid: _data.uid
        //             });
        //             self.traficLight2.push(_markerObj);
        //         }
        //     }
        // },
        // drawRoadLight3(traficLight) {
        //     let roadLight = traficLight;
        //     let self = this,
        //     _responseDataDrawLength = self.traficLight3.length,
        //     spatsLightLength = traficLight.length;
        //     if (_responseDataDrawLength > 0) {
        //         for(let m = 0; m < self.traficLight3.length; m++) {
        //             self.map3.remove(self.traficLight3[m].marker);
        //             self.map3.remove(self.traficLight3[m].spatIdMarker);
        //         }
        //         self.traficLight3 = [];
        //     }
        //     for(let i = 0; i < roadLight.length; ++i) {
        //         let _data = roadLight[i];
        //         console.log('roadLight', _data.uid);
        //         if(_data.position) {
        //             let _markerObj = {
        //                 marker: null,
        //                 uidMarker: null
        //             };
        //             _markerObj.marker = new AMap.Marker({
        //                 map: self.map3,
        //                 position: _data.position,
        //                 icon: "static/images/road/green.png",
        //                 offset: new AMap.Pixel(0, 0),
        //                 zIndex: 50,
        //                 uid: _data.uid
        //             });
        //             _markerObj.uidMarker = new AMap.Text({
        //                 map: self.map3,
        //                 text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
        //                 // text: '京N123456',
        //                 anchor: 'center', // 设置文本标记锚点
        //                 style: {
        //                     'padding': '0 5px',
        //                     'border-radius': '4px',
        //                     // 'background-color': 'rgba(55, 186, 123, .2)',
        //                     'background-color': 'green',
        //                     'border-width': 0,
        //                     'text-align': 'center',
        //                     'font-size': '10px',
        //                     'line-height': '16px',
        //                     'letter-spacing': '0',
        //                     'color': '#ccc'
        //                 },
        //                 position: _data.position,
        //                 uid: _data.uid
        //             });
        //             self.traficLight3.push(_markerObj);
        //             console.log('self.traficLight3.', self.traficLight3);
        //         }
        //     }
        // },
        // drawRoadLight4(traficLight) {
        //     let roadLight = traficLight;
        //     let self = this,
        //     _responseDataDrawLength = self.traficLight4.length,
        //     spatsLightLength = traficLight.length;
        //     if (_responseDataDrawLength > 0) {
        //         for(let m = 0; m < self.traficLight4.length; m++) {
        //             self.map4.remove(self.traficLight4[m].marker);
        //             self.map4.remove(self.traficLight4[m].spatIdMarker);
        //         }
        //         self.traficLight4 = [];
        //     }
        //     for(let i = 0; i < roadLight.length; ++i) {
        //         let _data = roadLight[i];
        //         console.log('roadLight', roadLight[i].uid);
        //         if(_data.position) {
        //             let _markerObj = {
        //                 marker: null,
        //                 uidMarker: null
        //             };
        //             _markerObj.marker = new AMap.Marker({
        //                 map: self.map4,
        //                 position: _data.position,
        //                 icon: "static/images/road/green.png",
        //                 offset: new AMap.Pixel(0, 0),
        //                 zIndex: 50,
        //                 uid: _data.uid
        //             });
        //             _markerObj.uidMarker = new AMap.Text({
        //                 map: self.map4,
        //                 text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
        //                 // text: '京N123456',
        //                 anchor: 'center', // 设置文本标记锚点
        //                 style: {
        //                     'padding': '0 5px',
        //                     'border-radius': '4px',
        //                     // 'background-color': 'rgba(55, 186, 123, .2)',
        //                     'background-color': 'red',
        //                     'border-width': 0,
        //                     'text-align': 'center',
        //                     'font-size': '10px',
        //                     'letter-spacing': '0',
        //                     'color': '#ccc'
        //                 },
        //                 position: _data.position,
        //                 uid: _data.uid
        //             });
        //             self.traficLight4.push(_markerObj);
        //             console.log('self.traficLight4.', self.traficLight4);
        //         }
        //     }
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
            if (this.count1 === 0) {
                this.map1.remove(this.map1List);
                this.map1List = [];
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
                            _this.map1List.push(marker);
                        }
                    }
                }
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars.map(x => {
                        carPosition = new AMap.LngLat(x.longitude, x.latitude);
                        _this.$set(x, 'position', carPosition);
                    });
                    for (let i = 0; i < roadSenseCars.length; i++) {
                        let _data = roadSenseCars[i];
                        this.count1 ++;
                        if (_data.position) {
                            let markerCar = new AMap.Marker({
                                position: _data.position,
                                map: _this.map1,
                                icon: 'static/images/road/car.png',
                                offset: new AMap.Pixel(-10, -10),
                                devId: _data.devId,
                                angle: _data.heading,
                                zIndex: 1
                            });
                        
                            _this.map1.add(markerCar);
                            _this.map1List.push(markerCar);
                            if (this.count1 === roadSenseCars.length) {
                                this.count1 = 0;
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
                    'polygon': this.finalFourPosition1
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
            if (this.count2 === 0) {
                this.map2.remove(this.map2List);
                this.map2List = [];
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
                            _this.map2List.push(marker);
                        }
                    }
                }
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    console.log('car length', roadSenseCars.length);
                    roadSenseCars.map(x => {
                        carPosition = new AMap.LngLat(x.longitude, x.latitude);
                        _this.$set(x, 'position', carPosition);
                    });
                    for (let i = 0; i < roadSenseCars.length; i++) {
                        let _data = roadSenseCars[i];
                        this.count2 ++;
                        if (_data.position) {
                            let markerCar = new AMap.Marker({
                                position: _data.position,
                                map: _this.map2,
                                icon: 'static/images/road/car.png',
                                offset: new AMap.Pixel(-15, -10),
                                devId: _data.devId,
                                angle: _data.heading,
                                zIndex: 1
                            });
                        
                            _this.map2.add(markerCar);
                            _this.map2List.push(markerCar);
                            if (this.count2 === roadSenseCars.length) {
                                this.count2 = 0;
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
                    'polygon': this.finalFourPosition2
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
            let roadSenseCars;
            let lightPosition;
            let carPosition;
            if (this.count3 === 0) {
                this.map3.remove(this.map3List);
                this.map3List = [];
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
                            _this.map3List.push(marker);
                        }
                    }
                }
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars.map(x => {
                        carPosition = new AMap.LngLat(x.longitude, x.latitude);
                        _this.$set(x, 'position', carPosition);
                    });
                    for (let i = 0; i < roadSenseCars.length; i++) {
                        let _data = roadSenseCars[i];
                        this.count3 ++;
                        if (_data.position) {
                            let markerCar = new AMap.Marker({
                                position: _data.position,
                                map: _this.map3,
                                icon: 'static/images/road/car.png',
                                offset: new AMap.Pixel(-15, -10),
                                devId: _data.devId,
                                angle: _data.heading,
                                zIndex: 1
                            });
                        
                            _this.map3.add(markerCar);
                            _this.map3List.push(markerCar);
                            if (this.count3 === roadSenseCars.length) {
                                this.count3 = 0;
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
                    'polygon': this.finalFourPosition3
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
            if (this.count4 === 0) {
                this.map4.remove(this.map2List);
                this.map4List = [];
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
                            _this.map4List.push(marker);
                        }
                    }
                }
                if ('vehDataDTO' in result === true) {
                    roadSenseCars = result.vehDataDTO;
                    roadSenseCars.map(x => {
                        carPosition = new AMap.LngLat(x.longitude, x.latitude);
                        _this.$set(x, 'position', carPosition);
                    });
                    for (let i = 0; i < roadSenseCars.length; i++) {
                        let _data = roadSenseCars[i];
                        this.count4 ++;
                        if (_data.position) {
                            let markerCar = new AMap.Marker({
                                position: _data.position,
                                map: _this.map4,
                                icon: 'static/images/road/car.png',
                                offset: new AMap.Pixel(-15, -10),
                                devId: _data.devId,
                                angle: _data.heading,
                                zIndex: 1
                            });
                        
                            _this.map4.add(markerCar);
                            _this.map4List.push(markerCar);
                            if (this.count4 === roadSenseCars.length) {
                                this.count4 = 0;
                            }
                        }
                    }
                }
            }
            // if ('spatDataDTO' in result === true) {
            //     roadLights = result.spatDataDTO;
            //     roadLights.map((x, index) => {
            //         lightPosition = new AMap.LngLat(x.position.longitude, x.poistion.latitude);
            //         roadLights[index].position = lightPosition;
            //     });
            //     for (let i = 0; i < _this.map4List.length; i++) {
            //         if ('marker' in _this.map4List[i] === true) {
            //             _this.map4.remove(_this.map4List[i].marker);
            //         }
            //         if ('spatIdMarker' in _this.map4List[i] === true) {
            //             _this.map4.remove(_this.map4List[i].spatIdMarker);
            //         }
            //     }
            //     for (let i = 0; i < roadLights.length; i++) {
            //         let _data = roadLights[i];
            //         if(_data.position) {
            //             let _markerObj = {
            //                 marker: null,
            //                 spatIdMarker: null
            //             };
            //             _markerObj.marker = new AMap.Marker({
            //                 position: _data.position,
            //                 map: _this.map4,
            //                 icon: this.dealLight(_data), // 添加 Icon 图标 URL
            //                 offset: new AMap.Pixel(-20, -10),
            //                 spatId: _data.spatId
            //             });
            //             _markerObj.spatIdMarker = new AMap.Text({
            //                 map: _this.map4,
            //                 // text: "<span style='color:#e6a23c'>" + _data.spatId + '</span>',
            //                 anchor: 'center', // 设置文本标记锚点
            //                 style: {
            //                     'padding': '0 5px',
            //                     'border-radius': '4px',
            //                     // 'background-color': 'rgba(55, 186, 123, .2)',
            //                     'background-color': 'red',
            //                     'border-width': '0',
            //                     'text-align': 'center',
            //                     'font-size': '10px',
            //                     'line-height': '16px',
            //                     'letter-spacing': '0',
            //                     'margin-top': '14px',  //车头
            //                     'color': '#ccc'
            //                 },
            //                 position: _data.position,
            //                 spatId: _data.spatId
            //             });
            //             _this.map4.add(_markerObj);
            //             _this.map4List.push(_markerObj);
            //         }
            //     }
            // }
            // if ('vehDataDTO' in result === true) {
            //     roadSenseCars = result.vehDataDTO;
            //     roadSenseCars.map(x => {
            //         carPosition = new AMap.LngLat(x.longitude, x.latitude);
            //         _this.$set(x, 'position', carPosition);
            //     });
            //     for (let i = 0; i < _this.map4List.length; i++) {
            //         if ('marker' in _this.map4List[i] === true) {
            //             _this.map4.remove(_this.map4List[i].marker);
            //         }
            //         if ('spatIdMarker' in _this.map4List[i] === true) {
            //             _this.map4.remove(_this.map4List[i].spatIdMarker);
            //         }
            //     }
            //     for (let i = 0; i < roadSenseCars.length; i++) {
            //         let _data = roadSenseCars[i];
            //         if (_data.position) {
            //             let _markerCar = {
            //                 markerVel: null,
            //                 velicheIdMarker: null
            //             };
            //             _markerCar.markerVel = new AMap.Marker({
            //                 position: _data.position,
            //                 map: _this.map4,
            //                 icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
            //                 offset: new AMap.Pixel(-15, -10),
            //                 devId: _data.devId,
            //                 angle: _data.heading
            //             });
            //             _markerCar.velicheIdMarker = new AMap.Text({
            //                 map: _this.map4,
            //                 // text: "<span style='color:#e6a23c'>" + _data.plateNo + '</span>',
            //                 anchor: 'center', // 设置文本标记锚点
            //                 style: {
            //                     'padding': '0 5px',
            //                     'border-radius': '4px',
            //                     'background-color': 'rgba(55, 186, 123, .2)',
            //                     'border-width': 0,
            //                     'text-align': 'center',
            //                     'font-size': '10px',
            //                     'line-height': '16px',
            //                     'letter-spacing': '0',
            //                     'margin-top': '14px',  //车头
            //                     'color': '#ccc'
            //                 },
            //                 position: _data.position,
            //                 devId: _data.devId
            //             });
            //             _this.map4.add(_markerCar);
            //             _this.map4List.push(_markerCar);
            //         }
            //     }
            // }
        },
        onRoadClose4(data){
            console.log("结束连接");
        },
        onRoadOpen4(data){
            // 获取红绿灯
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': this.finalFourPosition4
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
