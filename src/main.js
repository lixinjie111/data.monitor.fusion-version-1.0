/*import Vue from 'vue'*/
import App from './App'
import router from './router'
import store from './store';
// 时间戳转时间
import TDate from '@/utils/date.js'
Vue.prototype.$dateUtil = TDate;



//elementui 导入
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 全局静态资源
import './assets/scss/reset.scss';
import './assets/scss/public.scss';
import './assets/icon-font/iconfont.css';

Vue.use(ElementUI);
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 设置页面切换进度条
NProgress.inc(0.2)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

Vue.config.productionTip = false;

// 模糊查询封装
import SearchFilter from '@/assets/js/module/searchFilter.js'
Vue.prototype.$searchFilter = SearchFilter;

// 权限
import { setAuthInfo, getAdminId, getAuthInfo, removeAuthInfo } from '@/session/index';
// 在免登录白名单，直接进入
const whiteList = ['/login','/404'];
// setAuthInfo({
//     adminName: "********",
//     adminId: "********"
// });
// removeAuthInfo();
// axios 过滤器
import  axiosFilter from './api/axiosConfig.js';

//取消请求的对象
window.cancleSource={};
window.cancelToken = axios.CancelToken;
// 路由拦截器
router.beforeEach((to, from, next) => {
    window.cancleSource.cancel && window.cancleSource.cancel();
    window.cancleSource = window.cancelToken.source();
    NProgress.start()
    // _hmt.push(['_trackPageview', to.fullPath]);
    const ADMINID = getAdminId();
    if(ADMINID) {
        // 回填用户信息
        store.dispatch('setAuthInfo', getAuthInfo());
        if(to.path === '/login') {
            next({path: '/overview'});
        }else {
            next();
        }
    }else {
        if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
            next()
        } else {
            next('/login'); // 否则全部重定向到登录页
        }
        NProgress.done()
    }
})

router.afterEach(() => {
    NProgress.done()
})
/* eslint-disable no-new */
const vm = new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
});
// axios 过滤器
axiosFilter(vm);