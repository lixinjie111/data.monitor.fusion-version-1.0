<template>
  <div>
    <div :id="id" class="road-scan"></div>
  </div>
</template>
<script>
    export default {
        props: {
            id:{
                type:String,
                default:''
            } ,
            mapData: {
                type:Object,
                default(){
                    return {

                    };
                }
            },
            processTime:{
                type:String,
                default:''
            } ,
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

                pulseLastTime :'',
                pulseFilterTime:'',
                pulseNowTime:'',

                platObj:{},
                pulseStart:this.$parent.pulseStart,
           }
        },
        watch: {
            '$parent.pulseStart': {
                handler(newValue,oldValue) {
                    if(newValue){
                        console.log("启动路口")
                        this.drawRoadMap();
                    }
                },
//                immediate: true,
//                deep: true
            },
            '$parent.drawStart': {
                handler(newValue,oldValue) {
                    if(newValue){

                    }
                },
//                immediate: true,
//                deep: true
            }
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
//            this.drawRoadMap();
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
//                        _this.carWebSocket = new WebSocket(window.config.websocketUrl); //获得WebSocket对象
                        _this.carWebSocket = new WebSocket(window.config.socketTestUrl); //获得WebSocket对象
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
                let data = jsonData.result.data;
                let _filterData = {};
                for(let vehicleId in data){
                    let cdata = this.platObj[vehicleId];
                    if(cdata==null){
                        cdata = new Array();
                    }
                    this.platObj[vehicleId] = Array.prototype.push.apply(cdata,data[vehicleId]);
                }
                /*for(let vehicleId in data){
                    if(data[vehicleId]&&data[vehicleId].length>0){
                        _filterData[vehicleId] = data[vehicleId][0];
                        _filterData[vehicleId].marker=null;
                    }
                }*/
                // 车辆
             /*   if ("vehDataDTO" in result === true) {
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
                }*/
            },
            getMinValue(vid){
                let cacheData = this.platObj[vid];
                let rangeData=null;
                let startIndex=-1;
                // console.log("找到最小值前："+cacheData.length);
                //找到满足条件的范围
                for(let i=0;i<cacheData.length;i++){
                    let diff = Math.abs(this.processTime-cacheData[i].gpsTime);
                    console.log(vid,cacheData.length,this.processTime,parseInt(cacheData[i].gpsTime),diff,i)
                    if(diff<this.pulseInterval){
                        if(startIndex !=-1 && i != startIndex+1) {
                            break;
                        }
                        if(!rangeData || (rangeData && diff < rangeData.delayTime)) {
                            startIndex=i;
                            let obj={
                                index:i,
                                delayTime: diff,
                                data:cacheData[i]
                            }
                            rangeData = obj;
                        }else {
                            break;
                        }
                    }else {
                        if(rangeData) {
                            break;
                        }
                    }
                }
                let minIndex=-1;
                let minData = {};
                let minDiff;
                //如果能找到最小范围
                console.log(rangeData)
                if(rangeData){
                    minIndex = rangeData.index;
                    minData = rangeData.data;
                }else{
                    console.log("plat***********************");
                    minIndex = 0;
                    minData = cacheData[0];
                    minDiff = Math.abs(this.processTime-minData.gpsTime);
                    for(let i=0;i<cacheData.length;i++){
                        let diff = Math.abs(this.processTime-parseInt(cacheData[i].gpsTime));
                        // let diff = time-cacheData[i].gpsTime-insertTime;
                        // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
                        if(diff<minDiff){
                            minData = cacheData[i];
                            minIndex = i;
                        }

                    }
                }
                console.log("最小索引:"+minIndex);
                if (minDiff&&minDiff>this.platMaxValue){
                    console.log("plat找到最小值无效")
                    return;
                }
                //打印出被舍弃的点
                let lostData = this.platObj[vid].filter((item,index)=>{
                    return index<minIndex;
                })
                /*if(lostData.length>0){
                    debugger
                }*/
                lostData.forEach(item=>{
                    let minDiff = Math.abs(this.processTime-cacheData[minIndex].gpsTime);
                    // console.log("插值最小的索引"+minIndex,minDiff);
                    let d =  Math.abs(this.processTime-item.gpsTime);
                    // console.log("##"+d);
                })


                //找到最小值后，将数据之前的数值清除
                this.platObj[vid] = this.platObj[vid].filter((item,index)=>{
                    return index>minIndex;
                })
                console.log("找到最小值后"+this.platObj[vid].length);

                //返回距离标尺的最小插值的数据
                return minData;
            },
            processPlatData(){
                if(Object.keys(this.platObj).length>0){
                    for(let vehicleId in this.platObj){
                        let cardata = this.getMinValue(vehicleId);
                        if(!cardata){
                            return;
                        }
                        this.moveCar(cardata);
                    }
                }else {
                    console.log("没有平台车数据")
                }
            },
            moveCar(cardata){
                let _this = this;
                let _filterData={};
                let id = cardata.vehicleId;
                //新增的点
                if(!_this.prevData[id]){
                    _this.prevData[id].marker = new AMap.Marker({
                        position: [cardata.longitude, cardata.latitude],
                        map: _this.aMap,
                        icon: "static/images/road/car.png",
                        angle: cardata.heading,
                        devId: cardata.devId,
                        offset:new AMap.Pixel(-4, -9),
                        zIndex: 1
                    });
                    _this.prevData[id].timer=setTimeout(()=>{
                        _this.aMap.remove(_this.prevData[id].marker);
                        delete _this.prevData[id];
                    },2000)
                }else{//如果存在该车
                    _this.prevData[id].marker.setPosition([cardata.longitude, cardata.latitude]);
                    _this.prevData[id].marker.setAngle(cardata.heading);
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
                let _params ={
                    "action": "vehicle",
                    "body": {
                        polygon: this.crossData.finalFourPosition,
                    },
                    "type": 3
                }
//                let _params = {
//                    action: "road_real_data_reg",
//                    data: {
//                        polygon: this.crossData.finalFourPosition,
//                        fuselType: 1
//                    }
//                };
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
            },

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