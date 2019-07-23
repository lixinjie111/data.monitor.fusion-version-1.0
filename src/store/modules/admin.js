import { requestLogin, requestLogout} from '@/api/login';
import { 
	setAuthInfo, removeAuthInfo
} from '@/utils/auth';

const admin = {
	state: {
		adminId: '',
		adminName: ''
	},
	mutations: {
		SET_LOGIN_INFO:(state, loginInfo) => {
			const { adminId, adminName} = loginInfo;
			state.adminId = adminId;
			state.adminName = adminName;
		},
	},
	actions: {
		// 设置用户授权信息
		setAuthInfo:({commit}, authData) => {
			commit('SET_LOGIN_INFO', authData);
		},
		// 退出
		goLogOut() {
			return new Promise((resolve, reject) => {
				requestLogout({}).then(res => {
					removeAuthInfo();
					resolve(res);
				});
			}).catch(error => {
				reject(error);
			});
		},
		// 执行登录操作
		goLogin({commit}, loginForm) {
			return new Promise((resolve, reject) => {
				requestLogin(loginForm).then(res => {
					if(res.status == 200) {
						setAuthInfo(res.data);
					}
					resolve(res);
				});
			}).catch(error => {
				reject(error);
			});
		}
	}
}

export default admin;