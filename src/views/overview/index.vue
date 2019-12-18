<template>
    <div class="fusion-style">
        <!-- 左侧 -->
        <div class="c-fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left-overview :filterData="filterData.vehNum"></left-overview>
                </div>
            </div>
        </div>
        <!-- 地图 -->
        <map-container></map-container>
        <!-- 右侧  -->
        <div class="c-fusion-right">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <right-overview :filterData="filterData.rCUNum"></right-overview>
                </div>
            </div>
        </div>
         <!--中间  -->
        <fusion-select></fusion-select>
    </div>
</template>
<script>
import LeftOverview from './components/leftOverview.vue';
import rightOverview from './components/rightOverview.vue';
import FusionSelect from './components/fusionSelect.vue';
import MapContainer from './components/mapContainer.vue';
import { getBaseStat } from "@/api/overview/index.js";
export default {
    components: {
        rightOverview,
        LeftOverview,
        FusionSelect,
        MapContainer
    },
    data() {
        return {
            responseData: {},
            onlineCount:0
        }
    },
    created() {
        this.getBaseStat();
    },
    computed:{
        filterData() {
            let _filterData = {};
            for (let attr in this.responseData) {
                _filterData[attr] = parseFloat(this.responseData[attr]).toLocaleString() || '--';
            }
            return _filterData;
        }
    },
    methods: {
        getBaseStat() {
            // console.log('获取获取车辆信息');
            getBaseStat().then(res => {
                this.responseData = res.data;
            });
        }
    },
    
    destroyed(){},
}
</script>
<style lang="scss" scoped>
.c-fusion-left, .c-fusion-right {
    padding:100px 30px 0;
}
.fusion-style{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>