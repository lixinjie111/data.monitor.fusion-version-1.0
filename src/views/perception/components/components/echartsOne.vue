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
        yData: {
            type: Array
        },
        lineColor: {
            type: String
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
            if(newVal) {
                this.echarts.setOption(this.defaultOption());
                this.$emit('resizeCallback');
            }
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
            console.log(this.lastTime, this.nowTime,'&&&&&&&&&&&&& '+(this.nowTime - this.lastTime)/1000);
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
                    console.log("平台车-----------", this.type);
                    console.log(this.sourceData);
                }
            }
            if(eventData.type == 'perceptionCarsList') {  // 感知车
                if(this.id.indexOf("perception-") != -1) {
                    this.sourceData = eventData.data || [];
                    console.log("感知车-----------", this.type);
                    console.log(this.sourceData);
                }
            }
            if(eventData.type == 'spatList') {  // 感知车
                if(this.id.indexOf("spat-") != -1) {
                    this.sourceData = eventData.data || [];
                    console.log("红绿灯-----------", this.type);
                    console.log(this.sourceData);
                }
            }
        },
        defaultOption() {
            let option = {
                animation: false,
                grid:{
                    left: 40,
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
                    // boundaryGap: false,
                    // boundaryGap: [0, 0],
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
                        show: false
                    },
                    axisLabel:{
                        color:'#fff'
                    },
                    // data: this.yData,
                    min: this.yData[0],
                    max: this.yData[this.yData.length],
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