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
                networkCar: new Array(10).fill(null), 
                unregisteredCar: new Array(10).fill(null)
            }
        }
    },
    watch: {
        sourceData: {
            handler(newVal, oldVal) {
                for(let key in this.filterData) {
                    this.filterData[key].shift();
                }
                let _networkCar = 0;
                let _unregisteredCar = 0;
                if(!newVal) {
                    return
                }
                newVal.forEach(item => {
                    if(item.type == 1) { //联网车
                        _networkCar++;
                    }
                    if(item.type == 2) { //非注册车
                        _unregisteredCar++;
                    }
                });
                this.filterData.networkCar.push(_networkCar);
                this.filterData.unregisteredCar.push(_unregisteredCar);
                // console.log(this.filterData);
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
                // console.log("perceptionData-------**************%%%%%%%%%%%%%%");
                // console.log(eventData.data);
                this.sourceData = eventData.data&&eventData.data.platFusionList ? eventData.data.platFusionList : [];
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
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 2
                        }
                    },
                    axisLabel:{
                        color:'#fff'
                    },
                    // max: 10,
                    min: 0,
                    max(value) {
                        return value.max > 10 ? value.max : 10
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
                    data: this.filterData.networkCar
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
                    data: this.filterData.unregisteredCar
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