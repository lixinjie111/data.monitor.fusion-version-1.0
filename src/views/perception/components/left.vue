<template>
    <div class="fusion-left-style">
        <div class="fusion-header">
            <img src="@/assets/images/logo.png" class="header-img"/>
            感知融合平台
        </div>
        <div class="fusion-left-main">
            <p class="c-title">融合结果</p>
            <ul class="perception-style">
                <li>
                    <span class="overview-sign fusion-sign"></span>
                    <span>融合后感知车辆：34</span>
                </li>
                <li>
                    <span class="overview-sign fusion-sign"></span>
                    <span>融合后行人：34</span>
                </li>
            </ul>
            <p class="c-title">感知数据</p>
            <ul  class="perception-style">
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>平台直连：车辆8</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>车辆感知：车辆8，行人3</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>路侧识别：车辆34，行人3</span>
                </li>
                <li>
                    <span class="overview-sign perception-sign"></span>
                    <span>V2X通讯：车辆9</span>
                </li>
            </ul>
            <p class="c-title">交通数据</p>
            <ul class="perception-style">
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>交通事件：1</span>
                </li>
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>交通事件：1</span>
                </li>
                <li>
                    <span class="overview-sign traffic-sign"></span>
                    <span>交通事件：1</span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {}
        },
        methods: {},
        mounted() {

        }
    }
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .perception-style{
        padding: 20px 0px;
        li{
            @include layoutMode(align);
            letter-spacing: 1px;
            color: #cccccc;
            font-size: 14px;
            .overview-sign{
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: inline-block;
                margin-right:20px;
            }
            .fusion-sign{
                background:#9b9b9b;
            }
            .perception-sign{
                background:#4eaf6b ;
            }
            .traffic-sign{
                background: #d1d151;
            }
        }
    }
</style>