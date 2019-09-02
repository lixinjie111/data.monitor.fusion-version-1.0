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
      mapOption: {
        resizeEnable: false,
        zoom: 18,
<<<<<<< HEAD
        mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
=======
        mapStyle: ""
>>>>>>> dev
      },
      crossData: {
        roadLights: [], // 红绿灯数据
        roadSenseCars: [], // 车辆数据
        finalFourPosition: [],
        sideVehicleObj: {}, // 地图上画车辆
        sideLight: {} //
      },
      mapPointData: [],
      roadWebSocket: null,
      prevData: {}
    };
  },
  mounted() {
    this.aMap = new AMap.Map(this.id, this.mapOption);
    this.drawRoadMap();
    let test = {};
  },
  methods: {
    drawRoadMap() {
      let position = new AMap.LngLat(
        this.mapRoadData.longitude,
        this.mapRoadData.latitude
      );
<<<<<<< HEAD
      this.wms = new AMap.TileLayer.WMS({
        url: window.config.dlWmsUrl+"geoserver/shanghai_qcc/wms",
        blend: false,
        tileSize: 256,
        params: { LAYERS: "shanghai_qcc:dl_shcsq_wgs84_gjlk", VERSION: "1.1.0" }
      });
=======

      let _optionWms = Object.assign({},window.dlWmsDefaultOption,
        {
            params:{'LAYERS': window.dlWmsOption.LAYERS_gjlk, 'VERSION': window.dlWmsOption.VERSION}
        }
      );
      this.wms = new AMap.TileLayer.WMS(_optionWms);
>>>>>>> dev
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
      //   let mapBounds = new AMap.Bounds(southWest, northEast);
      //   let rectangle = new AMap.Rectangle({
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
      //   });
      //   rectangle.setMap(this.aMap);
      //   this.aMap.setFitView([rectangle]);
      this.crossData.finalFourPosition = finalFourPosition;
      this.initWebsocket();
    },
    // 第一个路段
    initWebsocket() {
      let _this = this;
      if ("WebSocket" in window) {
        _this.roadWebSocket = new WebSocket(window.config.websocketUrl); //获得WebSocket对象
          _this.roadWebSocket.onmessage = _this.onMessage;
          _this.roadWebSocket.onclose = _this.onClose;
          _this.roadWebSocket.onopen = _this.onOpen;
          _this.roadWebSocket.onerror = _this.onError;
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
          _this.crossData.roadLights.map((x, index) => {
            lightPosition = new AMap.LngLat(
              x.position.longitude,
              x.position.latitude
            );
            _this.crossData.roadLights[index].position = lightPosition;
          });
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
                position: [subItem.longitude, subItem.latitude],
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
            };
          });

          for (let id in _this.prevData) {
            if(_filterData[id]) {   //表示有该点，做move
              _filterData[id].marker = _this.prevData[id].marker;
              let _currentCar = _filterData[id];
              _filterData[id].marker.setAngle(_currentCar.heading);
              _filterData[id].marker.moveTo([_currentCar.longitude, _currentCar.latitude], _currentCar.speed);
            } else {   //表示没有该点，做remove
              _this.prevData[id].marker.stopMove();
              _this.aMap.remove(_this.prevData[id].marker);
              delete _this.prevData[id];
            }
          }
          for (let id in _filterData) {
            if(!_this.prevData[id]) {   //表示新增该点，做add
                console.log('_filterData[id].longitude', _filterData[id].longitude);
                _filterData[id].marker = new AMap.Marker({
                  position: [_filterData[id].longitude, _filterData[id].latitude],
                  map: _this.aMap,
                  icon: "static/images/road/car.png",
                  angle: _filterData[id].heading,
                  devId: _filterData[id].devId,
                  zIndex: 1
                });
            }
          }

          _this.prevData = _filterData;

        } else {
          // 返回的数据为空
          let obj = Object.values(_this.prevData);
          for (let key in obj) {
            obj[key].marker.stopMove();
            _this.aMap.remove(obj[key].marker);
            delete obj[key];
          }
        }
      }
    },
    onClose(data) {
      console.log("结束连接");
    },
    onOpen(data) {
      // 获取红绿灯
      let _params = {
        action: "road_real_data",
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
