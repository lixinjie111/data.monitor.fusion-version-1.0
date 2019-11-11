<template>
    <div class="fusion-style">
        <!-- 左侧 -->
        <div class="c-fusion-left fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left-overview></left-overview>
                </div>
            </div>
        </div>
        <!-- 地图 -->
        <map-container></map-container>
        <!-- 右侧  -->
        <special-road></special-road>

        <div class="fusion-bottom">
            <!-- 底部车辆信息 -->
            <bottom-overview></bottom-overview>
        </div>
    </div>
</template>
<script>
import LeftOverview from './components/leftOverview.vue';
import MapContainer from './components/mapContainer.vue';
import BottomOverview from './components/bottomOverview.vue';
import SpecialRoad from './components/specialRoad';
import HeaderTop from '../../components/header/index.vue';
export default {
    components: {
        LeftOverview,
        MapContainer,
        BottomOverview,
        SpecialRoad,
        HeaderTop
    },
    data() {
        return {}
    },
    methods: {},
    mounted() {},
    destroyed(){},
}
</script>
<style lang="scss" scoped>
.fusion-style{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // overflow: scroll;
    .fusion-left{
        width: 330px;
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
    .fusion-bottom {
        position: absolute;
        bottom: 30px;
        margin: auto;
        left: 0;
        right: 0;
        height: 80px;
    }
}
</style>