// import Vue from 'vue';
// import Vuex from 'vuex';
import admin from './modules/admin';
// import socket from './modules/socket';

//Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		admin,
		// socket
	}
});

export default store
