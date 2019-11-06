<template>
    <div class="road-view-map" :id="id"></div>
</template>
<script>
import { getRoadCenterIds, getRoadCenterPoints,getDevDis} from '@/api/overview/index.js';
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
                vehicleId: 'vehicleOnline'
            },
            // responseData: [],
            responseDataDraw: [],
            setFitViewFlag: true,
            count: 0,
            flag: true,
            prevData: [],
            onlineConnectCount:0

        }
    },
    mounted() {
        this.AMap = new AMap.Map(this.id, window.defaultMapOption);
        this.AMap.on('complete',()=>{
            this.AMap.setMapStyle(window.defaultMapOption.mapStyle);
        });

        this.initWebSocket();
        let param = ['2'];
        this.getDevDis(param);
    },
    methods: {
        initWebSocket(){
            // console.log('websocket获取地图行驶车辆展示');
            try{
                if ('WebSocket' in window) {
                    this.webSocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象
                    this.webSocket.onmessage = this.onmessage;
                    this.webSocket.onclose = this.onclose;
                    this.webSocket.onopen = this.onopen;
                    this.webSocket.onerror = this.onerror;
                }else{
                    this.$message("此浏览器不支持websocket");
                }
            }catch (e){
                this.carReconnect();
            }
        },
        onmessage(message){
            let _this = this,
                _json = JSON.parse(message.data),
                _result = _json.result.allVehicle;
            if (_result.length > 0) {
                // console.log(_result.length);
                let _filterData = {};
                _result.forEach((item, index) => {
                    _filterData[item.vehicleId] = {
                        vehicleId: item.vehicleId,
                        plateNo: item.plateNo,
                        source: item.source.join(','),
                        heading: item.heading,
                        speed: item.speed,
                        position: ConvertCoord.wgs84togcj02(item.longitude, item.latitude),
                        marker: null,
                        plateNoMarker: null
                    };
                });
                for (let id in _this.prevData) {
                    if(_filterData[id]) {   //表示有该点，做setPosition
                        // console.log(_this.prevData[id].plateNo, "moveTo");
                        _filterData[id].marker = _this.prevData[id].marker;
                        _filterData[id].plateNoMarker = _this.prevData[id].plateNoMarker;
                        let _currentCar = _filterData[id];
                        _filterData[id].marker.setAngle(_currentCar.heading);
                        _filterData[id].marker.setPosition(_currentCar.position);
                        _filterData[id].plateNoMarker.setText(_currentCar.plateNo+"<br/><span style='color:#e6a23c'>"+_currentCar.source+'</span>')
                        _filterData[id].plateNoMarker.setPosition(_currentCar.position);
                    }else {   //表示没有该点，做remove
                        // console.log(_this.prevData[id].plateNo, "remove");
                        _this.prevData[id].marker.off('click', _this.showView);
                        _this.prevData[id].plateNoMarker.off('click', _this.showView);
                        // _this.prevData[id].marker.stopMove();
                        // _this.prevData[id].plateNoMarker.stopMove();
                        _this.AMap.remove(_this.prevData[id].marker);
                        _this.AMap.remove(_this.prevData[id].plateNoMarker);
                        delete _this.prevData[id];
                    }
                }
                for (let id in _filterData) {
                    if(!_this.prevData[id]) {   //表示新增该点，做add
                        // console.log(_filterData[id].plateNo, "add");
                        _this.addMarker(_filterData[id]);
                        _this.addPlateNoMarker(_filterData[id]);
                    }       
                }

                if(_this.setFitViewFlag) {
                    setTimeout(()=>{
                        _this.AMap.setFitView();
                        _this.setFitViewFlag = false;
                    },500)
                }
                _this.prevData = _filterData;
            } else {
                // 返回的数据为空
                for (let id in _this.prevData) {
                    // console.log("delete:-"+_this.prevData[id].plateNo);
                    _this.prevData[id].marker.off('click', _this.showView);
                    _this.prevData[id].plateNoMarker.off('click', _this.showView);
                    // _this.prevData[id].marker.setMap(null);
                    // _this.prevData[id].plateNoMarker.setMap(null);
                    // _this.prevData[id].marker.stopMove();
                    // _this.prevData[id].plateNoMarker.stopMove();
                    _this.AMap.remove(_this.prevData[id].marker);
                    _this.AMap.remove(_this.prevData[id].plateNoMarker);
                    delete _this.prevData[id];
                }
                // this.prevData = {};
            }
        },
        addMarker(obj) {
            obj.marker = new AMap.Marker({
                map: this.AMap,
                position: obj.position,
                icon: "static/images/car/point.png",
                offset: new AMap.Pixel(-2, -2),
                angle: obj.heading,
                zIndex: 50,
                vehicleId: obj.vehicleId
            });
            obj.marker.on('click', this.showView);
        },
        addPlateNoMarker(obj) {
            obj.plateNoMarker = new AMap.Text({
                map: this.AMap,
                text: obj.plateNo+"<br/><span style='color:#e6a23c'>"+obj.source+'</span>',
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
                position: obj.position,
                vehicleId: obj.vehicleId,
                zIndex: 60
            });
            obj.plateNoMarker.on('click', this.showView);
        },
        // onmessage(message) {
        //     let _json = JSON.parse(message.data),
        //     _result = _json.result.allVehicle;
        //     if (_result.length == 0) {
        //         console.log(_json);
        //         console.log("当前数据为空",this.dateUtil.formatTime(_json.result.time));
        //     }
        //     if (this.flag) {
        //         this.flag = false;
        //         let _responseData = _result.map( item => {
        //             let _option = {
        //                 vehicleId: item.vehicleId,
        //                 plateNo: item.plateNo,
        //                 source: item.source.join(','),
        //                 heading: item.heading,
        //                 // position: new AMap.LngLat(item.longitude, item.latitude)
        //                 position: [item.longitude, item.latitude] // （经度，纬度)
        //             };
        //             return _option;
        //         });
        //         this.changeLngLat(_responseData);
        //     }
        // },
        // changeLngLat(_allPointData) {
        //     let _this = this;
        //     // console.log(_this.count);
        //     // _allPointData.forEach((item, index, arr) => {
        //     for ( let i = 0; i < _allPointData.length; i++) {
        //         // console.log(_allPointData[i].position);
        //         (function(itemIndex){
        //             // 数组中每一项item的position的经纬度转换
        //             let _position = ConvertCoord.wgs84togcj02(_allPointData[itemIndex].position[0], _allPointData[itemIndex].position[1]);
        //             _allPointData[itemIndex].position = _position;
        //             _this.count ++;
        //             if(_this.count == _allPointData.length) {
        //                 //绘制线的轨迹
        //                 _this.drawMarker(_allPointData);
        //             }
        //         })(i);
        //     };
        // },
        // drawMarker(allPointData) {
        //     let _this = this,
        //         _responseDataDrawLength = _this.responseDataDraw.length,
        //         _allPointDataLength = allPointData.length;
        //     if(_responseDataDrawLength > 0) {
        //         for(let m = 0; m < _this.responseDataDraw.length; m++) {
        //             _this.responseDataDraw[m].marker.off('click', _this.showView);
        //             _this.responseDataDraw[m].platNoMarker.off('click', _this.showView);
        //             _this.AMap.remove(_this.responseDataDraw[m].marker);
        //             _this.AMap.remove(_this.responseDataDraw[m].platNoMarker);
        //         }
        //         _this.responseDataDraw = [];
        //     }
        //     for(let i = 0; i < _allPointDataLength; i++) {
        //         let _data = allPointData[i];
        //         if(_data.position) {
        //             let _markerObj = {
        //                 marker: null,
        //                 platNoMarker: null
        //             };
        //             _markerObj.marker = new AMap.Marker({
        //                 map: _this.AMap,
        //                 position: _data.position,
        //                 icon: "static/images/car/point.png",
        //                 offset: new AMap.Pixel(-2, -2),
        //                 angle: _data.heading,
        //                 zIndex: 50,
        //                 vehicleId: _data.vehicleId
        //             });
        //             _markerObj.platNoMarker = new AMap.Text({
        //                 map: _this.AMap,
        //                 text: _data.plateNo+"<br/><span style='color:#e6a23c'>"+_data.source+'</span>',
        //                 // text: '京N123456',
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
        //                 offset: new AMap.Pixel(0, -35),
        //                 position: _data.position,
        //                 vehicleId: _data.vehicleId
        //             });
        //             _markerObj.marker.on('click', _this.showView);
        //             _markerObj.platNoMarker.on('click', _this.showView);

        //             _this.responseDataDraw.push(_markerObj);
        //         }

        //         if(i == _allPointDataLength - 1) {
        //             if(_this.setFitViewFlag) {
        //                 this.AMap.setFitView();
        //                 _this.setFitViewFlag = false;
        //             }
        //             setTimeout(() => {
        //                 _this.count = 0;
        //                 _this.flag = true;
        //                 // console.log("绘制结束--------");
        //             }, 0);
        //         }
        //     }
        // },
        showView(e) {
            /*const { href } = this.$router.resolve({
                name: 'Single',
                params: {
                    vehicleId: e.target.get("vehicleId")
                }
            })
            window.open(href, '_blank')*/
            this.$router.push({
                path: "/single/" + e.target.get("vehicleId")
            });
        },
        onclose(data){
            console.log("vehicleOnline结束连接");
            this.carReconnect();
        },
        onerror(){
            console.log("vehicleOnline连接error");
            this.carReconnect();
        },
        onopen(data){
            // console.log("建立--vehicleOnline--连接");
            //行程
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
        },
        carReconnect(){
            //实例销毁后不进行重连
            if(this._isDestroyed){
                return;
            }
            //重连不能超过10次
            if(this.onlineConnectCount>=10){
                return;
            }
            this.initWebSocket();
            //重连不能超过5次
            this.onlineConnectCount++;
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
                                            path: '/perception/' + subItem.longitude + "/" + subItem.latitude+"/"+subItem.deviceId+ "/"+1+ "/"+false+ "/"+0.002,
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
        this.webSocket&&this.webSocket.close();
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

