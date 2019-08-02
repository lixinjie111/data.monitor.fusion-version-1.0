<template>
    <div class="fusion-right-style">
        <div class="right-road">
            <div class="base-info">
                <span>{{formatTime || '--'}}</span>
                <span>
                    <em >{{city.province}}{{city.district}}</em>
                    <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                    <em class="c-middle">{{weather.wendu || '--'}}°</em>
                </span>
            </div>
            <div class="perception-road" @click="showRoadDetail(1)">
                <div class="road-word" >
                    <p @click="queryCrossDetail(cross1)">{{cross1.name}}</p>
                </div>
                <div id="map1" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(2)">
                <div class="road-word">
                    <p @click="queryCrossDetail(cross2)">{{cross2.name}}</p>
                </div>
                <div id="map2" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(3)">
                <div class="road-word" >
                    <p @click="queryCrossDetail(cross3)">{{cross3.name}}</p>
                </div>
                <div id="map3" class="cross-scan"></div>
            </div>
            <div class="perception-road" @click="showRoadDetail(4)">
                <div  class="road-word">
                    <p @click="queryCrossDetail(cross4)">{{cross4.name}}</p>
                </div>
                <div id="map4" class="cross-scan"></div>
            </div>
          </div>
      </div>
</template>
<script>
import {typeCross, getTypicalRoadData, getTypeRoadData, getTopWeather} from '@/api/overview/index.js';
import ConvertCoord from '@/assets/js/coordConvert.js';
export default {
    data() {
        return {
            responseData: {
                timestamp: new Date().getTime()
            },
            defaultCenterPoint: [121.262939,31.245149],
            requestData: {
                disCode: ''
            },
            city: {},
            weather: {},
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
            webSocket1:{},
            webSocket2:{},
            webSocket3:{},
            webSocket4:{},
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
            traficLight1: [],
            traficLight2: [],
            traficLight3: [],
            traficLight4: [],
            fourRoadLight: [],
            roadWebSocket1: {},
            center: [],
            fourPoint: [[121.17560999059768, 31.282032221451242],[121.16724149847121, 31.282032221451242],[121.16724149847121, 31.28705868114515],[121.17560999059768, 31.28705868114515]]
        }
    },
    mounted() {
            this.map1 = new AMap.Map('map1', this.mapOption);
            this.map2 = new AMap.Map('map2', this.mapOption);
            this.map3 = new AMap.Map('map3', this.mapOption);
            this.map4 = new AMap.Map('map4', this.mapOption);
            // this.getTypeCross();
            this.fetchTypicalRoad();
            // 获取地区和天气
            this.getAddress();
    },
    methods: {
        // 获取地区
        getAddress() {
            let geocoder = new AMap.Geocoder();
            geocoder.getAddress(this.defaultCenterPoint, (status, result) => {
                if (status === 'complete' && result.regeocode) {
                    console.log('result', result);
                    let data = result.regeocode.addressComponent;
                    this.city.province = data.province;
                    this.city.district = data.district;
                    this.requestData.disCode = data.adcode;
                    this.$store.commit('SET_DISTRICT_DATA', result.regeocode.addressComponent);
                     this.getTopWeather();
                } else {
                    console.log('根据经纬度获取地区失败');
                }
            });
        },
        // 获取天气
        getTopWeather() {
            getTopWeather(this.requestData).then(res => {
                this.weather = res.data;
                this.$store.commit('SET_WEATHER_DATA', this.weather);
            });
        },
        // 查看路口的具体信息
        showRoadDetail(num) {
            if (num === 1) {
                this.$router.push({
                    path: '../../perception',
                    query: {
                        'id': this.cross1.id
                    }
                });
            } else if (num === 2) {
                this.$router.push({
                    path: '../../perception',
                    query: {
                        'id': this.cross2.id
                    }
                });
            } else if (num === 3) {
                this.$router.push({
                    path: '../../perception',
                    query: {
                        'id': this.cross3.id
                    }
                });
            } else {
                this.$router.push({
                    path: '../../perception',
                    query: {
                        'id': this.cross4.id
                    }
                });
            }
        },
        queryCrossDetail(item) {
            var _this = this;
            this.dialogVisible = true;
            this.$emit("queryCrossDetail",item);
            /*_this.selectedItem = item;
            */
        },
        // 获取各个路段的四个角的位置
        getPositionData(bounds, num) {
            this.finalFourPosition = [];
            this.finalFourPosition1 = [];
            this.finalFourPosition2 = [];
            this.finalFourPosition3 = [];
            this.finalFourPosition4 = [];
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

            northEast.push(bounds.northeast.lng);
            northEast.push(bounds.northeast.lat);
            this.finalFourPosition.push(northEast);
            // 西北
            northWest.push(bounds.southwest.lng);
            northWest.push(bounds.northeast.lat);
            this.finalFourPosition.push(northWest);
            // 东南
            southEast.push(bounds.northeast.lng);
            southEast.push(bounds.southwest.lat);
            this.finalFourPosition.push(southEast);
            if (num === 0) {
                this.finalFourPosition1 = this.finalFourPosition;
                // let bounds = this.map1.getBounds();
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds1 = new AMap.Bounds(southwest, northeast);
                this.map1.setBounds(mapBounds1);
                this.fetchRoadData(this.finalFourPosition1, num);
            } else if (num === 1) {
                // this.finalFourPosition2 = this.finalFourPosition;
                this.finalFourPosition2 = this.fourPoint;
                console.log(this.finalFourPosition2,  this.finalFourPosition2);
                var mapBounds2 = new AMap.Bounds(this.finalFourPosition2[1], this.finalFourPosition2[3]);
                this.map2.setBounds(mapBounds2);
                this.center = this.map2.getCenter();
                this.map2.setCenter(this.center);
                // this.fetchRoadData(this.finalFourPosition2, num);
            } else if (num === 2) {
                this.finalFourPosition3 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds3 = new AMap.Bounds(southwest, northeast);
                this.map3.setBounds(mapBounds3);
                this.fetchRoadData(this.finalFourPosition3, num);
            } else if (num === 3) {
                this.finalFourPosition4 = this.finalFourPosition;
                southwest = [bounds.southwest.lng, bounds.southwest.lat];
                northeast = [bounds.northeast.lng, bounds.northeast.lat];
                let mapBounds4 = new AMap.Bounds(southwest, northeast);
                this.map4.setBounds(mapBounds4);
                this.fetchRoadData(this.finalFourPosition4, num);
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
                        // 设置缩放级别
                        this.map1.setZoom(18);
                        this.getFourPosition(index);
                        this.initWebSocket1();
                        // this.getRoadRunningData1();
                    }
                    if (index === 1) {
                        this.cross2 = result[index];
                        wms.setMap(this.map2);
                        this.map2.setZoom(18);
                        this.getFourPosition(index);
                        this.initWebSocket2();
                        this.getRoadRunningData1();
                    }
                    if (index === 2) {
                        this.cross3 = result[index];
                        wms.setMap(this.map3);
                        this.map3.setCenter(position);
                        this.map3.setZoom(18);
                        // this.getFourPosition(index);
                        this.initWebSocket3();
                        // this.getRoadRunningData1();
                    }
                    if (index === 3) {
                        this.cross4 = result[index];
                        wms.setMap(this.map4);
                        this.map4.setCenter(position);
                        this.map4.setZoom(18);
                        this.getFourPosition(index);
                        this.initWebSocket4();
                    } 
                });
            })
        },
        // 画红绿灯1
        changeLngLatData1(basicRoadData) {
            let spatsLight;
            if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
                spatsLight = basicRoadData[0].baseData.spats;
                spatsLight.map((x, index) => {
                    let position = new AMap.LngLat(x.centerX, x.centerY);
                    this.$set(x, 'position', position);
                });
                this.drawRoadLight1(spatsLight);
            }
        },
        // 画红绿灯2
        changeLngLatData2(basicRoadData) {
            let spatsLight;
            if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
                spatsLight = basicRoadData[0].baseData.spats;
                spatsLight.map((x, index) => {
                    let position = new AMap.LngLat(x.centerX, x.centerY);
                    this.$set(x, 'position', position);
                });
                // this.drawRoadLight2(spatsLight);
            }
        },
        // 画红绿灯3
        changeLngLatData3(basicRoadData) {
            let spatsLight;
            if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
                spatsLight = basicRoadData[0].baseData.spats;
                spatsLight.map((x, index) => {
                    let position = new AMap.LngLat(x.centerX, x.centerY);
                    this.$set(x, 'position', position);
                });
                // this.traficLight3 = spatsLight;
                console.log('this.traficLight3 --- xxx', spatsLight);
                this.drawRoadLight3(spatsLight);
            }
        },
        // 画红绿灯4
        changeLngLatData4(basicRoadData) {
            let spatsLight;
            if (basicRoadData[0].baseData.hasOwnProperty('spats') === true) {
                spatsLight = basicRoadData[0].baseData.spats;
                spatsLight.map((x, index) => {
                    let position = new AMap.LngLat(x.centerX, x.centerY);
                    this.$set(x, 'position', position);
                });
                this.drawRoadLight2(spatsLight);
            }
        },
        drawRoadLight1(traficLight) {
            let roadLight = traficLight;
            let self = this,
            _responseDataDrawLength = self.traficLight1.length,
            spatsLightLength = traficLight.length;
            if (self.traficLight1.length > 0) {
                for(let m = 0; m < self.traficLight1.length; m++) {
                    self.map1.remove(self.traficLight1[m].marker);
                    self.map1.remove(self.traficLight1[m].spatIdMarker);
                }
                self.traficLight1 = [];
            }
            for(let i = 0; i < roadLight.length; ++i) {
                let _data = roadLight[i];
                console.log('roadLight', roadLight[i].uid);
                if(_data.position) {
                    let _markerObj = {
                        marker: null,
                        uidMarker: null
                    };
                    _markerObj.marker = new AMap.Marker({
                        map: self.map1,
                        position: _data.position,
                        icon: "static/images/road/green.png",
                        offset: new AMap.Pixel(0, 0),
                        zIndex: 50,
                        uid: _data.uid,
                        anchor: 'top-left'
                    });
                    _markerObj.uidMarker = new AMap.Text({
                        map: self.map1,
                        text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
                        anchor: 'center', // 设置文本标记锚点
                        style: {
                            'padding': '0 5px',
                            'border-radius': '4px',
                            'background-color': 'red',
                            'border-width': 0,
                            'text-align': 'center',
                            'font-size': '10px',
                            'line-height': '16px',
                            'letter-spacing': '0',
                            'color': '#ccc'
                        },
                        position: _data.position,
                        uid: _data.uid
                    });
                    self.traficLight1.push(_markerObj);
                    console.log('self.traficLight1.', self.traficLight1);
                }
            }
        },
        drawRoadLight2(traficLight) {
            let roadLight = traficLight;
            let self = this,
            _responseDataDrawLength = self.traficLight2.length,
            spatsLightLength = traficLight.length;
            if (_responseDataDrawLength > 0) {
                for(let m = 0; m < self.traficLight2.length; m++) {
                    self.map2.remove(self.traficLight2[m].marker);
                    self.map2.remove(self.traficLight2[m].spatIdMarker);
                }
                self.traficLight2 = [];
            }
            for(let i = 0; i < roadLight.length; ++i) {
                let _data = roadLight[i];
                console.log('roadLight', roadLight[i].uid);
                if(_data.position) {
                    let _markerObj = {
                        marker: null,
                        uidMarker: null
                    };
                    _markerObj.marker = new AMap.Marker({
                        map: self.map2,
                        position: _data.position,
                        icon: "static/images/road/green.png",
                        offset: new AMap.Pixel(0, 0),
                        zIndex: 50,
                        uid: _data.uid
                    });
                    _markerObj.uidMarker = new AMap.Text({
                        map: self.map2,
                        text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
                        // text: '京N123456',
                        anchor: 'center', // 设置文本标记锚点
                        style: {
                            'padding': '0 5px',
                            'border-radius': '4px',
                            // 'background-color': 'rgba(55, 186, 123, .2)',
                            'background-color': 'red',
                            'border-width': 0,
                            'text-align': 'center',
                            'font-size': '10px',
                            'line-height': '16px',
                            'letter-spacing': '0',
                            'color': '#ccc'
                        },
                        position: _data.position,
                        uid: _data.uid
                    });
                    self.traficLight2.push(_markerObj);
                }
            }
        },
        drawRoadLight3(traficLight) {
            let roadLight = traficLight;
            let self = this,
            _responseDataDrawLength = self.traficLight3.length,
            spatsLightLength = traficLight.length;
            if (_responseDataDrawLength > 0) {
                for(let m = 0; m < self.traficLight3.length; m++) {
                    self.map3.remove(self.traficLight3[m].marker);
                    self.map3.remove(self.traficLight3[m].spatIdMarker);
                }
                self.traficLight3 = [];
            }
            for(let i = 0; i < roadLight.length; ++i) {
                let _data = roadLight[i];
                console.log('roadLight', _data.uid);
                if(_data.position) {
                    let _markerObj = {
                        marker: null,
                        uidMarker: null
                    };
                    _markerObj.marker = new AMap.Marker({
                        map: self.map3,
                        position: _data.position,
                        icon: "static/images/road/green.png",
                        offset: new AMap.Pixel(0, 0),
                        zIndex: 50,
                        uid: _data.uid
                    });
                    _markerObj.uidMarker = new AMap.Text({
                        map: self.map3,
                        text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
                        // text: '京N123456',
                        anchor: 'center', // 设置文本标记锚点
                        style: {
                            'padding': '0 5px',
                            'border-radius': '4px',
                            // 'background-color': 'rgba(55, 186, 123, .2)',
                            'background-color': 'green',
                            'border-width': 0,
                            'text-align': 'center',
                            'font-size': '10px',
                            'line-height': '16px',
                            'letter-spacing': '0',
                            'color': '#ccc'
                        },
                        position: _data.position,
                        uid: _data.uid
                    });
                    self.traficLight3.push(_markerObj);
                    console.log('self.traficLight3.', self.traficLight3);
                }
            }
        },
        drawRoadLight4(traficLight) {
            let roadLight = traficLight;
            let self = this,
            _responseDataDrawLength = self.traficLight4.length,
            spatsLightLength = traficLight.length;
            if (_responseDataDrawLength > 0) {
                for(let m = 0; m < self.traficLight4.length; m++) {
                    self.map4.remove(self.traficLight4[m].marker);
                    self.map4.remove(self.traficLight4[m].spatIdMarker);
                }
                self.traficLight4 = [];
            }
            for(let i = 0; i < roadLight.length; ++i) {
                let _data = roadLight[i];
                console.log('roadLight', roadLight[i].uid);
                if(_data.position) {
                    let _markerObj = {
                        marker: null,
                        uidMarker: null
                    };
                    _markerObj.marker = new AMap.Marker({
                        map: self.map4,
                        position: _data.position,
                        icon: "static/images/road/green.png",
                        offset: new AMap.Pixel(0, 0),
                        zIndex: 50,
                        uid: _data.uid
                    });
                    _markerObj.uidMarker = new AMap.Text({
                        map: self.map4,
                        text: "<span style='color:#e6a23c'>" + _data.uid + '</span>',
                        // text: '京N123456',
                        anchor: 'center', // 设置文本标记锚点
                        style: {
                            'padding': '0 5px',
                            'border-radius': '4px',
                            // 'background-color': 'rgba(55, 186, 123, .2)',
                            'background-color': 'red',
                            'border-width': 0,
                            'text-align': 'center',
                            'font-size': '10px',
                            'letter-spacing': '0',
                            'color': '#ccc'
                        },
                        position: _data.position,
                        uid: _data.uid
                    });
                    self.traficLight4.push(_markerObj);
                    console.log('self.traficLight4.', self.traficLight4);
                }
            }
        },
        initWebSocket1() {
            let _this=this;
            // 利用websocket实时获取数据
            if ('WebSocket' in window) {
                _this.webSocket1 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.webSocket1.onmessage = _this.onmessage1;
            _this.webSocket1.onclose = _this.onclose1;
            _this.webSocket1.onopen = _this.onopen1;
            _this.webSocket1.onerror = _this.onerror1;
        },
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
            _this.map2.remove(this.map2List);
            _this.map2List = [];
            if ('spatDataDTO' in result === true) {
                roadLights = result.spatDataDTO;
                // console.log('roadLights --- 红绿灯', roadLights);
                roadLights.map((x, index) => {
                    lightPosition = new AMap.LngLat(x.postion.longitude, x.postion.latitude);
                    roadLights[index].position = lightPosition;
                });
                for (let i = 0; i < roadLights.length; i++) {
                    let _data = roadLights[i];
                    if(_data.position) {
                        let _markerObj = {
                            marker: null,
                            spatIdMarker: null
                        };
                        _markerObj.marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map2,
                            icon: this.dealLight(_data), // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-20, -10),
                            spatId: _data.spatId
                        });
                        _markerObj.spatIdMarker = new AMap.Text({
                            map: _this.map2,
                            text: "<span style='color:#e6a23c'>" + _data.spatId + '</span>',
                            anchor: 'center', // 设置文本标记锚点
                            style: {
                                'padding': '0 5px',
                                'border-radius': '4px',
                                // 'background-color': 'rgba(55, 186, 123, .2)',
                                'background-color': 'red',
                                'border-width': '0',
                                'text-align': 'center',
                                'font-size': '10px',
                                'line-height': '16px',
                                'letter-spacing': '0',
                                'margin-top': '14px',  //车头
                                'color': '#ccc'
                            },
                            position: _data.position,
                            spatId: _data.spatId
                        });
                        _this.map2.add(_markerObj);
                        _this.map2List.push(_markerObj);
                    }
                }
            }
            if ('vehDataDTO' in result === true) {
                roadSenseCars = result.vehDataDTO;
                // console.log('路口的数据', roadSenseCars);
                roadSenseCars.map(x => {
                    carPosition = new AMap.LngLat(x.longitude, x.latitude);
                    this.$set(x, 'position', carPosition);
                });
                for (let i = 0; i < roadSenseCars.length; i++) {
                    let _data = roadSenseCars[i];
                    if (_data.position) {
                        let _markerCar = {
                            marker: null,
                            velicheIdMarker: null
                        };
                        _markerCar.marker = new AMap.Marker({
                            position: _data.position,
                            map: _this.map2,
                            icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
                            offset: new AMap.Pixel(-2, -2),
                            vehicleId: _data.vehicleId
                        });
                        _markerCar.velicheIdMarker = new AMap.Text({
                            map: _this.map2,
                            text: "<span style='color:#e6a23c'>" + _data.vehicleId + '</span>',
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
                        _this.map2.add(_markerCar);
                        _this.map2List.push(_markerCar);
                    }
                }
            }
        },
        // 根据状态返回红，黄，绿灯
        dealLight(data) {
            if ('status' in data === true) {
                if (data.status === 'RED') {
                    return 'static/images/road/red.png';
                } else if (data.status === 'YELLOW') {
                    return 'static/images/road/yellow.png';
                } else if (data.status === 'GREEN') {
                    return 'static/images/road/green.png';
                }
            } else {
                return 'static/images/road/green.png';
            }
            
        },
        onRoadClose1(data){
            console.log("结束连接");
        },
        onRoadOpen1(data){
            // 获取红绿灯
            let arr = [[121.17560999059768, 31.282032221451242],[121.16724149847121, 31.282032221451242],[121.16724149847121, 31.28705868114515],[121.17560999059768, 31.28705868114515]]
            var roadLight = {
                'action': 'road_real_data',
                'data': { 
                    'polygon': arr
                }
            }
            console.log('roadLight', roadLight);
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
        onmessage1(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let result = json.result.vehData;
            let position;
            if (_this.count1==0){
                // 在接受请求前清除地图上的点
                _this.map1.remove(_this.map1List);
                _this.map1List=[];
                result.forEach(item =>{
                    position = new AMap.LngLat(item.longitude,item.latitude);
                _this.count1++;
                // 利用marker构造点标记
                let marker = new AMap.Marker({
                    position: position,
                    icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
                    angle: item.heading,
                    retate: '90deg',
                    offset:new AMap.Pixel(-8, -16)
                });
                _this.map1.add(marker);
                _this.map1List.push(marker);

                });
                if (this.count1 === result.length ){
                    _this.count1=0;
                }
            }
        },
        onclose1(data){
            console.log("结束连接");
        },
        onopen1(data){
            //获取在驶车辆状态
            var cross1 = {
                'action':'cross_real_data',
                'token':'tusvn',
                'crossId':this.cross1.crossId
            }
            var cross1Msg = JSON.stringify(cross1);
            this.sendMsg1(cross1Msg);
        },
        sendMsg1(msg) {
            let _this=this;
            if(window.WebSocket){
              if(_this.webSocket1.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                _this.webSocket1.send(msg); //send()发送消息
              }
            }else{
              return;
            }
        },
        initWebSocket2(){
            let _this=this;
            if ('WebSocket' in window) {
              _this.webSocket2 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.webSocket2.onmessage = _this.onmessage2;
            _this.webSocket2.onclose = _this.onclose2;
            _this.webSocket2.onopen = _this.onopen2;
            _this.webSocket2.onerror = _this.onerror2;
        },
        onmessage2(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let result = json.result.vehData;
            let position;
            if(_this.count2==0) {
              //在接受请求前清除地图上的点
              _this.map2.remove(_this.map2List);
              _this.map2List = [];
              result.forEach(item => {
                position = new AMap.LngLat(item.longitude,item.latitude);
                _this.count2++;
                let marker = new AMap.Marker({
                  position: position,
                  icon: 'static/images/road/car.png',
                  angle: item.heading,
                  offset:new AMap.Pixel(-8, -16)
                });
                _this.map2.add(marker);
                _this.map2List.push(marker);

              });
              if (this.count2 == result.length) {
                _this.count2 = 0;
              }
            }

        },
        onclose2(data){
            console.log("结束连接");
        },
        onopen2(data){
            let cross2 = {
              'action':'cross_real_data',
              'token':'tusvn',
              'crossId':this.cross2.crossId
            }
            let cross2Msg = JSON.stringify(cross2);
            this.sendMsg2(cross2Msg);
        },
        sendMsg2(msg) {
            let _this=this;
            if(window.WebSocket){
              if(_this.webSocket2.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                _this.webSocket2.send(msg); //send()发送消息
              }
            }else{
              return;
            }
        },
        initWebSocket3(){
            let _this=this;
            if ('WebSocket' in window) {
              _this.webSocket3 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.webSocket3.onmessage = _this.onmessage3;
            _this.webSocket3.onclose = _this.onclose3;
            _this.webSocket3.onopen = _this.onopen3;
            _this.webSocket3.onerror = _this.onerror3;
        },
        onmessage3(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let result = json.result.vehData;
            let position;
            if(_this.count3==0) {
              //在接受请求前清除地图上的点
              _this.map3.remove(_this.map3List);
              _this.map3List = [];
              result.forEach(item => {
                position = new AMap.LngLat(item.longitude,item.latitude);
                _this.count3++;
                let marker = new AMap.Marker({
                  position: position,
                  icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
                  angle: item.heading,
                  offset:new AMap.Pixel(-8, -16)
                });
                _this.map3.add(marker);
                _this.map3List.push(marker);

              });
              if (this.count3 == result.length) {
                _this.count3 = 0;
              }
            }

        },
        onclose3(data){
            console.log("结束连接");
        },
        onopen3(data){
            let cross3 = {
              'action':'cross_real_data',
              'token':'tusvn',
              'crossId':this.cross3.crossId
            }
            let cross3Msg = JSON.stringify(cross3);
            this.sendMsg3(cross3Msg);
        },
        sendMsg3(msg) {
            let _this=this;
            if(window.WebSocket){
              if(_this.webSocket3.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                _this.webSocket3.send(msg); //send()发送消息
              }
            }else{
              return;
            }
        },
        initWebSocket4(){
            let _this=this;
            if ('WebSocket' in window) {
              _this.webSocket4 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.webSocket4.onmessage = _this.onmessage4;
            _this.webSocket4.onclose = _this.onclose4;
            _this.webSocket4.onopen = _this.onopen4;
            _this.webSocket4.onerror = _this.onerror4;
        },
        onmessage4(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let result = json.result.vehData;
            let position;
            if(_this.count4==0) {
              //在接受请求前清除地图上的点
              _this.map4.remove(_this.map4List);
              _this.map4List = [];
              result.forEach(item => {
                position = new AMap.LngLat(item.longitude,item.latitude);
                _this.count4++;
                let marker = new AMap.Marker({
                  position: position,
                  icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
                  angle: item.heading,
                  offset:new AMap.Pixel(-8, -16)
                });
                _this.map4.add(marker);
                _this.map4List.push(marker);

              });
              if (this.count4 == result.length) {
                _this.count4 = 0;
              }
            }

        },
        onclose4(data){
            console.log("结束连接");
        },
        onopen4(data){
            let cross4 = {
              'action':'cross_real_data',
              'token':'tusvn',
              'crossId':this.cross4.crossId
            }
            let cross4Msg = JSON.stringify(cross4);
            this.sendMsg4(cross4Msg);
        },
        sendMsg4(msg) {
            let _this=this;
            if (window.WebSocket) {
                if(_this.webSocket4.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    _this.webSocket4.send(msg); //send()发送消息
                }
            } else {
                return;
            }
        }
    },
    computed: {
        // formatTime() {
        //     if(this.responseData.timestamp){
        //         let formatTime = this.$dateUtil.formatTime(this.responseData.timestamp);
        //         return this.$dateUtil.formatTime(this.responseData.timestamp);
        //     }else {
        //         return '--'
        //     }
        // },
        formatTime: {
            get() {
                if(this.responseData.timestamp){
                    return this.$dateUtil.formatTime(this.responseData.timestamp);
                } else {
                    return '--'
                }
            },
            set() {
                this.$store.commit('SET_FORMATETIME_DATA', this.$dateUtil.formatTime(this.responseData.timestamp));
            }
        },
        warningNum: {
            get() {
                if(this.responseData.warningNum || this.responseData.warningNum == 0){
                    return parseFloat(this.responseData.warningNum).toLocaleString();
                }else {
                    return '--'
                }
            },
            set() {
                this.$store.commit('SET_FORMATETIME_DATA', parseFloat(this.responseData.warningNum).toLocaleString());
            }
        },
        faultNum: {
            get() {
                if(this.responseData.faultNum || this.responseData.faultNum == 0){
                    return parseFloat(this.responseData.faultNum).toLocaleString();
                }else {
                    return '--'
                }
            },
            set(val) {
                this.$store.commit('SET_FORMATETIME_DATA', parseFloat(this.responseData.faultNum).toLocaleString());
            }
        }
    },
    destroyed(){
        //销毁Socket
        this.webSocket1.close();
        this.webSocket2.close();
        this.webSocket3.close();
        this.webSocket4.close();
        this.roadWebSocket1.close();
        }
    }
</script>
<style lang="scss" scoped>
    .perception-road{
        height: 163px;
        width: 315px;
        border: 1px solid #5e5970;
        padding: 5px 6px 6px 6px;
        margin-bottom: 20px;
        .road-word {
            position: relative;
            z-index: 2;
            padding-left: 7px;
        }
        .cross-scan {
          display: block;
          position: relative;
          top: -38px;
          bottom: 20px;
          left: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          z-index: 1;
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
