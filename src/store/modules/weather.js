import { getTopWeather} from '@/api/overview';
import { Promise } from 'q';

const weather = {
	state: {
        districtData: {},
        weather: {},
        formatTime: ''
	},
	mutations: {
		SET_DISTRICT_DATA: (state, districtData) => {
            state.districtData = districtData;
            console.log('state.districtData', state.districtData);
        },
        SET_WEATHER_DATA: (state, weather) => {
            state.weather = weather;
            console.log('state.weather', state.weather);
        },
        SET_FORMATETIME_DATA: (state, formatTime) => {
            state.formatTime = formatTime;
            console.log('state.formatTime', state.formatTime);
        }
	},
	actions: {
        // 获取地址
        GetAddress({commit}, params) {
            console.log('params', params);
        }
	}
}

export default weather;