//import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${HTTPURL}admin/sys/user/login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.get(`${HTTPURL}admin/sys/user/logout`, {params: params}).then(res => res.data); };


