<template>
    <div class="fusion-left-style">
        <div class="fusion-header">
            <img src="@/assets/images/logo.png" class="header-img"/>
            感知融合平台
        </div>
        <div class="fusion-left-main">
            <div class="single-info">
                <div class="single-info-header">
                    <span>车牌号:沪A890104</span>
                    <span class="info-font">L4</span>
                </div>
                <div class="info-img">
                    <img src="@/assets/images/single/car.png" />
                </div>
            </div>
            <ul class="single-real clearfix">
                    <li class="real-li">
                        <p>方向盘转角</p>
                        <div class="real-content">
                            <span class="real-img">
                                 <img src="@/assets/images/single/turn.png" class="real-turn"/>
                            </span>
                            <span class="real-text">0.5°</span>
                        </div>
                    </li>
                    <li>
                        <p>转向灯</p>
                        <div class="real-content">
                            <img src="@/assets/images/single/left.png" class="turn-img"/>
                            <img src="@/assets/images/single/right.png"/>
                        </div>
                    </li>
                    <li class="real-li">
                        <p>油门</p>
                        <div class="real-content">
                            <div class="real-img-base oil-base">
                                <span class="real-img-style oil-style"></span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>刹车</p>
                        <div class="real-content">
                            <div class="real-img-base brake-base">
                                <span class="real-img-style brake-style"></span>
                            </div>
                        </div>
                    </li>
                </ul>
            <div class="fusion-left-map">
                <div class="map-style" id="singleMap"></div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                map:{},
                mapOption: {
                    center: this.$parent.defalutCenterPoint,
                    zoom: 11,
                    mapStyle: "amap://styles/7b007636f01d8a19e9cc2841a85dc083"
                },

            }
        },
        methods: {},
        mounted() {
            this.map = new AMap.Map('singleMap', this.mapOption);
        }
    }
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/theme.scss';
    .fusion-header{
        height: 60px;
        letter-spacing: 3px;
        font-size: 30px;
        @include layoutMode(both);
        background: #262626;
        .header-img{
            vertical-align: middle;
            padding-right: 8px;
        }
    }
    .fusion-left-main{
        padding:40px 20px;
        .single-info{
            border:1px solid rgba(211,134,0,0.5);
            text-align: center;
            height: 240px;
            .single-info-header{
                @include layoutMode(between);
                padding:0px 20px ;
                font-size: 20px;
                line-height: 48px;
                letter-spacing: 0px;
                color: #ddd9d1;
                .info-font{
                    color: #37ba7b;
                }
            }
            .info-img{
                display: block;
                line-height: 192px;
                height: 192px;
            }
        }
        .single-real{
            padding-top: 10px;
            padding-bottom: 10px;
            li{
                float: right;
                width: 48%;
                text-align: center;
                margin-bottom: 6px;
                border:1px solid rgba(211, 134, 0, 0.5);
                p{
                    font-size: 16px;
                    line-height: 48px;
                    color: #ddd9d1;
                }
                .real-content{
                    position: relative;
                    color: #d38600;
                    @include layoutMode(both);
                    height: 92px;
                    box-sizing: border-box;
                    padding-bottom: 20px;
                    .real-img{
                        display: inline-block;
                        width: 46px;
                        height: 46px;
                        border:1px solid #d38600;
                        border-radius: 50%;
                        position: relative;
                        &:before{
                            content: '';
                            width: 0;
                            height: 0;
                            border-width:6px;
                            border-color: transparent #d38600 transparent transparent;
                            display: block;
                            border-style: solid;
                            position: absolute;
                            left:-18px;
                            top: 16px;
                        }
                        &:after{
                            content: '';
                            width: 0;
                            height: 0;
                            border-width:6px;
                            border-color: transparent  transparent transparent #d38600;
                            display: block;
                            border-style: solid;
                            position: absolute;
                            right:-18px;
                            top: 16px;
                        }
                        .real-turn{
                            position: absolute;
                            left: 20px;
                        }
                    }
                    .real-text{
                        position: relative;
                        right: -18px;
                    }

                    .turn-img{
                        padding-right: 4px;
                    }
                }
            }
            .real-li{
                /*margin-right: 6px;*/
                float: left!important;
            }
            .real-img-base{
                display: inline-block;
                width: 80px;
                height: 0px;
                position: relative;
                .real-img-style{
                    display: inline-block;
                    width: 0px;
                    height: 16px;
                    position: absolute;
                    top: -8px;
                }
            }
            .oil-base{
                border-top:2px solid #23b318;
                .oil-style{
                    border-left:4px solid #23b318;
                }
            }
            .brake-base{
                border-top:2px solid #c73610;
                .brake-style{
                    border-left:4px solid #c73610;
                }
            }

        }
        .fusion-left-map{
            height:200px;
            border:1px solid rgba(211,134,0,0.5);
            .map-style{
                height: 100%;
            }
        }
    }
</style>