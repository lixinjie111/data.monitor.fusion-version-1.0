<template>
    <div class="c-fusion-right right-road">
        <div class="perception-road" v-for="(item, index) in centerPointData" :key="index"  >
            <div class="road-word" @click="showRoadDetail(item)">
                <p>{{item.rsName}}</p>
            </div>
            <road-section :id="'map' + index" :mapData="item" class="cross-scan"></road-section>
        </div>
    </div>
</template>
<script>
    import {typeCross, getTypicalRoadData, getTypeRoadData} from '@/api/overview/index.js';
    import ConvertCoord from '@/assets/js/coordConvert.js';
    import RoadSection from './roadSection';
    export default {
        components: {
            RoadSection
        },
        data(){
            return {
                centerPointData: []
            }
        },
        mounted(){
            this.fetchTypicalRoad();
        },
        methods: {
            showRoadDetail(item) {
//            sessionStorage.setItem(item.rsId,JSON.stringify(item));
                let centPos = item.centPos.split(",");
                this.$router.push({
                    path: '/perception/'+item.rsId+ "/"+4+"/"+0.004+"/"+true,
                    query:{lng:centPos[0],lat:centPos[1],isShow:false}
                });
            },
            // 路段中心点位置
            fetchTypicalRoad() {
                getTypicalRoadData().then(res => {
                    let data = res.data;
                    this.centerPointData = data.slice(0,4);
                });
            }
        },
        destroyed(){
        }
    }
</script>
<style lang="scss" scoped>
    .perception-road{
        position: relative;
        height: 176px;
        width: 315px;
        border: 1px solid #5e5970;
        padding: 5px 6px 6px 6px;
        margin-bottom: 20px;
        top:33px;
        overflow: hidden;
        cursor: pointer;
        .road-word {
            // position: relative;
            position: absolute;
            z-index: 2;
            padding-left: 7px;
        }
        .cross-scan {
            display: block;
            height: 100%;
            width: 100%;
            z-index: 555;
        }
    }
</style>
