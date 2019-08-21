<template>
	<div class="header clearfix">
        <div class="logo-wrap">
            <img src="@/assets/images/logo.png" class="logo"/>
            <span class="logo-word"> 感知融合平台</span>
        </div>
        <!-- <ul class="menu-box clearfix">
           <router-link tag="li" v-for="item in navList" :key="item.id" class="menu-list" :to="item.path">{{item.name}}</router-link>
        </ul> -->
        <!-- <div class="sub-info clearfix">
            <span class="tip">{{formatTime || '--'}}</span>
            <span class="tip">
                <em class="c-middle">{{city.province}}{{city.district}}</em>
                <img src="@/assets/images/weather/default.png" class="weather-icon" /><em class="c-middle">{{weather.wendu || '--'}}°</em>
            </span>
            <a href="javascript:;" class="tip" @click="dialogWarning">预警<em class="num">{{ warningNum || '--' }}</em></a>
            <a href="javascript:;" class="tip" @click="dialogFault">故障<em class="num">{{ faultNum || '--' }}</em></a>
        </div>
        <dialog-warning-fault :type="type" v-if="DialogWarningFlag" @closeDialogWarning="closeDialogWarning"></dialog-warning-fault> -->

    </div>
</template>
<script>
// import { getTopHead, getTopWeather } from '@/api/header';
// import { mapActions } from 'vuex';
export default {
	name: "Header",
    props: {
        changeCenterPoint: [Array, Object]
    },
    // components: {
    //     DialogWarningFault
    // },
    data() {
        return {
            sysAdminName: this.$store.state.admin.adminName,
            navList: [
              {id:1,name:'概览',path:'/dataMonitor'},
              {id:2,name:'车辆',path:'/carMonitor'},
              {id:3,name:'路网',path:'/roadMonitor'},
              {id:4,name:'路侧设备',path:'/sideDeviceMonitor'}
            ],
            responseData: {
                timestamp: new Date().getTime()
            },
            city: {},
            weather: {},
            requestData: {
                disCode: ''
            },
            DialogWarningFlag: false,
            DialogFaultFlag: false,
            type: 1
        }
    },
    computed: {
        formatTime() {
            if(this.responseData.timestamp){
                return this.$dateUtil.formatTime(this.responseData.timestamp);
            }else {
                return '--'
            }
        },
        warningNum() {
            if(this.responseData.warningNum || this.responseData.warningNum == 0){
                return parseFloat(this.responseData.warningNum).toLocaleString();
            }else {
                return '--'
            }
        },
        faultNum() {
            if(this.responseData.faultNum || this.responseData.faultNum == 0){
                return parseFloat(this.responseData.faultNum).toLocaleString();
            }else {
                return '--'
            }
        }
    },
    watch: {
        deep: true,
        changeCenterPoint: {
            handler(newVal, oldVal) {
                this.getAddress(newVal);
            }
        }
    },
    // mounted(){
    //     this.getTopHead();
    //     this.changeTime();

    //     this.getAddress(this.changeCenterPoint);
    // },
    // methods: {
    //     dialogWarning() {
    //         this.DialogWarningFlag = true;
    //         this.type = 1;
    //     },
    //     dialogFault() {
    //         this.DialogWarningFlag = true;
    //         this.type = 2;
    //     },
    //     getTopHead() {
    //         // console.log('获取天气数据、预警故障数量');
    //         getTopHead({}).then(res => {
    //             this.responseData = res.data;
    //         });
    //     },
    //     changeTime() {
    //         setInterval(() => {
    //             this.responseData.timestamp += 1000;
    //         }, 1000);
    //     },
    //     getAddress(lnglat) {
    //         let _this = this,
    //             geocoder = new AMap.Geocoder();
    //         geocoder.getAddress(lnglat, function(status, result) {
    //             if (status === 'complete' && result.regeocode) {
    //                 let _data = result.regeocode.addressComponent;
    //                 _this.city.province = _data.province;
    //                 _this.city.district = _data.district;
    //                 _this.requestData.disCode = _data.adcode;
    //                 _this.getTopWeather();
    //             }else{
    //                 console.log('根据经纬度查询地址失败')
    //             }
    //         });
    //     },
    //     getTopWeather() {
    //         getTopWeather(this.requestData).then(res => {
    //             this.weather = res.data;
    //         });
    //     },
    //     closeDialogWarning() {
    //         this.DialogWarningFlag = false;
    //     },
    //     closeDialogFault() {
    //         this.DialogFaultFlag = false;
    //     },
    //     ...mapActions(['goLogOut']),
    //     //退出登录
    //     logout() {
    //         let that = this;
    //         that.$confirm('确认退出吗?', '提示', {
    //         }).then(() => {
    //             that.goLogOut(that).then(res => {
    //                 that.ClearMenuList();
    //                 that.$router.push({ path: '/' });
    //             });
    //         }).catch(() => {
    //         });
    //     }
    // }
}
</script>
<style scoped lang="scss">
@import '@/assets/scss/theme.scss';
.header {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 99;
    height: 40px;
    color: #fff;
    padding: 24px 30px;
    text-align: center;
    letter-spacing: 1px;
    // background-color: rgba(255, 255, 255, .1);
    // background-color: rgba(0, 0, 0, .2);
    background: linear-gradient(rgba(0, 0 ,0 , .4) 50%, rgba(0, 0 ,0 , 0)); /* 标准的语法 */

    .logo-wrap {
        float: left;
        padding: 5px 0;
        cursor: pointer;
        height: 30px;
        .logo {
            height: 100%;
            vertical-align: top;
        }
        .logo-wrap {
            display: inline-block;
            height: 29px;
            font-size: 30px;
            line-height: 40px;
            letter-spacing: 3px;
            color: #fff;
        }
    }
    .menu-box{
        display: inline-block;
        white-space: nowrap;
        .menu-list {
            float: left;
            margin:0px 46px;
            height:100%;
            font-size: 20px;
            line-height:40px;
            vertical-align: middle;
            cursor: pointer;
            &:hover {
                border-bottom: 3px solid #925d00;
            }
            &.is-active {
                border-bottom: 3px solid #925d00;
                cursor: default;
            }
        }
    }
    .sub-info {
        float: right;
        font-size: 14px;
        .tip {
            color: #fff;
            margin-left: 40px;
            &:first-child {
                margin-left: 0;
            }
            .weather-icon {
                display: inline-block;
                width: 26px;
                vertical-align: middle;
                margin-right: 8px;
            }
            .num {
                margin-left: 15px;
                color: #dc8c00;
            }
        }
    }
    // .userinfo {
    //     font-size: 12px;
    //     height: 100%;
    //     color: #fff;
    //     @include layoutMode();
    // }
}
</style>