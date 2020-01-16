let HTTPURL = '';
let DLURL = '';
let OPERATEURL = '';
let TRAFFICURL = '';


if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
    TRAFFICURL = window.config.trafficUrl;
}else {
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
    TRAFFICURL = window.config.trafficUrl;
}

export {
	HTTPURL,
	DLURL,
    OPERATEURL,
    TRAFFICURL
}
