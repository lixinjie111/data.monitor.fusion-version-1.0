window.config = {

    //望京 内网
    // staticUrl: "http://172.17.1.16:9090/", //静态文件路径
    // url: 'http://172.17.1.16:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://172.17.1.16:9090/operateApp/',	//运营平台
    // websocketUrl:'ws://172.17.1.16:49982/mon',  //监控
    // socketUrl:'ws://172.17.1.16:49999/ws',  //影子系统
    // dlUrl: 'http://10.0.1.22:8085/', //迪路
    // dlWmsUrl: 'http://10.0.1.22:8080/', //迪路
    //http://172.17.1.16:9092/icvShadowApp/ws.html  不要给我删掉了！！！

    //望京 外网
    // staticUrl: "http://120.133.21.14:9090/", //静态文件路径
    // url: 'http://120.133.21.14:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://120.133.21.14:9090/operateApp/',	//运营平台
    // websocketUrl:'ws://120.133.21.14:49982/mon',  //监控
    // socketUrl:'ws://172.17.1.16:9999/ws',  //影子系统
    // dlUrl: 'http://117.114.144.227:8085/', //迪路
    // dlWmsUrl: 'http://117.114.144.227:8080/', //迪路

    //测试环境 内网
    // staticUrl: "http://10.0.1.181:9090/", //静态文件路径
    // url: 'http://10.0.1.183:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://10.0.1.181:9090/operateApp/',    //运营平台
    // websocketUrl:'ws://10.0.1.183:49982/mon',  //监控
    // socketUrl:'ws://10.0.1.182:49999/ws',  //影子系统
    // dlUrl: 'http://10.0.1.199:8085/', //迪路
    // dlWmsUrl: 'http://10.0.1.199:8080/', //迪路
    
    //上海正式环境  外网
    staticUrl: "http://116.236.72.204:48080/", //静态文件路径
    url: 'http://116.236.72.206:49093/monPlatApp/', //监控平台
    operateUrl: 'http://116.236.72.204:49090/operateApp/', //运营平台
    websocketUrl:'ws://116.236.72.206:49982/mon',  //监控
    socketUrl:'ws://116.236.72.205:49999/ws',  //影子系统
    dlUrl: 'http://116.236.72.204:48085/', //迪路
    dlWmsUrl: 'http://116.236.72.204:48080/', //迪路

    version: "1.2",       // 版本号
}

//地图额外配置项添加
window.mapOption = {
    center: [121.17265957261286,31.284096076877844],	//上海-高德地图坐标点  感知右下角
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
//3d地图默认参数
window.defaultMapParam = {
    x: 121.1703343194661,
    y: 31.28428377276655,
    z: 16.421176839179324,
    radius: 78.0534223809687,
    pitch: -0.28445655573236484,
    yaw: 0.003034199561255946
};
//地图服务
window.mapUrl=window.config.dlWmsUrl+"geoserver/gwc/service/wmts?layer=shanghai_qcc%3A3dmaptest&style=&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}"
//地图初始化高度
window.defualtZ=0.1; 
window.count=30;//空闲车辆
//默认的地图全区域
window.delayTime = 4;
window.miniExtend = 0.005;
window.extend = 0.02;
window.currentExtent = [[121.158117,31.298408000000002],[121.194117,31.298408000000002],[121.194117,31.262408],[121.158117,31.262408]];
