import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import admin from './modules/admin';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		app,
		admin
	}
});

export default store
