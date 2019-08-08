<template>
    <div id="app">
        <div class="app-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import {getTopWeather} from '@/api/overview/index.js';
export default {
    name: 'App',
    data() {
        let defaultCenterPoint =  [121.262939,31.245149];
        return {
            // defaultCenterPoint: [116.395577, 39.892257] //北京
            // defaultCenterPoint: [121.455372,31.249569], //上海
            defaultCenterPoint: defaultCenterPoint,
            defaultMapOption: {
                center: defaultCenterPoint,
                zoom: 11,
                mapStyle: "amap://styles/3312a5b0f7d3e828edc4b2f523ba76d8"
            },
            changeCenterPoint: defaultCenterPoint,
            responseData: {
                timestamp: new Date().getTime()
            },
            requestData: {
                disCode: ''
            },
            city: {},
            weather: {},
        }
    },
    watch: {
        "$route"(val) {
            // console.log(val);
        }
    },
    mounted() {
        this.getAddress();
    },
    methods: {
         getAddress() {
            let geocoder = new AMap.Geocoder();
            geocoder.getAddress(this.defaultCenterPoint, (status, result) => {
                if (status === 'complete' && result.regeocode) {
                    let data = result.regeocode.addressComponent;
                    this.city.province = data.province;
                    this.city.district = data.district;
                    this.requestData.disCode = data.adcode;
                    this.$store.commit('SET_DISTRICT_DATA', result.regeocode.addressComponent);
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
                this.$store.commit('SET_WEATHER_DATA', this.weather);
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
    }
}
</script>

<style lang="scss">
    #app {
        font-family: MicrosoftYaHei;
        background: #2a2a2a;
        position: relative;
        width: 100%;
        height: 100%;
        font-size: 14px;
        line-height: 40px;
        letter-spacing: 2px;
        color: #fff;
        overflow: hidden;
        .app-container {
            position: relative;
            width:100%;
            height: 100%;
            overflow:hidden;
        }
    }
</style>
