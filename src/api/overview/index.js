//import axios from 'axios';
import {HTTPURL} from '../requestUrl';
import {OPERATEURL} from '../requestUrl';
/**
 * 获取概览左侧的车辆数据
 */
export const getBaseStat = params => {return axios.post(`${HTTPURL}g/baseStat/getBaseStat`, params).then(res => res.data); };


/**
 * 获取右侧典型路口列表数据
 */
export const typeCross = params => {return axios.post(`${HTTPURL}rw/bs/typeCross`, params).then(res => res.data); };

/**
 * 获取路网信息（地图呈现）道路ID数据
 * I_G1_02
 */
export const getRoadCenterIds = params => {return axios.get(`${DLURL}dl/getRoadCenterIds.do`, {params: params}).then(res => res.data); };
/**
 * 获取路网信息（地图呈现）数据
 * I_G1_02
 */
 export const getRoadCenterPoints = params => {return axios.get(`${DLURL}dl/getRoadCenterPoints.do`, {params: params}).then(res => res.data); };

 /**
 * 获取典型车辆列表初始化配置数据
 * I_VL3_01
 */
export const getGpsRealConfig = params => {return axios.post(`${HTTPURL}vl/actVehStat/getGpsRealConfig`, params).then(res => res.data); };
/**
 * 初始化页面，获取典型车辆列表实时信息
 * I_VL3_01
 */
 export const getGpsRealList = params => {return axios.post(`${HTTPURL}vl/actVehStat/getGpsRealList`, params).then(res => res.data); };

 /**
 * 信号灯 路口
 */
export const rwDis = params => {return axios.post(`${HTTPURL}rw/bs/rwDis`, params).then(res => res.data); };


/**
 * 典型路段信息
 */
export const getTypicalRoadData = params => {return axios.post(`${HTTPURL}ehb/road/typeRoad`, params).then(res => res.data); };

/**
 * 获取四个角的地理位置
 */
export const getTypeRoadData = params => { return axios.post(`${HTTPURL}ehb/road/typeRoadData`, params).then(res => res.data); };


/**
 * 获取天气数据
 * I_G3_01
 */
export const getTopWeather = params => { return axios.post(`${HTTPURL}g/comStat/getTopWeather`, params).then(res => res.data); };

/*
 * 获取设备分布
 * I_VL1_01
 */
export const getDevDis = params => {return axios.post(`${HTTPURL}lc/baseStat/getDevDis`, params).then(res => res.data); };
/**
 * 路测点
 */
export const requestRoadSide = params => { return axios.post(`${OPERATEURL}roadSideInfo/findPage`, params).then(res => res.data); };
/**
 * 车辆
 */
export const requestVehicle = params => { return axios.post(`${OPERATEURL}vehicle/query/page`, params).then(res => res.data); };