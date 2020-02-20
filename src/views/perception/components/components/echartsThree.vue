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
        },
        resizeFlag: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            echarts: null,
            sourceData: {},
            filterData: {
                car: new Array(10).fill(0), 
                truck: new Array(10).fill(0),
                bus: new Array(10).fill(0),
                noMotor: new Array(10).fill(0),
                person: new Array(10).fill(0)
            }
        }
    },
    watch: {
        sourceData: {
            handler(newVal, oldVal) {
                for(let key in this.filterData) {
                    // console.log(key, this.sourceData[key]);
                    this.filterData[key].shift();
                    this.filterData[key].push(newVal[key]);
                }
                this.echarts.setOption(this.defaultOption());
            },
            deep: true
        },
        resizeFlag(newVal, oldVal) {
            this.echarts.resize();
        }
    },
    mounted(){
        this.echarts = $echarts.init(document.getElementById(this.id));
        // this.echarts.setOption(this.defaultOption());

        window.addEventListener('message', this.getMessage);
    },
    methods: {
        getMessage(e) {
            // e.data为父页面发送的数据
            let eventData = e.data;
            if(eventData.type == 'perceptionData') {
                this.sourceData = eventData.data;
                // console.log(this.sourceData);
            }
        },
        defaultOption() {
            let option = {
                animation: false,
                grid:{
                    left: 36,
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
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 2
                        }
                    },
                    axisLabel:{
                        color:'#fff'
                    },
                    // max(value) {
                    //     // return value.max * 2.5;
                    //     return 30;
                    // },
                    min: 0
                },
                series: [{
                    type: 'bar',
                    name: '轿车',
                    stack: 'one',
                    barWidth: '50%',
                    data: this.filterData.car
                },{
                    type: 'bar',
                    name: '货车',
                    stack: 'one',
                    barWidth: '50%',
                    data: this.filterData.truck
                },{
                    type: 'bar',
                    name: '公交车',
                    stack: 'one',
                    barWidth: '50%',
                    data: this.filterData.bus
                },{
                    type: 'bar',
                    name: '非机动车',
                    stack: 'one',
                    barWidth: '50%',
                    data: this.filterData.noMotor
                },{
                    type: 'bar',
                    name: '行人',
                    stack: 'one',
                    barWidth: '50%',
                    data: this.filterData.person
                }]
            };
            return option;
        }
    },
    destroyed(){
        window.removeEventListener("message", this.getMessage);
    }
}
</script>