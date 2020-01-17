<template>
    <div class="m-wrapper">
        <div class="m-select-wrap clearfix">
            <el-collapse ref="optionShowNum" v-model="optionShowNum" class="c-left">
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
            <el-collapse ref="dataOptionEnable" v-model="dataOptionEnable" class="c-left">
              <el-collapse-item :title="'数据统计：'+dataOptionShowNum">
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
        <div class="c-scroll-wrap" :class="dataOption[0].flag ? 'active' : ''">
            <ul class="c-scroll-inner m-ul">
                <li class="m-li" v-for="(item, key) in filterPerCarData">
                    <p class="c-title">{{key}}</p>
                    <ul class="c-fusion-box m-sub-ul">
                        <li class="m-sub-li" v-for="items in item">
                            <span class="overview-sign perception-sign"></span>
                            <span>
                                {{items.vehicleId.substr(0,4)+"_"+items.vehicleId.substring(items.vehicleId.length-4)}},
                                {{items.longitude.toFixed(9)}},
                                {{items.latitude.toFixed(9)}},
                                {{items.speed.toFixed(1)+'km/h'}},
                                {{items.heading.toFixed(1)+'°'}}
                            </span>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <ul class="m-data-wrapper" :class="dataOption[1].flag ? 'active' : ''">
            <li class="c-fusion-box">
                <p class="m-data-title">
                    BSM/TCP时延(s)
                    <span class="m-data-legend">
                        <i class="orange">接受</i>
                        <i class="green">发送</i>
                    </span>
                </p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" 
                        id="platform-receive" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.orange">
                    </echarts-one>
                    <echarts-one class="m-echarts" 
                        id="platform-send" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.green">
                    </echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">
                    感知数据时延(s)
                    <span class="m-data-legend">
                        <i class="orange">接受</i>
                        <i class="green">发送</i>
                    </span>
                </p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" 
                        id="perception-receive" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.orange">
                    </echarts-one>
                    <echarts-one class="m-echarts" 
                        id="perception-send" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.green">
                    </echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">
                    SPAT时延(s)
                    <span class="m-data-legend">
                        <i class="orange">接受</i>
                        <i class="green">发送</i>
                    </span>
                </p>
                <div class="m-echarts-box">
                    <echarts-one class="m-echarts" 
                        id="spat-receive" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.orange">
                    </echarts-one>
                    <echarts-one class="m-echarts" 
                        id="spat-send" 
                        :yData="[0, 2]" 
                        :lineColor="echartsOption.green">
                    </echarts-one>
                </div>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">
                    融合车辆数量
                    <span class="m-data-legend">
                        <i class="orange">联网车</i>
                        <i class="green">非注册车</i>
                    </span>
                </p>
                <echarts-two 
                    class="m-echarts-box m-echarts" 
                    id="fusion-count"
                    :lineColor="echartsOption">
                </echarts-two>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">
                    感知数量统计
                    <span class="m-data-legend">
                        <i class="orange">轿车</i>
                        <i class="green">货车</i>
                        <i class="red">公交车</i>
                        <i class="blue">非机动车</i>
                        <i class="yellow">行人</i>
                    </span>
                </p>
                <echarts-three 
                    class="m-echarts-box m-echarts" 
                    id="perception-count"
                    :lineColor="echartsOption">
                </echarts-three>
            </li>
            <li class="c-fusion-box">
                <p class="m-data-title">RSI事件统计</p>
                <echarts-four 
                    class="m-echarts-box m-echarts" 
                    id="rsi-count"
                    :lineColor="echartsOption">
                </echarts-four>
            </li>
        </ul>
    </div>
</template>
<script>
import echartsOne from './components/echartsOne'
import echartsTwo from './components/echartsTwo'
import echartsThree from './components/echartsThree'
import echartsFour from './components/echartsFour'
import { bind,unbind } from '@/utils/focus-outside.js'

export default {
    components: {
        echartsOne,
        echartsTwo,
        echartsThree,
        echartsFour
    },
    data() {
        let _this = this;
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
                    flag: false,
                    disabled: false,
                    name: '感知数据', 
                },
                {
                    type: 'echartsData',
                    flag: false,
                    disabled: false,
                    name: '统计数据', 
                }
            ],
            dataOptionShowNum: 0,
            perCarList: [],
            filterPerCarData: {},
            echartsOption: {
                orange: "#d38600",
                green: "#4eaf6b",
                red: "#d9001b",
                blue: "#02a7f0",
                yellow: "#ffff80"
            },
            optionShowNum:[],
            dataOptionEnable:[],
        }
    },
    watch: {
        // levelOption: {
        //     handler(newVal, oldVal) {
        //         let _option = newVal.filter(item => item.flag);
        //         this.levelOptionShowNum = _option.length;
        //     },
        //     deep: true
        // },
        // dataOption: {
        //     handler(newVal, oldVal) {
        //         let _option = newVal.filter(item => item.flag);
        //         this.dataOptionShowNum = _option.length;
        //     },
        //     deep: true
        // },
        perCarList: {
            handler(newVal, oldVal) {
                let _obj = {};
                newVal.forEach(item => {
                    if(!_obj[item.devId]) {
                        _obj[item.devId] = [];
                    }
                    _obj[item.devId].push(item);
                });
                this.filterPerCarData = _obj;
            },
            deep: true
        }
    },
    mounted(){
        this.levelOptionShowNum = this.levelOption.length;  
        this.dataOptionShowNum = this.dataOption.length;  
        this.bindMapClick();

        window.addEventListener('message', this.getMessage);
    },
    methods: {
        getMessage(e) {
            // e.data为父页面发送的数据
            let eventData = e.data;
            if(eventData.type == 'perCarList') {
                this.perCarList = eventData.data;
            }
        },
        collapseClose(){
            this.optionShowNum = []
            this.dataOptionEnable = []
        },
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
        },
        bindMapClick(){
            bind(this.$refs.optionShowNum.$el, this.collapseClose);
            bind(this.$refs.dataOptionEnable.$el, this.collapseClose);     
            window.addEventListener('message', e => {
                // e.data为父页面发送的数据
                let eventData = e.data;
                if(eventData.type == 'mapClick') {
                    this.collapseClose();
                }   
            });
        }
    },
    destoryed () {
        unbind(this.$refs.dropdown.$el, this.collapseClose);
        unbind(this.$refs.dropdown1.$el, this.collapseClose1);
        window.removeEventListener("message", this.getMessage);
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
        left: -600px;
        top: 140px;
        z-index: 1;
        max-height: calc(100% - 340px);
        transition: left .5s ease;
        &.active {
            left: 10px;
        }
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
        bottom: -220px;
        z-index: 5;
        height: 180px;
        padding: 10px 5px;
        background: linear-gradient(to top, rgba(0, 0 ,0 , .6) 30%, rgba(0, 0 ,0 , 0));
        @include layoutMode(all);
        transition: bottom .5s ease;
        &.active {
            bottom: 0;
        }
        .c-fusion-box {
            flex: 1;
            height: 100%;
            margin: 0 5px;
            padding: 10px;
        }
        .m-data-title {
            position: relative;
            color: #fff;
            font-size: 14px;
            line-height: 20px;
            .m-data-legend {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translate(0, -50%);
                max-width: 60%;
                font-size: 12px;
                line-height: 18px;
                text-align: right;
                i {
                    display: inline-block;
                    position: relative;
                    margin-left: 2px;
                    padding-left: 12px;
                    &:before {
                        content: '';
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        left: 0;
                        top: 50%;
                        transform: translate(0, -50%);
                    }
                    &.orange {
                        color: #d38600;
                        &:before {
                            background-color: #d38600;
                        }
                    }
                    &.green {
                        color: #4eaf6b;
                        &:before {
                            background-color: #4eaf6b;
                        }
                    }
                    &.red {
                        color: #d9001b;
                        &:before {
                            background-color: #d9001b;
                        }
                    }
                    &.blue {
                        color: #02a7f0;
                        &:before {
                            background-color: #02a7f0;
                        }
                    }
                    &.yellow {
                        color: #ffff80;
                        &:before {
                            background-color: #ffff80;
                        }
                    }
                }
            }
        }
        .m-echarts-box {
            position: absolute;
            left: 10px;
            right: 10px;
            top: 40px;
            bottom: 10px;
            &.m-echarts {
                // background-color: rgba(0, 0, 0, 0.3);
            }
            .m-echarts {
                height: 48%;
                // background-color: rgba(0, 0, 0, 0.3);
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