/*import Vue from 'vue'*/
import App from './App'
import router from './router'
import store from './store';
// 时间戳转时间
import TDate from '@/utils/date.js'
Vue.prototype.$dateUtil = TDate;

// 全局静态资源
import './assets/css/reset.css';
import './assets/scss/public.scss';


//导入video.js
import VideoPlayer  from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import 'videojs-flash'

Vue.use(VideoPlayer);

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 设置页面切换进度条
NProgress.inc(0.2)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

Vue.config.productionTip = false;

// 权限
import { setAuthInfo, getAdminId, getAuthInfo, removeAuthInfo } from '@/session/index';
// 在免登录白名单，直接进入
const whiteList = ['/login','/404'];
// setAuthInfo({
//     adminName: "********",
//     adminId: "********"
// });
// removeAuthInfo();
// router global config
router.beforeEach((to,from,next) => {
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
import axiosFilter from './api/axiosConfig.js';
axiosFilter(vm);