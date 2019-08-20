let HTTPURL = '';
let DLURL = '';
let ROADURL = '';
let TESTHTTPURL = '';


if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    ROADURL = window.config.roadUrl;
    TESTHTTPURL = window.config.testUrl;
    // console.log("----------"+ROADURL);
}else {
    HTTPURL = window.config.url;
    DLURL = window.config.dlUrl;
    // DLURL = '/apiUrl/';
    ROADURL = window.config.roadUrl;
    TESTHTTPURL = window.config.testUrl;
    // console.log("----------"+ROADURL);
}

export {
	HTTPURL,
	DLURL,
  	ROADURL,
    TESTHTTPURL
}
