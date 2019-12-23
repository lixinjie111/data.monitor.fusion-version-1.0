/*import Vue from 'vue'
import Router from 'vue-router'*/


/* 默认路由，不要删除 */
const Login = resolve => require(['@/views/login/index'], resolve)
const Home = resolve => require(['@/views/home/index'], resolve)
const Err404 = resolve => require(['@/views/error/404'], resolve)
//重新加载当前路由
const Refresh = resolve => require(['@/views/refresh'], resolve)

const Single = resolve => require(['@/views/single'], resolve)
const SingleNew = resolve => require(['@/views/singleNew'], resolve)
const Perception = resolve => require(['@/views/perception'], resolve)
const PerceptionNew = resolve => require(['@/views/perceptionNew'], resolve)
const PerceptionTest = resolve => require(['@/views/perceptionTest'], resolve)
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
    name: 'Refresh', 
    component: Refresh,
    meta: {}
  },{
      path: '/single/:vehicleId',
      name: 'Single',
      component: Single,
      meta: {}
  },{
      path: '/singleNew/:vehicleId',
      name: 'SingleNew',
      component: SingleNew,
      meta: {}
  },{
      path: '/perception/:crossId/:delayTime/:extend/:leftShow',
      name: 'Perception',
      component: Perception,
      meta: {
          // keepAlive:true
      }
  },{
      path: '/perceptionNew/:crossId/:delayTime/:extend/:leftShow',
      name: 'PerceptionNew',
      component: PerceptionNew,
      meta: {
          // keepAlive:true
      }
  },{
      path: '/PerceptionTest/:crossId/:delayTime/:extend/:leftShow',
      name: 'PerceptionTest',
      component: PerceptionTest,
      meta: {
          // keepAlive:true
      }
  },{
    path: '/overview',
    name: 'Overview',
    component: Overview
  }],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
