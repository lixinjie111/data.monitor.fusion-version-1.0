<template>
    <div class="base-info">
        <span class="base-time">{{formatTime || '--'}}</span>
        <span>
            <em >{{city.district || '--'}}</em>
            <img src="@/assets/images/weather/default.png" class="weather-icon"/>
            <em class="c-middle">{{weather.wendu || '--'}}°</em>
        </span>
    </div>
</template>
<script>
 import { getTopHead, getTopWeather } from '@/api/header';
// import { mapActions } from 'vuex';
export default {
	name: "Header",
    data() {
        return {
            responseData: {
                timestamp: new Date().getTime()
            },
            city: {},
            weather: {},
            changeCenterPoint: [121.17265957261286,31.284096076877844],
            time:null,
            requestData:{}
        }
    },
    mounted() {
        this.getAddress();
        this.getTopHead();
    },
    methods: {
        getAddress() {
            let geocoder = new AMap.Geocoder();
            geocoder.getAddress(this.changeCenterPoint, (status, result) => {
                if (status === 'complete' && result.regeocode) {
                    let data = result.regeocode.addressComponent;
                    this.city.province = data.province;
                    this.city.district = data.district;
                    this.requestData.disCode = data.adcode;
                    this.getTopWeather();
                } else {
                    console.log('根据经纬度获取地区失败');
                }
            });
        },
        // 获取天气
        getTopWeather() {
            getTopWeather(this.requestData).then(res => {
                this.weather = res.data;
            });
        },
        getTopHead() {
            // console.log('获取天气数据、预警故障数量');
            getTopHead({}).then(res => {
                this.responseData = res.data;
                this.time = setInterval(() => {
                    this.responseData.timestamp += 1000;
                }, 1000);
            });
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
    destroyed(){
	    clearInterval(this.time);
    }

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