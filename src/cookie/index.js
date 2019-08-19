import store from '../store/index';
import Cookies from 'js-cookie';

const adminId = 'adminId';
const adminName = 'adminName';
const operations = 'operations';
const token = 'token';

// loginId
export function getAdminId() {
  return Cookies.get(adminId);
}

export function setAdminId(adminId) {
  return Cookies.set(adminId, adminId);
}

export function removeAdminId() {
  return Cookies.remove(adminId);
}

// global
export function setAuthInfo(data) {
	if(typeof data == "string") {
		data = JSON.parse(data);
	}
	let {userNo, id, operations, token} = data;
	Cookies.set('adminName', userNo);
	Cookies.set('adminId', id);
	Cookies.set('operations', operations);
	Cookies.set('token', token);
	store.dispatch('setAuthInfo', {
		adminName: userNo,
		adminId: id,
		operations: operations,
		token: token
	});

}

export function getAuthInfo() {
	return {
		adminName: Cookies.get(adminName),
		adminId: Cookies.get(adminId),
		operations: Cookies.get(operations),
		token: Cookies.get(token)
	}
}

// 移除所有cookie
export function removeAuthInfo() {
	Cookies.remove(adminName);
	Cookies.remove(adminId);
	Cookies.remove(operations);
	Cookies.remove(token);
	store.dispatch('removeAuthInfo');
}
