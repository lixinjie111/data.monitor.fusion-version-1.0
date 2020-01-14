let HTTPURL = '';
let DLURL = '';
let OPERATEURL = '';


if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
}else {
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
}

export {
	HTTPURL,
	DLURL,
    OPERATEURL
}
