window.config = {

    //雄安 外网地址
    url: 'http://144.7.122.84:9093/monPlatApp/', //监控平台
    operateUrl: 'http://144.7.122.84:9090/operateApp/', //运营平台
    websocketUrl:'ws://144.7.122.84:9982/mon',  //监控
    socketUrl:'ws://144.7.122.19:9999/ws',  //影子系统
    dlUrl: 'http://144.7.122.19:8085/', //迪路
    dlWmsUrl: 'http://144.7.122.89:8080/', //迪路

    version: 1.0,       // 版本号
}

//地图额外配置项添加
window.mapOption = {
    center: [112.857703,28.20041], // 雄安 -- 高德地图坐标点
    mapStyleEmpty: "amap://styles/bc5a63d154ee0a5221a1ee7197607a00", // 纯灰色背景地图
};
//单车
window.defaultMapOption = {
    center: window.mapOption.center,
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