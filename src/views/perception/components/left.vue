<template>
    <div class="m-wrapper">
        <div class="m-select-wrap clearfix">
            <el-collapse class="c-left">
                <el-collapse-item :title="'图层数量：'+levelOptionShowNum">
                    <ul class="m-ul">
                        <li class="m-li clearfix" v-for="(item, index) in levelOption">
                            <span class="m-text">{{item.name}}</span>
                            <span 
                                class="m-switch" 
                                :class="{'active': item.flag, 'disabled': item.disabled}"
                                @click="switchHandle(item, index, levelOption, 1)">
                            </span>
                        </li>
                    </ul>
                </el-collapse-item>
            </el-collapse>
            <el-collapse class="c-left">
              <el-collapse-item title="数据展示开关">
                <ul class="m-ul">
                    <li class="m-li clearfix" v-for="(item, index) in dataOption">
                        <span class="m-text">{{item.name}}</span>
                        <span 
                            class="m-switch" 
                            :class="{'active': item.flag, 'disabled': item.disabled}" 
                            @click="switchHandle(item, index, dataOption, 2)">
                        </span>
                    </li>
                </ul>
              </el-collapse-item>
            </el-collapse>
        </div>
        <div class="c-scroll-wrap">
            <ul class="c-scroll-inner m-ul">
                <li class="m-li" v-for="(item, key) in drawObj">
                    <p class="c-title">{{key}}</p>
                    <ul class="c-fusion-box m-sub-ul">
                        <li class="m-sub-li" v-for="items in item">
                            <span class="overview-sign perception-sign"></span>
                            <span>{{items}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <ul class="m-data-wrapper">
            <li class="c-fusion-box">
                <p class="m-data-title">BSM/TCP时延</p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" id="platform-receive" :color="echartsOption.orange"></echarts-one>
                    <echarts-one class="m-echarts" id="platform-send" :color="echartsOption.green"></echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">感知数据时延</p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" id="perception-receive" :color="echartsOption.orange"></echarts-one>
                    <echarts-one class="m-echarts" id="perception-send" :color="echartsOption.green"></echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">SPAT时延</p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" id="spat-receive" :color="echartsOption.orange"></echarts-one>
                    <echarts-one class="m-echarts" id="spat-send" :color="echartsOption.green"></echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">融合车辆数量</p>
                <echarts-two class="m-echarts-box m-echarts" id="fusion-count"></echarts-two>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">感知数量统计</p>
                <echarts-three class="m-echarts-box m-echarts" id="perception-count"></echarts-three>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">RSI事件统计</p>
                <echarts-four class="m-echarts-box m-echarts" id="rsi-count"></echarts-four>
            </li>
        </ul>
    </div>
</template>
<script>
import echartsOne from './components/echartsOne'
import echartsTwo from './components/echartsTwo'
import echartsThree from './components/echartsThree'
import echartsFour from './components/echartsFour'
export default {
    components: {
        echartsOne,
        echartsTwo,
        echartsThree,
        echartsFour
    },
    data() {
        return {
            levelOption: [
                {
                    type: 'platform',
                    flag: true,
                    disabled: false,
                    name: '联网数据',
                }, {
                    type: 'perception',
                    flag: true,
                    disabled: false,
                    name: '感知数据',
                }, {
                    type: 'warning',
                    flag: true,
                    disabled: false,
                    name: '预警信息',
                }, {
                    type: 'roadsidePoints',
                    flag: true,
                    disabled: false,
                    name: '路侧点',
                }, {
                    type: 'spat',
                    flag: true,
                    disabled: false,
                    name: '信号灯',
                }, {
                    type: 'baseRoadNetwork',
                    flag: true,
                    disabled: true,
                    name: '基础路网',
                }
            ],
            levelOptionShowNum: 0,
            dataOption: [
                {
                    type: 'preData',
                    flag: true,
                    disabled: false,
                    name: '感知数据', 
                },
                {
                    type: 'echartsData',
                    flag: true,
                    disabled: false,
                    name: '统计数据', 
                }
            ],
            drawObj: {
                "title1": [1-1,1-2,1-3]
            },
            echartsOption: {
                orange: "#ec9524",
                green: "#95f204",
                red: "#d9001b",
                blue: "#02a7f0",
                yellow: "#ffff80"
            }
        }
    },
    watch: {
        levelOption: {
            handler(newVal, oldVal) {
                let _option = newVal.filter(item => item.flag);
                this.levelOptionShowNum = _option.length;
            },
            deep: true
        }
    },
    mounted(){
        this.levelOptionShowNum = this.levelOption.length;
        document.addEventListener('click', this.collapseClose);
    },
    methods: {
        switchHandle(item, index, obj, status) {
            if(!item.disabled) {
                obj[index].flag = !obj[index].flag;
            }
            if(status == 1) {
                let _camData = {
                    type: item.type,
                    flag: item.flag
                }
                document.getElementById("c-iframe").contentWindow.postMessage(_camData, '*');
            }
            if(status == 2) {
                if(item.type) {

                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.m-wrapper {
    height: 100%;
    .m-select-wrap {
        position: absolute;
        left: 10px;
        top: 100px;
        z-index: 2;
        .el-collapse {
            border: 1px solid $borderColorLight;
        }
        .m-ul {
            color: #fff;
            .m-li {
                padding: 0 20px;
                height: 30px;
                line-height: 30px;
                .m-text {
                    float: left
                }
                .m-switch {
                    float: right;
                    margin-top: 7px;
                    position: relative;
                    width: 36px;
                    height: 16px;
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: rgb(48, 48, 48);
                    cursor: pointer;
                    &:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 16px;
                        height: 16px;
                        border-radius: 100%;
                        background-color: #fff;
                    }
                    &.active {
                        background-color: rgb(220, 140, 0);
                        &:after {
                            left: auto;
                            right: 0;
                        }
                    }
                    &.disabled {
                        background-color: rgba(48, 48, 48, 0.5) !important;
                        cursor: default !important;
                        &.active {
                            background-color: rgba(220, 140, 0, 0.5) !important;
                        }
                    }
                }
            }
        }
    }
    .c-scroll-wrap {
        height: auto;
        position: absolute;
        left: 10px;
        top: 140px;
        z-index: 1;
        max-height: calc(100% - 170px);
        .c-title {
            margin: 0;
            font-size: 14px;
        }                             
    }
    .m-sub-ul {
        margin: 10px 0 0;
        min-width: 150px;
        padding: 10px; 
        // line-height: 28px; 
        // font-size: 14px;
        line-height: 20px; 
        font-size: 12px;
        .m-sub-li {
            position: relative;
            padding-left: 22px;
            &:before {
                content: ''; 
                position: absolute; 
                left: 0; 
                top: 50%; 
                // margin-top: -7px; 
                // width: 14px; 
                // height: 14px; 
                margin-top: -5px; 
                width: 10px; 
                height: 10px; 
                border-radius: 50%; 
                overflow: hidden; 
                background-color: #4eaf6b;
            }
        }
    }
    .m-data-wrapper {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 5;
        height: 180px;
        padding: 20px 5px;
        background: linear-gradient(to top, rgba(0, 0 ,0 , .6) 30%, rgba(0, 0 ,0 , 0));
        @include layoutMode(all);
        .c-fusion-box {
            flex: 1;
            height: 100%;
            margin: 0 5px;
            padding: 10px;
        }
        .m-data-title {
            color: #fff;
            font-size: 14px;
            line-height: 20px;
        }
        .m-echarts-box {
            position: absolute;
            left: 10px;
            right: 10px;
            top: 40px;
            bottom: 10px;
            &.m-echarts {
                background-color: rgba(0, 0, 0, 0.3);
            }
            .m-echarts {
                height: 48%;
                background-color: rgba(0, 0, 0, 0.3);
                margin-bottom: 2%;
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>
<style lang="scss">
@import '@/assets/scss/theme.scss';
.m-select-wrap {
    .el-collapse-item__header {
        background-color: $background;
        border-color: $borderColorLight;
        color: #fff;
        height: 30px;
        line-height: 30px;
        padding: 0 20px;
        .el-collapse-item__arrow {
            margin: 0 0 0 8px;
        }
    }
    .el-collapse-item__wrap {
        background-color: $background;
        border-color: $borderColorLight;
        padding: 10px 0;
        .el-collapse-item__content {
            padding-bottom: 0;
        }
    }
}
</style>