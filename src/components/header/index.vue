<template>
    <div id="header">
        <router-link tag="a" class="logo-wrap" to="/overview">
            <img src="static/images/logo.png" class="logo"/>
            <em class="name">融合感知中心</em>
        </router-link>
        <div class="sub-info clearfix" v-if="$parent.isHeaderShow">
            <span class="tip">
                <em class="c-middle">{{city.district || '--'}}</em>
                <img src="@/assets/images/weather/default.png" class="weather-icon" /><em class="c-middle">{{weather.wendu || '--'}}°</em>
            </span>
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">
                    <i class="icon iconfont el-icon-mc-yonghuzhongxin_f c-vertical-middle"></i>
                    <em class="name c-vertical-middle">{{sysAdminName}}</em>
                </span>
                <el-dropdown-menu slot="dropdown" class="c-header-dropdown">
                    <el-dropdown-item divided>版本V{{version}}</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logout">登出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>
<script>
import { getTopWeather } from '@/api/header';
import { mapActions } from 'vuex';
import { removeAuthInfo } from '@/session/index';
export default {
	name: "Header",
    data() {
        return {
            sysAdminName: this.$store.state.admin.adminName,
            version: window.config.version,
            city: {
                province: '',
                district: ''
            },
            weather: {
                wendu: ''
            },
            changeCenterPoint: [],
            time:null,
            requestData:{}
        }
    },
    mounted() {
	    this.changeCenterPoint=window.mapOption.center;
        this.getAddress();
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
            // this.weather.wendu = 23;
        },
        ...mapActions(['goLogOut']),
        //退出登录
        logout() {
            this.$confirm('确认退出吗?', '提示', {
            }).then(() => {
                this.goLogOut().then(res => {
                    this.$message.success(res.message);
                    removeAuthInfo();
                    localStorage.removeItem("yk-token");
                    this.$router.push({ path: '/' });
                });
            }).catch(err => {
                console.log("取消退出！");
            });
        }
    },
    computed: {
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
#header {
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
        @include layoutMode(align);
        .logo {
            height: 100%;
            margin-right: 10px;
        }
        .name {
            font-size: 24px;
            line-height: 30px;
            color: #fff;
            letter-spacing: 3px;
            margin-right: 10px;
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
        .userinfo-inner {
            margin-left: 15px;
            cursor: pointer;
            color: #fff;
            .icon {
                font-size: 28px;
                line-height: 28px;
            }
        }
    }
}
</style>