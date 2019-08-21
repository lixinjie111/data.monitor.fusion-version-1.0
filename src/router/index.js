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
const Test = resolve => require(['@/views/perception/components/test'], resolve)
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
    name: 'Refresh', 
    component: Refresh,
    meta: {}
  },{
      path: '/single/:vehicleId',
      name: 'Single',
      component: Single,
      meta: {}
  },{
      path: '/perception/:lon/:lat',
      name: 'Perception',
      component: Perception,
      meta: {}
  },{
    path: '/overview',
    name: 'Overview',
    component: Overview
  },{
      path: '/test',
      name: 'Test',
      component: Test
  }],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
