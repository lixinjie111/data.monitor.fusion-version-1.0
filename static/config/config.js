window.config = {

  /*  //望京地址  内网
    url: 'http://172.17.1.13:9093/monPlatApp/', //监控平台
    websocketUrl:'ws://172.17.1.13:49982/mon',  //监控
    socketUrl:'ws://172.17.1.13:49999/ws',  //影子系统
    dlUrl: 'http://10.0.1.22:8085/', //迪路
    dlWmsUrl: 'http://10.0.1.22:8080/', //迪路
    roadUrl:'http://172.17.1.13:28080/rCUDataApp/', //临时演示地址*/

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

// ws://120.133.21.14:29998/ws