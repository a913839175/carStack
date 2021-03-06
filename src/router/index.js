import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'
import {isLogin} from '../utils';
import store from '../store'
import staticRoute from './staticRoute'
import { asyncLayout, asyncRoute, redirectRoute} from './asyncRoute'
import whiteList from './whiteList'

/**
 * 根据返回的菜单列表确认异步路由
 * @param {array} permission 权限列表（菜单列表）
 * @param {array} router 异步路由对象
 */
function routerMatch(permission, router){
    return new Promise((resolve) => {
        // 创建需要校验的参数数组
        function addPermision(permission){           
            permission.forEach((item) => {
                if(item.children && item.children.length){
                    // 递归
                    addPermision(item.children)
                }
                router.forEach((s) => {
                    if((s.name == item.name)){
                        s.isAuth = item.isAuth;
                    }
                    s.children.forEach((j) =>{
                       if((j.name == item.name)){
                            // s.meta.permission = item.permission
                            j.isAuth = item.isAuth;
                            return
                        } 
                    })                   
                })           
            })
        }      
        addPermision(permission)        
        const asyncAccRouter = filterAsyncRouter(router);
        resolve(asyncAccRouter)
    })
}
function filterAsyncRouter(asyncRouterMap){
    const accessedRouters = asyncRouterMap.filter(item => {
        if (item.isAuth) {          
            if (item.children && item.children.length) {
                item.children = filterAsyncRouter(item.children)
            }
            return true
        }
        return false
    })
    return accessedRouters
}
Vue.use(VueRouter)

const router = new VueRouter({
    // mode: 'history',
    routes: staticRoute
})

// 路由跳转前验证
router.beforeEach((to, from, next) => {    
    // 判断用户是否处于登录状态
    if (isLogin()) {
        // 如果当前处于登录状态，并且跳转地址为login，则自动跳回系统首页
        // 这种情况出现在手动修改地址栏地址时
        if (to.path === '/login') {
            router.replace('/index')
        } else {
            // 页面跳转前先判断是否存在权限列表，如果存在则直接跳转，如果没有则请求一次
            if (store.state.auth.permissionList.length === 0) {
                // 获取权限列表，如果失败则跳回登录页重新登录
                store.dispatch('getPermission').then(res => {
                    // 匹配并生成需要添加的路由对象
                    routerMatch(res, asyncRoute).then(res => {
                        store.commit("setPermissionList",res)
                        router.addRoutes(res)
                        router.addRoutes(redirectRoute)
                        next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                    })
                })
            } else {
                next()
            }
        }
    } else {
        // 如果是免登陆的页面则直接进入，否则跳转到登录页面
        if (whiteList.indexOf(to.path) >= 0) {
            // console.log('该页面无需登录即可访问')
            next()
        } else {
            router.replace('/login')
            // 如果store中有token，同时Cookie中没有登录状态
            // if(store.state.user.token){
            //     Message({
            //         message: '登录超时，请重新登录'
            //     })
            // }
        }
    }
})

router.afterEach((to, from, next) => {
  // console.log(to)
})

export default router