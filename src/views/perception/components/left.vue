<template>
    <div class="m-wrapper">
        <div class="m-select-wrap">
            <el-collapse>
              <el-collapse-item title="图层数量：6">
                <ul class="m-ul">
                    <li class="m-li clearfix" v-for="(item, index) in levelOption">
                        <span class="m-text">{{item.name}}</span>
                        <span 
                            class="m-switch" 
                            :class="{'active': item.flag, 'disabled': item.disabled}" 
                            @click="switchHandle(item, index)">
                        </span>
                    </li>
                </ul>
              </el-collapse-item>
            </el-collapse>
        </div>
        <div class="c-scroll-wrap">
            <div class="c-scroll-inner">
                <div style="height: 2000px;width: 50px; background-color: red;margin-bottom: 50px;"></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            levelOption: [
                {
                    type: '1',
                    flag: true,
                    disabled: false,
                    name: '联网数据',
                }, {
                    type: '2',
                    flag: true,
                    disabled: false,
                    name: '感知数据',
                }, {
                    type: '3',
                    flag: true,
                    disabled: false,
                    name: '预警信息',
                }, {
                    type: '4',
                    flag: true,
                    disabled: false,
                    name: '路侧点',
                }, {
                    type: '5',
                    flag: true,
                    disabled: false,
                    name: '信号灯',
                }, {
                    type: '6',
                    flag: true,
                    disabled: true,
                    name: '基础路网',
                }
            ],
        }
    },
    watch: {
        levelOption: {

        }
    },
    mounted(){
    },
    methods: {
        switchHandle(item, index) {
            if(!item.disabled) {
                this.levelOption[index].flag = !this.levelOption[index].flag;
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
                        background-color: rgba(220, 140, 0, 0.7) !important;
                        cursor: default !important;
                    }
                }
            }
        }
    }
    .c-scroll-wrap {
        height: auto;
        position: absolute;                                                          
        left: 10px;
        top: 150px;
        z-index: 1;
        max-height: calc(100% - 170px);                             
    }
}
</style>
<style lang="scss">
@import '@/assets/scss/theme.scss';
.m-select-wrap {
    .el-collapse-item__header {
        background-color: $backgroundRgba;
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
        background-color: $backgroundRgba;
        border-color: $borderColorLight;
        padding: 10px 0;
        .el-collapse-item__content {
            padding-bottom: 0;
        }
    }
}
</style>