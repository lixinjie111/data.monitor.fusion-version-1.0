import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 登录
 */
export const requestLogin = params => { return axios.post(`${HTTPURL}login`, params).then(res => res.data); };
/**
 * 退出登录
 */
export const requestLogout = params => { return axios.get(`${HTTPURL}logout`, {params: params}).then(res => res.data); };


