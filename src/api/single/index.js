
import axios from 'axios';
import {HTTPURL} from '../requestUrl';
/**
 * 获取单车基本数据
 */
export const getVehicleBaseData = params => {return axios.post(`${HTTPURL}singleMoniter/getVehicleBaseData`, params).then(res => res.data); };

/**
 *	获取行车概览当前行程的历史路径
 */
export const getRouteDataByVehId = params => {return axios.post(`${HTTPURL}vl/routeStat/getRouteDataByVehId`, params).then(res => res.data); };

/**
 *  获取车辆实时视频数据
 */
export const getLiveDeviceInfo = params => {return axios.post(`${HTTPURL}singleMoniter/getLiveDeviceInfo`, params).then(res => res.data); };

/**
 * 获取车辆实时视频数据
 */
export const startStream = params => {return axios.post(`${HTTPURL}singleMoniter/startStream`, params).then(res => res.data); };

/**
 *  获取车辆实时视频数据
 */
export const sendStreamHeart = params => {return axios.post(`${HTTPURL}singleMoniter/sendStreamHeart`, params).then(res => res.data); };