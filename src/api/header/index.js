//import axios from 'axios';
import {HTTPURL} from '../requestUrl';

/**
 * 获取天气数据
 * I_G3_01
 */
export const getTopWeather = params => { return axios.post(`${HTTPURL}g/comStat/getTopWeather`, params).then(res => res.data); };
