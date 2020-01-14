<template>
    <div class="c-position-trbl" :id="id"></div>
</template>
<script>
import $echarts from 'echarts'
export default {
    props:{
        id: {
            type: String
        },
        lineColor: {
            type: Object
        }
    },
    data() {
        return {
            echarts: null,
            data: [1,0,1,0,2,0,2,0,2,0,2,0,2],
            data2: [10,30,10,40,20,10,20,30,20,10,20,10,12]
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
                    splitLine: {
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
                    }
                },
                series: [{
                    type:'line',
                    symbol: 'none',
                    step: 'end',
                    itemStyle: {
                        normal: {
                            color: "#fff"
                        }
                    },
                    lineStyle: {
                        color: this.lineColor.orange
                    },
                    data: this.data
                },{
                    type:'line',
                    symbol: 'none',
                    step: 'end',
                    itemStyle: {
                        normal: {
                            color: "#fff"
                        }
                    },
                    lineStyle: {
                        color: this.lineColor.green
                    },
                    data: this.data2
                }]
            };
            return option;
        }

    }
}
</script>