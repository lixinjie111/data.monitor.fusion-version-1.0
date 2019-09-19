window.config = {
    
    //望京 内网
    // url: 'http://172.17.1.16:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://172.17.1.16:9090/operateApp/',	//运营平台
    // websocketUrl:'ws://172.17.1.16:49982/mon',  //监控
    // socketUrl:'ws://172.17.1.16:49999/ws',  //影子系统
    // dlUrl: 'http://10.0.1.22:8085/', //迪路
    // dlWmsUrl: 'http://10.0.1.22:8080/', //迪路
    //http://172.17.1.16:9092/icvShadowApp/ws.html  不要给我删掉了！！！

    //望京 外网
    url: 'http://120.133.21.14:9093/monPlatApp/', //监控平台
    operateUrl: 'http://120.133.21.14:9090/operateApp/',	//运营平台
    websocketUrl:'ws://120.133.21.14:49982/mon',  //监控
    socketUrl:'ws://120.133.21.14:49999/ws',  //影子系统
    dlUrl: 'http://113.208.118.62:8085/', //迪路
    dlWmsUrl: 'http://113.208.118.62:8080/', //迪路
    
    //上海正式环境  内网-IP
    // url: 'http://172.16.1.199:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://172.16.1.197:9090/operateApp/', //运营平台
    // websocketUrl:'ws://172.16.1.199:9982/mon',  //监控
    // socketUrl:'ws://172.16.1.198:9999/ws',  //影子系统
    // dlUrl: 'http://172.16.1.197:8085/', //迪路
    // dlWmsUrl: 'http://172.16.1.197:8080/', //迪路

    //上海正式环境  内网-主机名
    // url: 'http://app03:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://app01:9090/operateApp/', //运营平台
    // websocketUrl:'ws://app03:9982/mon',  //监控
    // socketUrl:'ws://app02:9999/ws',  //影子系统
    // dlUrl: 'http://app01:8085/', //迪路
    // dlWmsUrl: 'http://app01:8080/', //迪路

    //上海正式环境  外网
    // url: 'http://116.236.72.206:49093/monPlatApp/', //监控平台
    // operateUrl: 'http://116.236.72.204:49090/operateApp/', //运营平台
    // websocketUrl:'ws://116.236.72.206:49982/mon',  //监控
    // socketUrl:'ws://116.236.72.205:49999/ws',  //影子系统
    // dlUrl: 'http://116.236.72.204:48085/', //迪路
    // dlWmsUrl: 'http://116.236.72.204:48080/', //迪路

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
//天气
window.weatherCenter={
    center:[121.17265957261286,31.284096076877844]
}

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
<<<<<<< HEAD
}
=======
}

window.mapParam={
    minX:325295.155400,
    minY:3461941.703700,
    minZ:50,
    maxX:326681.125700,
    maxY:3462723.022400,
    maxZ:80,
    background:"black"
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
>>>>>>> dev
