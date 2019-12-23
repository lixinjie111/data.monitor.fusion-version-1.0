
//import axios from 'axios';
import {HTTPURL} from '../requestUrl';
import {OPERATEURL} from '../requestUrl';
/**
 * 获取单车基本数据
 */
export const getPerceptionAreaInfo = params => {return axios.post(`${HTTPURL}pf/getPerceptionAreaInfo`, params).then(res => res.data); };

/*
* 根据摄像头编号获取视频
*/
export const getVideoByNum = params => {return axios.post(`${HTTPURL}lc/realData/getCamRealData`, params).then(res => res.data); };

/*
* 标识牌和红绿灯信息
*/
export const typeRoadData = params => {return axios.post(`${HTTPURL}ehb/road/typeRoadData`, params).then(res => res.data); };

/**
 * 根据路侧点id获取摄像头参数
 */
export const getCameraByRsId = params => {return axios.post(`${HTTPURL}ehb/road/sTypeRoad`, params).then(res => res.data); };


/**
 * 根据路侧点查询设备
 */
export const getAreaByRsId = params => {return axios.post(`${OPERATEURL}openApi/v2x/device/findRSBindDevList`, params).then(res => res.data); };