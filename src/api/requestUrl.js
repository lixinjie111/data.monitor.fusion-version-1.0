let HTTPURL = '';
let DLURL = '';
let OPERATEURL = '';
let TESTHTTPURL = '';


if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
    TESTHTTPURL = window.config.testUrl;
}else {
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    OPERATEURL = window.config.operateUrl;
    TESTHTTPURL = window.config.testUrl;
}

export {
	HTTPURL,
	DLURL,
    OPERATEURL,
    TESTHTTPURL
}
