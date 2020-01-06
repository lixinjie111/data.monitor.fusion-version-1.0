<template>
    <div class="left-overview">
        <div class="left-item-list clearfix">
            <i class="left-item-icon icon-3"></i>
            <div class="left-item-text">
                <span class="left-item-title">路侧点：</span>
                <span class="left-item-num">{{filterData || '--'}}</span>
            </div>
        </div>
        <ul class="left-item-wrapper">
            <li
            class="car-info-li"
            v-for="(item, index) in centerPointData"
            :key="index"
            @click="showRoadDetail(item)"
            >
                <div class="car-index">{{index + 1}}</div>
                <div class="rspt-detail-info">
                    <p class="rspt-info">{{item.rsName}}</p>
                    <p class="rspt-info">{{item.rdName}}</p>
                    <p class="rspt-info">{{item.distName}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    import {getTypicalRoadData} from '@/api/overview/index.js';
    import {getCameraByRsId} from '@/api/fusion'
    export default {
        props:['filterData'],
        data(){
            return {
                centerPointData: []
            }
        },
        mounted(){
            this.fetchTypicalRoad();
        },
        methods: {
            getCameraByRsId(item){
                getCameraByRsId({"rsId":item.rsId}).then(res => {
                    if(res.status == 200) {
                        let data = res.data;
                        if(data.camLst && data.camLst.length>0){
                            sessionStorage.setItem("sTypeRoadCamLst",JSON.stringify(data));
                            let centPos = item.centPos.split(",");
                            this.$router.push({
                                path: '/perception/'+item.rsId+ "/"+window.delayTime+ "/"+window.miniExtend+"/"+true,
                                query:{lng:centPos[0],lat:centPos[1],isShow:false}
                            });
                        }else {
                            this.$message({
                                type: 'error',
                                duration: '1500',
                                message: '未设置典型摄像头',
                                showClose: true
                            });
                            sessionStorage.removeItem("sTypeRoadCamLst");
                        }
                    }else {
                        sessionStorage.removeItem("sTypeRoadCamLst");
                    }
                }).catch(err => {
                    sessionStorage.removeItem("sTypeRoadCamLst");
                });
            },
            showRoadDetail(item) {
//                console.log(item);
                this.getCameraByRsId(item);
            },
            // 路段中心点位置
            fetchTypicalRoad() {
                getTypicalRoadData().then(res => {
                    let data = res.data;
                    this.centerPointData = data.slice(0,4);
                });
            }
        },
    }
</script>
<style lang="scss" scoped>
@import '@/assets/scss/overview.scss';
</style>