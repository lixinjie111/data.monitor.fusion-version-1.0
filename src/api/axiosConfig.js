/*import Vue from 'vue'*/
//import axios from 'axios'
import Qs from 'qs'
// Element-ui
// import ElementUI from 'element-ui'

// axios.defaults.withCredentials = true;

// 避免在账号登录失效后提示多次
let isOutLogin = true;
/**
 * axios过滤器
 */
function axiosFilter(vm) {
    // request
    axios.create({
      baseURL: window.config.url,
      // withCredentials: true,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      responseType: 'json',
      transformResponse: [function(data) { //后端发送过来的数据
        // return data;
        return Qs.stringify({
            ...data
        });
      }],
      transformRequest: [function(data) {
        return data;
      }]
    });

     // request 添加请求拦截器 
     axios.interceptors.request.use(
        config => {
            config.cancelToken = window.cancleSource.token;
            return config
        },
        function(error) {
            return Promise.reject(error)
        }
    )
    // response
    axios.interceptors.response.use(function(response) {
        let returnStatus = response.data.status || response.data.code || response.data.state;
        // if(returnStatus) {
            switch (returnStatus+"") {
                case '1': {
                    return Promise.resolve(response);
                    break;
                }
                case '200': {
                    return Promise.resolve(response);
                    break;
                }
                default: {
                    vm.$message({
                        type: 'error',
                        duration: '1500',
                        message: response.data.message || response.data || '操作失败',
                        showClose: true
                    });
                    return Promise.resolve(response);
                }
            }
        // }else {
        //     vm.$message.error(response.data);
        //     return Promise.reject(response);
        // }

    }, function(error) {
        if (axios.isCancel(error)) {
            console.log("请求被取消"+error); //请求如果被取消，这里是返回取消的message
        } else {
            // vm.$message({
            //     type: 'error',
            //     duration: '1500',
            //     message: '网络异常,请稍候重试!',
            //     showClose: true
            // });
        }
        // vm.$message({
        //     type: 'error',
        //     duration: '1500',
        //     message: '网络异常,请稍候重试!',
        //     showClose: true
        // });
        return Promise.reject(error);
    });
}

export default axiosFilter
