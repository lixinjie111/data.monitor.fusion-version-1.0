<template>
  <div class="fusion-right-style">
        <div class="map-right">
            <div class="base-info">
                <span>2019-09-23 08:00:00</span>
                <img src="@/assets/images/weather/default.png" class="weather-icon"/>
                <span>15.6°</span>
            </div>
            <div class="perception-road">
              <div style="padding-left: 7px">
                  <p @click="queryCrossDetail(cross1)">路口：{{cross1.crossId}}</p>
              </div>
              <div id="map1" class="cross-scan"></div>
            </div>
            <div class="perception-road">
              <div style="padding-left: 7px">
                  <p @click="queryCrossDetail(cross2)">路口：{{cross2.crossId}}</p>
              </div>
              <div id="map2" class="cross-scan"></div>
            </div>
            <div class="perception-road">
              <div style="padding-left: 7px">
                  <p @click="queryCrossDetail(cross3)">路口：{{cross3.crossId}}</p>
              </div>
              <div id="map3" class="cross-scan"></div>
            </div>
            <div class="perception-road">
              <div style="padding-left: 7px">
                  <p @click="queryCrossDetail(cross4)">路口：{{cross4.crossId}}</p>
              </div>
              <div id="map4" class="cross-scan"></div>
            </div>
        </div>
    </div>
</template>
<script>
  import {typeCross} from '@/api/overview/index.js';
  // import ConvertCoord from '@/assets/js/utils/coordConvert.js'
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
                center: [121.262939,31.245149],
                zoom: 18,
                mapStyle: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00"
              },
              webSocket1:{},
              webSocket2:{},
              webSocket3:{},
              webSocket4:{},
              map1List:[],
              map2List:[],
              map3List:[],
              map4List:[],
              count1:0,
              count2:0,
              count3:0,
              count4:0,
            }
        },
        methods: {
          queryCrossDetail(item) {
            var _this = this;
            this.dialogVisible = true;
            this.$emit("queryCrossDetail",item);
            /*_this.selectedItem = item;
            */
          },
          getTypeCross(){
            typeCross().then(res=>{
              let result = res.data;
              console.log('result --- 路口数据', result);
              let baseData;
              let position;
              let wms;
              result.forEach((obj,index)=>{
                baseData = obj.baseData;
                position = new AMap.LngLat(baseData.x,baseData.y);
//                position = ConvertCoord.wgs84togcj02(baseData.x,baseData.y);
                wms  = new AMap.TileLayer.WMS({
                  url:'http://10.0.1.22:8080/geoserver/shanghai_qcc/wms',
                  blend: false,
                  tileSize: 256,
                  params:{'LAYERS': 'shanghai_qcc:dl_shcsq_wgs84_gjlk',VERSION:'1.1.0'}
                })
                if(index==0){
                  this.cross1 = obj;
                  wms.setMap(this.map1);
                  //将坐标点转换成高德的位置
                  this.map1.setCenter(position);
                  this.map1.setZoom(18);
                  this.initWebSocket1();
                }
                if(index==1){
                  this.cross2 = obj;
                  wms.setMap(this.map2);
                  this.map2.setCenter(position);
                  this.map2.setZoom(18);
                  this.initWebSocket2();
                }
                if(index==2){
                  this.cross3 = obj;
                  wms.setMap(this.map3);
                  this.map3.setCenter(position);
                  this.map3.setZoom(18);
                  this.initWebSocket3();
                }
                if(index==3){
                  this.cross4 = obj;
                  wms.setMap(this.map4);
                  this.map4.setCenter(position);
                  this.map4.setZoom(18);
                  this.initWebSocket4();
                }

              });
            });
          },
          initWebSocket1(){
            let _this=this;
            if ('WebSocket' in window) {
              _this.webSocket1 = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            _this.webSocket1.onmessage = _this.onmessage1;
            _this.webSocket1.onclose = _this.onclose1;
            _this.webSocket1.onopen = _this.onopen1;
            _this.webSocket1.onerror = _this.onerror1;
          },
          onmessage1(mesasge){
            let _this=this;
            let json = JSON.parse(mesasge.data);
            let result = json.result.vehData;
            let position;
            if(_this.count1==0){
              //在接受请求前清除地图上的点
              _this.map1.remove(_this.map1List);
              _this.map1List=[];
              result.forEach(item =>{
                position = new AMap.LngLat(item.longitude,item.latitude);
//                position = ConvertCoord.wgs84togcj02(item.longitude,item.latitude);
                _this.count1++;
                let marker = new AMap.Marker({
                  position: position,
                  icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
                  angle: item.heading,
                  offset:new AMap.Pixel(-8, -16)
                });
                _this.map1.add(marker);
                _this.map1List.push(marker);

              });
              if(this.count1==result.length){
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
//                position = ConvertCoord.wgs84togcj02(item.longitude, item.latitude);
                _this.count2++;
                let marker = new AMap.Marker({
                  position: position,
                  icon: 'static/images/road/car.png', // 添加 Icon 图标 URL
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
//                position = ConvertCoord.wgs84togcj02(item.longitude, item.latitude);
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
//                position = ConvertCoord.wgs84togcj02(item.longitude, item.latitude);
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
            if(window.WebSocket){
              if(_this.webSocket4.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                _this.webSocket4.send(msg); //send()发送消息
              }
            }else{
              return;
            }
          }
        },
       watch:{
       },
        mounted() {
          this.map1 = new AMap.Map('map1', this.mapOption);
          this.map2 = new AMap.Map('map2', this.mapOption);
          this.map3 = new AMap.Map('map3', this.mapOption);
          this.map4 = new AMap.Map('map4', this.mapOption);
          this.getTypeCross();
        },
      destroyed(){
        //销毁Socket
        this.webSocket1.close();
        this.webSocket2.close();
        this.webSocket3.close();
        this.webSocket4.close();

      }
    }
</script>
<style lang="scss" scoped>
    .perception-road{
        height: 163px;
        width: 315px;
        // position: relative;
        border: 1px solid #5e5970;
        // margin-right: 30px;
        // right: 26px;
        padding: 5px 6px 6px 6px;
        margin-bottom: 20px;
        .cross-scan {
          display: block;
          position: relative;
          top: -38px;
          bottom: 20px;
          left: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
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
