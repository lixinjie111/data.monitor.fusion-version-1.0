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
            echarts: null
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
                color: [this.lineColor.orange, this.lineColor.green, this.lineColor.red, this.lineColor.blue, this.lineColor.yellow],
                xAxis: {
                    type: 'category',
                    show: false
                },
                yAxis:  {
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
                    },
                    max(value) {
                        return value.max * 5;
                    }
                },
                series: [{
                    type: 'bar',
                    name: '轿车',
                    stack: 'one',
                    barWidth: '50%',
                    data: [1,2,3,4,5,6,7,8,9,10]
                },{
                    type: 'bar',
                    name: '货车',
                    stack: 'one',
                    barWidth: '50%',
                    data: [11,12,13,14,15,16,17,18,19,20]
                },{
                    type: 'bar',
                    name: '公交车',
                    stack: 'one',
                    barWidth: '50%',
                    data: [5,6,7,8,9,10,11,12,13,14]
                },{
                    type: 'bar',
                    name: '非机动车',
                    stack: 'one',
                    barWidth: '50%',
                    data: [5,6,7,8,9,10,11,12,13,14]
                },{
                    type: 'bar',
                    name: '行人',
                    stack: 'one',
                    barWidth: '50%',
                    data: [5,6,7,8,9,10,11,12,13,14]
                }]
            };
            return option;
        }

    }
}
</script>