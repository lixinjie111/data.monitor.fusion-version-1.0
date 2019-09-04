window.config = {

    // http://172.17.1.16:9092/icvShadowApp/ws.html
  /*  //望京地址  内网
    url: 'http://172.17.1.16:9093/monPlatApp/', //监控平台
    websocketUrl:'ws://172.17.1.16:49982/mon',  //监控
    socketUrl:'ws://172.17.1.16:49999/ws',  //影子系统
    dlUrl: 'http://10.0.1.22:8085/', //迪路
    dlWmsUrl: 'http://10.0.1.22:8080/', //迪路
    roadUrl:'http://172.17.1.16:28080/rCUDataApp/', //临时演示地址*/

    //外网
    url: 'http://120.133.21.14:9093/monPlatApp/', //监控平台
    websocketUrl:'ws://120.133.21.14:49982/mon',  //监控
    socketUrl:'ws://120.133.21.14:49999/ws',  //影子系统
    dlUrl: 'http://113.208.118.62:8085/', //迪路
    dlWmsUrl: 'http://113.208.118.62:8080/', //迪路
    roadUrl:'http://120.133.21.14:28080/rCUDataApp/', //临时演示地址
    monitorWebsocket:'ws://120.133.21.14:29998/ws',
    version: 1.0,       // 版本号
}

//地图额外配置项添加
window.mapOption = {
     center: [121.551976, 31.276054],	//上海-高德地图坐标点  感知右下角
    // center: [113.07876,28.255618],	//长沙-高德地图坐标点
    mapStyleEmpty: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00", // 纯灰色背景地图
};
//单车
window.defaultMapOption = {
    center: window.mapOption.center, //上海
    zoom: 11,		// 默认：比例尺显示100m
    resizeEnable: true, //是否监控地图容器尺寸变化
    rotateEnable: true,
    mapStyle: "amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8"
}

// 调用
// this.distanceMap = new AMap.Map('map-container', window.defaultMapOption);
// let _option = Object.assign(
// 	{},
// 	window.defaultMapOption,
// 	{
// 		mapStyle: window.mapOption.mapStyleEmpty
// 	}
// );
// this.distanceMap = new AMap.Map('map-container', _option);



//路网配置参数
window.dlWmsOption = {
    'LAYERS_gjlk': 'shanghai_qcc:dl_shcsq_wgs84_gjlk',
    'LAYERS_withoutz': 'shanghai_qcc:dl_shcsq_wgs84_rc_withoutz',
    'VERSION':'1.1.0',
    'GD_ROAD_CENTERLINE':'gd_road_centerline',

    'LAYERS_centerline': 'shanghai_qcc:dl_shcsq_wgs84_lane_centerline',
    'STYLES':'shanghai_qcc:dl_shcsq_wgs84_road_centerline_car_statistics',

}
window.dlWmsDefaultOption = {
    url:window.config.dlWmsUrl+'geoserver/shanghai_qcc/wms',
    blend: false,
    tileSize: 256,
    params:{}
}
//	调用
// let _optionWms = Object.assign(
// 	{},
// 	window.dlWmsDefaultOption,
// 	{
// 		params:{'LAYERS': window.dlWmsOption.LAYERS_centerline,'STYLES': window.dlWmsOption.STYLES, 'VERSION': window.dlWmsOption.VERSION}
// 	}
// );
// this.wms = new AMap.TileLayer.WMS(_optionWms);
// this.distanceMap.add(this.wms);


// ws://120.133.21.14:29998/ws