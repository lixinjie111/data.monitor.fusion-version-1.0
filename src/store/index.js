import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import admin from './modules/admin';
import weather from './modules/weather';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		app,
		admin,
		weather
	}
});

export default store
