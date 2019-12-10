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
/**
 * 获取滑块位置
 */
export const requestCreateCode = params => { return axios.post(`${OPERATEURL}openApi/user/createCode`, params).then(res => res.data); };
/**
 * 滑动校验
 */
export const requestAuthCode = params => { return axios.post(`${OPERATEURL}openApi/user/authCode`, params).then(res => res.data); };


