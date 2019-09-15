<template>
    <div class="fusion-right-style">
        <div class="right-road">
            <div class="perception-road" v-for="(item, index) in centerPointData" :key="index"  @click="showRoadDetail(item)">
                <div class="road-word">
                    <p>{{item.rsName}}</p>
                </div>
                <road-section :id="'map' + index" :mapData="item" class="cross-scan"></road-section>
            </div>
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
                path: '/perception/' + centPos[0] + "/" + centPos[1]+"/"+item.rsId+ "/"+1+ "/"+false+ "/"+0.02,
//                query:{crossId:item.id}
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
    .base-info{
        padding:30px 0px ;
        text-align: center;
        .weather-icon{
            vertical-align: middle;
            padding-left: 10px;
        }
    }
    .style{
        width: 260px;
        height: 160px;
        border:4px solid #666666;
        position: absolute;
        left: 800px;
        /*top: calc(440px-160px-20px);*/
        top:260px;
        // z-index:1;
        padding-top: 5px;
        box-sizing: border-box;
        animation: move 3s linear;;

    }
    @keyframes move {
        0%{transform:translate(0,0);}
        100%{transform:translate(50px,100px);}
    }
    .style:before{
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-top:20px solid #666666;
        border-right:16px solid transparent;
        bottom: -20px;
        left:16px;
    }
</style>
