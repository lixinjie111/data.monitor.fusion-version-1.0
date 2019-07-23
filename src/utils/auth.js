import Cookies from 'js-cookie'

const adminId = 'adminId'

// loginId
export function getAdminId() {
  return Cookies.get(adminId)
}

export function setAdminId(adminId) {
  return Cookies.set(adminId, adminId)
}

export function removeAdminId() {
  return Cookies.remove(adminId)
}

// global
export function setAuthInfo(data) {
	let {adminName, adminId} = data;
	Cookies.set('adminName', adminName)
	Cookies.set('adminId', adminId)
}

export function getAuthInfo() {
	return {
		adminName: Cookies.get('adminName'),
		adminId: Cookies.get('adminId')
	}
}

// 移除所有cookie
export function removeAuthInfo() {
	Cookies.remove('adminName')
	Cookies.remove('adminId')
}
