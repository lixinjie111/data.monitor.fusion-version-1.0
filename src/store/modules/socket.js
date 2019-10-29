const socket = {
    state:{
        mapRealData:{
            direction:'1'
        }
    },
    mutations:{
        SET_REAL_DATA(state,obj){
            state.mapRealData=obj;
        }
    },
    getters:{
        getRealData(state){
            return state.mapRealData;
        }
    },
    actions:{
        changeMapRealData({commit},obj){
            commit('SET_REAL_DATA',obj);
        }
    }
}
export default socket;