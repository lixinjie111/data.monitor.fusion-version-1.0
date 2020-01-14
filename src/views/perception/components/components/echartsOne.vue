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
            data: [1,0,1,0,2,0,2,0,2,0,2,0,2]
        }
    },
    mounted(){
        this.echarts = $echarts.init(document.getElementById(this.id));
        this.echarts.setOption(this.defaultOption());
    },
    methods: {
        defaultOption() {
            let option = {
                animation: false,
                grid:{
                    left: 40,
                    right: 0,
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
                    // min: this.yData[0],
                    // max: this.yData[this.yData.length],
                },
                series: {
                    type:'line',
                    symbol: 'none',
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

    }
}
</script>