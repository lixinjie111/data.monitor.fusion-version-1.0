import Vue from 'vue'
import Router from 'vue-router'


/* 默认路由，不要删除 */
const Login = resolve => require(['@/views/login/index'], resolve)
const Home = resolve => require(['@/views/home/index'], resolve)
const Err404 = resolve => require(['@/views/error/404'], resolve)
//重新加载当前路由
const Refresh = resolve => require(['@/views/refresh'], resolve)

const Single = resolve => require(['@/views/single'], resolve)
Vue.use(Router)

export default new Router({
  // mode: 'history',
  linkActiveClass:'is-active',
  routes: [{
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {}
  },{
    path: '*',
    name: '404',
    component: Err404,
    meta: {
      showHeader: true
    }
  },{ 
    path: '/refresh', 
    name: 'Refresh', 
    component: Refresh,
    meta: {}
  },{
      path: '/single',
      name: 'Single',
      component: Single,
      meta: {}
  }],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
