<template>
    <div class="fusion-left-style">
         <div class="left-overview">
                <ul class="left-item-wrapper">
                    <li class="left-item-list clearfix">
                        <i class="left-item-icon icon-1"></i>
                        <div class="left-item-text">
                            <p class="left-item-title">车辆总数</p>
                            <p class="left-item-num">{{filterData.vehNum || '--'}}</p>
                        </div>
                    </li>
                    <li class="left-item-list clearfix">
                        <i class="left-item-icon icon-2"></i>
                        <div class="left-item-text">
                            <p class="left-item-title">公路总里程数</p>
                            <p class="left-item-num">{{filterData.roadToalMileage || '--'}}</p>
                        </div>
                    </li>
                    <li class="left-item-list clearfix">
                        <i class="left-item-icon icon-3"></i>
                        <div class="left-item-text">
                            <p class="left-item-title">路侧点总数</p>
                            <p class="left-item-num">{{filterData.rCUNum || '--'}}</p>
                        </div>
                    </li>
                    <li class="left-item-list clearfix">
                        <i class="left-item-icon icon-4"></i>
                        <div class="left-item-text">
                            <p class="left-item-title">路侧设备总数</p>
                            <p class="left-item-num">{{filterData.rCUDevNum || '--'}}</p>
                        </div>
                    </li>
                    <li class="left-item-list clearfix">
                        <i class="left-item-icon icon-5"></i>
                        <div class="left-item-text">
                            <p class="left-item-title">红绿灯总数</p>
                            <p class="left-item-num">{{filterData.spatNum || '--'}}</p>
                        </div>
                    </li>
                </ul>
            </div>
    </div>
</template>
<script>
    import { getBaseStat } from "@/api/overview/index.js";
    export default {
        data() {
            return {
                responseData: {}
            }
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
        mounted() {
           this.getBaseStat();
        },
        destroyed(){
            //销毁Socket
//            this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.left-overview {
    .left-item-wrapper {
    margin-top: 20px;
    .left-item-list {
        margin-bottom: 60px;
        margin-left: 45px;
        &:last-child {
            margin-bottom: 0;
        }
        .left-item-icon {
            float: left;
            width: 54px;
            height: 54px;
            background-size: 100% 100%;
            &.icon-1 {
                background-image: url(../../../assets/images/dataMonitor/icon-1.png);
            }
            &.icon-2 {
                background-image: url(../../../assets/images/dataMonitor/icon-2.png);
            }
            &.icon-3 {
                background-image: url(../../../assets/images/dataMonitor/icon-3.png);
            }
            &.icon-4 {
                background-image: url(../../../assets/images/dataMonitor/icon-4.png);
            }
            &.icon-5 {
                background-image: url(../../../assets/images/dataMonitor/icon-5.png);
            }
        }
        .left-item-text {
            margin-left: 75px;
        }
        .left-item-title {
            font-size: 20px;
            color: #ccc;
            margin-top: -10px;
        }
        .left-item-num {
            font-family: carfont;
            font-size: 30px;
            color: #37ba7b;
        }
    }
}
}
</style>