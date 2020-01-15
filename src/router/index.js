/*import Vue from 'vue'
import Router from 'vue-router'*/


/* 默认路由，不要删除 */
const Login = resolve => require(['@/views/login/index'], resolve)
const Home = resolve => require(['@/views/home/index'], resolve)
const Err404 = resolve => require(['@/views/error/404'], resolve)
//重新加载当前路由
const Refresh = resolve => require(['@/views/refresh'], resolve)

const Single = resolve => require(['@/views/single'], resolve)
const Perception = resolve => require(['@/views/perception'], resolve)
const Overview = resolve => require(['@/views/overview'], resolve)


/*Vue.use(Router)*/

export default new VueRouter({
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
    path: '/',
    redirect: '/login'
  },{ 
    path: '/refresh', 
    name: 'refresh', 
    component: Refresh,
    meta: {}
  },{
      path: '/single/:vehicleId',
      name: 'single',
      component: Single,
      meta: {
        showHeader: true
      }
  },{
      path: '/perception/:crossId/:delayTime/:extend',
      name: 'perception',
      component: Perception,
      meta: {
        showHeader: true
      }
  },{
    path: '/overview',
    name: 'overview',
    component: Overview,
    meta: {
      showHeader: true
    }
  }],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
