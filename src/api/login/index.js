import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${HTTPURL}admin/sys/user/login`, params).then(res => res.data); };
//export const requestLogin = params => { return axios.post(`http://120.133.21.14:9090/operateApp/sys/user/login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.get(`${HTTPURL}admin/sys/user/logout`, {params: params}).then(res => res.data); };
//export const requestLogout = params => { return axios.get(`http://120.133.21.14:9090/operateApp/sys/user/logout`, {params: params}).then(res => res.data); };


