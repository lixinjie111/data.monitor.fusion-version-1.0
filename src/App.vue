<template>
    <div id="app">
        <!-- 头部 -->
        <header-bar v-if="this.$route.meta.showHeader"></header-bar>
        <div class="app-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import HeaderBar from '@/components/header/index.vue'
import {mapActions} from 'vuex';

export default {
    name: 'App',
    components: {
        HeaderBar
    },
    data() {
        return {
            isHeaderShow: true,
            changeCenterPoint: window.mapOption.center,
            requestData: {
                disCode: ''
            },
            city: {},
            weather: {},
            connectCount:0,
        }
    },
    watch: {
        deep: true,
        $route(newVal, oldVal) {
//            console.log(newVal);
            if(newVal.name == 'Single') {
                this.isHeaderShow = false;
            }else {
                this.isHeaderShow = true;
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
            width: 100%;
            height: 100%;
        }
    }
</style>
