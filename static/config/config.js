window.config = {
    //长沙 测试地址
    // url: 'http://111.23.140.59:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://111.23.140.59:9090/operateApp/', //运营平台
    // websocketUrl:'ws://111.23.140.59:9982/mon',  //监控
    // socketUrl:'ws://111.23.140.59:9999/ws',  //影子系统
    // dlUrl: 'http://218.76.44.22:8085/', //迪路
    // dlWmsUrl: 'http://218.76.44.22:48080/', //迪路

    //长沙 正式地址
    url: 'http://218.76.44.22:9093/monPlatApp/', //监控平台
    operateUrl: 'http://218.76.44.22:9090/operateApp/', //运营平台
    websocketUrl:'ws://218.76.44.22:9982/mon',  //监控
    socketUrl:'ws://218.76.44.22:9999/ws',  //影子系统
    dlUrl: 'http://218.76.44.22:8085/', //迪路
    dlWmsUrl: 'http://218.76.44.22:48080/', //迪路

    version: 1.0,       // 版本号
}

//地图额外配置项添加
window.mapOption = {
     // center: [121.551976, 31.276054],	//上海-高德地图坐标点  感知右下角
    // center: [113.07876,28.255618], // 长沙市中心点 -- 高德地图坐标点
    // center: [112.857703,28.20041], // 长沙0920演示 -- 高德地图坐标点
    // center: [112.8522728197584,28.2039102472322], // 长沙0920演示 -- gps坐标点
    center: [113.00739171981809,28.21220959243717], // 长沙 -- 高德地图坐标点
// center: [113.0130624858725, 28.20888036847823], // 长沙 -- gps坐标点
    mapStyleEmpty: "amap://styles/3e9326410a47bb37df6cd0c4f74ea976", // 纯灰色背景地图
};
//单车
window.defaultMapOption = {
    center: window.mapOption.center, //上海
    zoom: 11,		// 默认：比例尺显示100m
    resizeEnable: true, //是否监控地图容器尺寸变化
    rotateEnable: true,
    mapStyle: "amap://styles/7a893466c58601035af135907c163385"
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

window.circleParam = {
    redius: 17000,
    center: [692384,3122050,13.618],
    color: "#000",
    outline: false,
    outlineColor: "#ff0000",
    opacity: 0.1,
    rotate: [0, 0, 0]
};

window.mapParam={
    minX: 694986.6877441636,
    minY: 3134299.1691652327,
    minZ: 17657.736291098932,
    maxX: 695986.6877441636,
    maxY: 3135874.0,
    maxZ: 17757.736291098932,
    background: "black"
};

window.defaultMapParam = {
    x:695789.386349502,
    y:3121338.7382139494,
    z:36493.00646310004,
    radius:36783.216059128914,
    pitch:-1.5707963267948966,
    yaw:-0.16236538804906267
}

window.defaultSingleParam = {
    x:695789.386349502,
    y:3121338.7382139494,
    z:36493.00646310004,
    radius:36783.216059128914,
    pitch:-1.5707963267948966,
    yaw:-0.16236538804906267
}

window.defaultRoadParam={
    z:36493.00646310004,
    radius:36783.216059128914,
    pitch:-1.5707963267948966,
    yaw:-0.16236538804906267
}

window.currentExtent=[window.mapOption.center,window.mapOption.center,window.mapOption.center,window.mapOption.center];