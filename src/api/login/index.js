//import axios from 'axios';
import {OPERATEURL} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${OPERATEURL}openApi/user/login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.get(`${OPERATEURL}openApi/user/logout`, {params: params}).then(res => res.data); };


