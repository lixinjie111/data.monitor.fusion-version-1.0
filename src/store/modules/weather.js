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
        },
        SET_WEATHER_DATA: (state, weather) => {
            state.weather = weather;
        },
        SET_FORMATETIME_DATA: (state, formatTime) => {
            state.formatTime = formatTime;
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