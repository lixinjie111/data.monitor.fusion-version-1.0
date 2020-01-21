<template>
    <div class="c-box" :id="id"></div>
</template>
<script>
import $echarts from 'echarts'
export default {
    props:{
        id: {
            type: String
        },
        lineColor: {
            type: String
        },
        resizeFlag: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            echarts: null,
            sourceData: [],
            flag: false,
            type: '',
            nowTime: null,
            lastTime: null,
            data: new Array(10).fill(null)
        }
    },
    watch: {
        sourceData: {
            handler(newVal, oldVal) {
                if(newVal.length) {
                    this.averageNum(newVal);
                }
            },
            deep: true
        },
        resizeFlag(newVal, oldVal) {
            this.echarts.resize();
        }
    },
    mounted(){
        if(this.id.indexOf("receive") != -1) {  // gpsTime 接收时间
            if(this.id.indexOf("spat-") != -1) {
                this.type = 'spatTime';
            }else {
                this.type = 'gpsTime';
            }
        }
        if(this.id.indexOf("send") != -1) {  // updateTime 发送时间
            this.type = 'updateTime';
        }

        this.echarts = $echarts.init(document.getElementById(this.id));
        // this.echarts.setOption(this.defaultOption());

        window.addEventListener('message', this.getMessage);
    },
    methods: {
        averageNum(arr) {
            let _length = arr.length;
            let _count = 0;
            arr.forEach(item => {
                _count += parseFloat(item[this.type]);
            });
            this.nowTime = _count/_length;

            // if(this.type == 'gpsTime') {
            //     console.log(this.lastTime, this.nowTime,'&&&&&&&&&&&&& '+(this.nowTime - this.lastTime)/1000);
            // }
            if(!this.flag) {
                this.flag = true;
            }else {
                this.data.shift();
                this.data.push((this.nowTime - this.lastTime)/1000);
                this.echarts.setOption(this.defaultOption());
            }
            this.lastTime = this.nowTime;
        },
        getMessage(e) {
            // e.data为父页面发送的数据
            let eventData = e.data;
            if(eventData.type == 'platCarsList') {  // 平台车
                if(this.id.indexOf("platform-") != -1) {
                    this.sourceData = eventData.data&&eventData.data.platCars ? eventData.data.platCars : [];
                    // if(this.type == 'gpsTime') {
                    //     console.log("平台车-----------", this.type);
                    //     // console.log(this.sourceData); 
                    // }
                }
            }
            if(eventData.type == 'perceptionCarsList') {  // 感知车
                if(this.id.indexOf("perception-") != -1) {
                    this.sourceData = eventData.data || [];
                    // if(this.type == 'updateTime') {
                    //     console.log(new Date().getTime());
                    // }
                }
            }
            if(eventData.type == 'spatList') {  // 信号灯
                if(this.id.indexOf("spat-") != -1) {
                    this.sourceData = eventData.data || [];
                    // if(this.type == 'spatTime') {
                    //     console.log("信号灯-----------", this.type);
                    //     // console.log(this.sourceData); 
                    // }
                }
            }
        },
        defaultOption() {
            let option = {
                animation: false,
                grid:{
                    left: 30,
                    right: 2,
                    top: 8,
                    bottom: 5
                },
                xAxis: {
                    type: 'category',
                    show: false,
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    // minInterval: 1,
                    splitLine: {
                        // interval(index, val) {
                        //     if(index == 1){
                        //         return true;
                        //     }else{
                        //         return false;
                        //     }
                        // },
                        // lineStyle:{
                        //     color: '#fff',
                        //     lineStyle: {
                        //         width: 1
                        //     }
                        // },
                        show: false
                    },
                    axisLine:{
                        show: true,
                        lineStyle: {
                            color: "#fff"
                        }
                    },
                    axisTick:{
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 2
                        }
                    },
                    axisLabel:{
                        color:'#fff'
                    },
                    min: 0,
                    max: 2,
                },
                series: {
                    type:'line',
                    symbol: 'emptyCircle',
                    symbolSize: 2,
                    itemStyle: {
                        normal: {
                            color: "#fff"
                        }
                    },
                    lineStyle: {
                        color: this.lineColor
                    },
                    data: this.data
                }
            };
            return option;
        }
    },
    destroyed(){
        window.removeEventListener("message", this.getMessage);
    }
}
</script>