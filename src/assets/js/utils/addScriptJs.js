/**
 * 添加js文件
 */
class AddScriptJs {
    constructor(){
        this.isload = false;
    }
    static add(id, src, callback) {
        let _dom = document.getElementById(id);
        if(!_dom) {
            let _head = document.getElementsByTagName('head')[0];
            // 创建script标签，引入外部文件
            let _script = document.createElement('script');
            _script.type = 'text/javascript';
            _script.id = id;
            _script.src = src;
            if (_script.addEventListener) {
                _script.addEventListener('load', function () {
                    console.log(src, "加载成功");
                    this.isload = true;
                    callback && typeof callback == 'function' && callback();
                }, false);
            } else if (_script.attachEvent) {
                _script.attachEvent('onreadystatechange', function () {
                    let _target = window.event.srcElement;
                    if (_target.readyState == 'loaded') {
                        console.log(src, "加载成功");
                        this.isload = true;
                        callback && typeof callback == 'function' && callback();
                    }
                });
            }
            _head.appendChild(_script);
        }else {
            callback && typeof callback == 'function' && callback();
        }
    }
}
export default AddScriptJs;
