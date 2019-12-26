<template>
    <div class="road-view-map" :id="id"></div>
</template>
<script>
    import { getRoadCenterIds, getRoadCenterPoints,getDevDis} from '@/api/overview/index.js';
    import ConvertCoord from '@/assets/js/coordConvert.js'
    import WebSocketObj from '@/assets/js/webSocket.js'
    export default {
        name: "MapContainer",
        data () {
            return {
                id: "car-map-container",
                AMap: null,
                // 获取在驶车辆实时数据（辆）
                webSocket:null,
                webSocketData: {
                    "action": "vehicle",
                    "type": 4
                },
                // responseData: [],
                responseDataDraw: [],
                setFitViewFlag: true,
                count: 0,
                flag: true,
                prevData: [],
                timeOut:3000
            }
        },
        mounted() {
            this.AMap = new AMap.Map(this.id, window.defaultMapOption);
            this.AMap.on('complete',()=>{
                this.AMap.setMapStyle(window.defaultMapOption.mapStyle);
            });

            this.initWebSocket();

            if(sessionStorage.getItem("sideList")) {
                let param = ['2'];
                this.getDevDis(param);
            }
        },
        methods: {
            initWebSocket(){
                this.webSocket = new WebSocketObj(this, window.config.socketUrl, this.webSocketData, this.onmessage);
            },
            onmessage(message){
                let _this = this;
                let jsonData = JSON.parse(message.data);

                let data = jsonData.result.data;
                let _result = {};
                let _filterData = {};
                for(let vehicleId in data){
                    if(data[vehicleId]&&data[vehicleId].length>0){
                        _result[vehicleId] = data[vehicleId][data[vehicleId].length-1];
                        _filterData[vehicleId] = {
                            vehicleId: _result[vehicleId].vehicleId,
                            plateNo: _result[vehicleId].plateNo,
                            source: _result[vehicleId].source.join(','),
                            heading: _result[vehicleId].heading,
                            speed: _result[vehicleId].speed,
                            position: ConvertCoord.wgs84togcj02(_result[vehicleId].longitude, _result[vehicleId].latitude),
                            marker: null,
                            plateNoMarker: null,
                        };
                    }
                }
                if (Object.keys(_filterData).length>0) {
                    for (let id in _this.prevData) {
                        if(_filterData[id]) {   //表示有该点，做setPosition
                            if(_this.prevData[id].timer){
                                clearTimeout(_this.prevData[id].timer)
                            }
                            let _currentCar = _filterData[id];
                            _this.prevData[id].marker.setAngle(_currentCar.heading);
                            _this.prevData[id].marker.setPosition(_currentCar.position);
                            _this.prevData[id].plateNoMarker.setText(_currentCar.plateNo+"<br/><span style='color:#e6a23c'>"+_currentCar.source+'</span>');
                            _this.prevData[id].plateNoMarker.setPosition(_currentCar.position);
                        }
                    }
                    for (let id in _filterData) {
                        if(!_this.prevData[id]) {   //表示新增该点，做add
                            _this.addMarker(id,_filterData);
                            _this.addPlateNoMarker(id,_filterData);
                            _this.$parent.onlineCount++;
                        }
                    }

                    if(_this.setFitViewFlag) {
                        setTimeout(()=>{
                            _this.AMap.setFitView();
                            _this.setFitViewFlag = false;
                        },500)
                    }


                    // _this.prevData[_filterData.vehicleId] = _filterData;
                    // console.log(_this.prevData)
                    for(let vehicleId in data){
                        _this.prevData[vehicleId].timer = setTimeout(() => {
                           // _this.prevData[vehicleId].plateNoMarker.setText(data[vehicleId][0].plateNo+"<br/><span style='color:red'>离线</span>")
                            //3s后消失
                            _this.prevData[vehicleId].marker.off('click', _this.showView);
                            _this.prevData[vehicleId].plateNoMarker.off('click', _this.showView);
                            _this.AMap.remove(_this.prevData[vehicleId].marker);
                            _this.AMap.remove(_this.prevData[vehicleId].plateNoMarker);
                            console.log("消失车辆",vehicleId)
                            delete _this.prevData[vehicleId];
                            _this.$parent.onlineCount--;
                        }, this.timeOut);
                    }
                // } else {
                //     // 返回的数据为空
                //     for (let id in _this.prevData) {
                //         // console.log("delete:-"+_this.prevData[id].plateNo);
                //         _this.prevData[id].marker.off('click', _this.showView);
                //         _this.prevData[id].plateNoMarker.off('click', _this.showView);
                //         _this.AMap.remove(_this.prevData[id].marker);
                //         _this.AMap.remove(_this.prevData[id].plateNoMarker);
                //         delete _this.prevData[id];
                //     }
                }
            },
            addMarker(id,_filterData) {
                this.prevData[id] = new Object();
                this.prevData[id].marker = new AMap.Marker({
                    map: this.AMap,
                    position: _filterData[id].position,
                    icon: "static/images/car/point.png",
                    offset: new AMap.Pixel(-2, -2),
                    angle: _filterData[id].heading,
                    zIndex: 50,
                    vehicleId: _filterData[id].vehicleId
                });
                /*this.prevData[id] = new Object();
                this.prevData[id].marker = marker;*/
                this.prevData[id].marker.on('click', this.showView);
            },
            addPlateNoMarker(id,_filterData) {
                this.prevData[id].plateNoMarker = new AMap.Text({
                    map: this.AMap,
                    text: _filterData[id].plateNo+"<br/><span style='color:#e6a23c'>"+_filterData[id].source+'</span>',
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
                    offset: new AMap.Pixel(0, -35),
                    position: _filterData[id].position,
                    vehicleId: _filterData[id].vehicleId,
                    zIndex: 60
                });
                this.prevData[id].plateNoMarker.on('click', this.showView);
            },
            showView(e) {
                /*const { href } = this.$router.resolve({
                    name: 'Single',
                    params: {
                        vehicleId: e.target.get("vehicleId")
                    }
                })
                window.open(href, '_blank')*/
                this.$router.push({
                    path: "/single/" + e.target.get("vehicleId"),
                    query:{delayTime:4}
                });
            },
            getDevDis(disParams){
                getDevDis({
                    'devTypes': disParams,
                }).then(res => {
                    this.deviceMap(res.data);
                    sessionStorage.setItem("sideList",JSON.stringify(res.data));
                });
            },
            deviceMap(data){
                let _this = this;
                if(_this.count==0){
                    if(data.length>0) {
                        let resultData=[];
                        data.forEach(item=>{
                            let option;
                            if(item.longitude|| item.latitude){
                                option={
                                    position:new AMap.LngLat(item.longitude, item.latitude),
                                    type:item.type,
                                    deviceId:item.deviceId,
                                    path:item.path,
                                    longitude:item.longitude,
                                    latitude:item.latitude,
                                    title:item.devName,
//                                id:item.deviceId,
//                                name:item.devName,
//                                lnglat:ConvertCoord.wgs84togcj02(item.longitude, item.latitude)
                                }
                                resultData.push(option);
                            }
                        });
                        //转成高德地图的坐标
                        resultData.forEach((item, index, arr)=>{
                            resultData[index].position = ConvertCoord.wgs84togcj02(item.longitude, item.latitude);
                            _this.count ++;
                            if(_this.count == arr.length) {
                                //绘制线的轨迹
                                resultData.forEach(function (subItem,subIndex) {
                                    //路侧点
                                    if(subItem.type==2){
                                        let marker = new AMap.Marker({
                                            position: subItem.position,
                                            icon: 'static/images/road/side.png', // 添加 Icon 图标 URL
                                            offset:new AMap.Pixel(-15, -15),
                                            title:subItem.title
                                        });
                                        _this.AMap.add(marker);
                                        let item={
                                            path:subItem.path,
                                            roadSiderId:subItem.deviceId,
                                            camSerialNum:"",
                                            target:'map'
                                        }
                                        marker.on('click', function(e) {
                                            _this.$router.push({
                                                path: '/perception/'+subItem.deviceId+ "/"+4+ "/"+0.005+"/"+true,
                                                query:{lng:subItem.longitude,lat:subItem.latitude,isShow:false}
                                            });
                                        });
                                    }
                                    //绘制完后，重新设置
                                    if(subIndex==resultData.length-1){
                                        _this.AMap.setFitView();
//                                    _this.AMap.setZoom(_this.AMap.getZoom()-2);
                                        _this.count=0;
                                    }
                                })
                            }
                            /*}
                          });*/
                        })
                        /* let style = {
                             url: 'static/images/road/side.png',
                             anchor: new AMap.Pixel(15, 15),
                             size: new AMap.Size(30, 30)
                         }
                          let mass = new AMap.MassMarks(resultData, {
                              opacity: 0.8,
                              zIndex: 111,
                              cursor: 'pointer',
                              style: style
                          });
                         mass.setMap(_this.AMap);


                          let marker = new AMap.Marker({content: ' ', map: _this.AMap, offset: new AMap.Pixel(10, 0)});
                          marker.hide();
                          mass.on('mouseover', function (e) {
                              marker.setPosition(e.data.lnglat);
                              marker.setLabel({content: e.data.name,direction:'bottom', offset: new AMap.Pixel(10, -15)});
                              marker.show();

                          });

                          mass.on('mouseout', function (e) {
                              marker.hide();
      //                        marker.setPosition(e.data.lnglat);
      //                        marker.setLabel({content: e.data.name});

                          });
                          mass.on('click', function (e) {
                              _this.$router.push({
                                  path: '/perception/' +e.data.lnglat.lng + "/" +e.data.lnglat.lat+"/"+e.data.id+ "/"+1+ "/"+false+ "/"+0.002+"/"+true,
                              });
                          });
      */
                    }
                }
            },
        },
        destroyed(){
            //销毁Socket
            this.webSocket&&this.webSocket.webSocket.close();
            for(let vehicleId in this.prevData){
                clearTimeout(this.prevData[vehicleId].timer);
            }
        }
    }
</script>
<style>
    .road-view-map .amap-container img{
        cursor: pointer;
    }
    .road-view-map .amap-marker-label{
        border:1px solid #ccc!important;
        color: #2a2a2a!important;
        min-width: 110px;
        text-align: center;
    }
</style>
<style scoped lang="scss">
    .road-view-map{
        height: 100%;
        width: 100%;
        z-index: -2;
    }
</style>

