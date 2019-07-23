let HTTPURL = '';
let DLURL = '';
let ROADURL = '';
let TESTHTTPURL = '';


if(process.env.NODE_ENV == 'development') { // 开发环境
    HTTPURL = window.cfg.url;
    DLURL = window.cfg.dlUrl;
    // DLURL = '/apiUrl/';
    ROADURL = window.cfg.roadUrl;
    TESTHTTPURL = window.cfg.testUrl;
    console.log("----------"+ROADURL);
}else {
    HTTPURL = window.cfg.url;
    DLURL = window.cfg.dlUrl;
    // DLURL = '/apiUrl/';
    ROADURL = window.cfg.roadUrl;
    TESTHTTPURL = window.cfg.testUrl;
    console.log("----------"+ROADURL);
}

export {
	HTTPURL,
	DLURL,
  	ROADURL,
    TESTHTTPURL
}
