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
            sourceData: {},
            // data: [],
            data: [{
                value: 8,
                children: [{
                    value: 4
                }, {
                    value: 2
                }]
            }, {
                value: 4,
                children: [{
                        value: 2
                }]
            }, {
                value: 4,
                children: [{
                    value: 2
                }]
            }, {
                value: 3,
                children: [{
                    value: 1
                }]
            }],
        }
    },
    watch: {
        sourceData: {
            // handler(newVal, oldVal) {
            //     let _filterData = {};
            //     console.log(newVal);
            //     for(warnId in newVal) {
            //         let _classity = warnId.split('_')[0];              // 事件分类key
            //         let _category = newVal[warnId].eventType.split('_')[1];      // 事件告警key
            //         let _obj = _filterData[_classity];              // 事件分类key
            //         if(!_obj) {
            //             _obj = {
            //                 code: _classity,
            //                 children: []
            //             }
            //         }
            //         for(categoryCode in _obj.children) {
            //             let _categoryObj = _filterData[_classity];
                        
            //         }
            //     }
            // }
        }
    },
    mounted(){
        this.echarts = $echarts.init(document.getElementById(this.id));
        this.echarts.setOption(this.defaultOption());

        window.addEventListener('message', this.getMessage);
    },
    methods: {
        getMessage(e) {
            // e.data为父页面发送的数据
            let eventData = e.data;
            if(eventData.type == 'warningData') {
                console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                console.log("warningData");
                // this.sourceData = eventData.data;
            }
        },
        defaultOption() {
            let option = {
                silent: true,
                series: {
                    radius: ['25%', '100%'],
                    type: 'sunburst',
                    sort: null,
                    highlightPolicy: 'ancestor',
                    data: this.data,
                    // label: {
                    //     color: '#fff',
                    //     textBorderColor: '#666',
                    //     textBorderWidth: 2,
                    //     borderColor: '#999',
                    //     borderWidth: 1,
                    //     formatter: function (param) {
                    //         var depth = param.treePathInfo.length;
                    //         if (depth === 2) {
                    //             return 'radial';
                    //         }
                    //         else if (depth === 3) {
                    //             return 'tangential';
                    //         }
                    //         else if (depth === 4) {
                    //             return '0';
                    //         }
                    //     }
                    // },
                    levels: [{}, {
                        itemStyle: {
                            color: 'red'
                        },
                        label: {
                            rotate: 'radial'
                        }
                    }, {
                        itemStyle: {
                            color: 'orange'
                        },
                        label: {
                            rotate: 'tangential'
                        }
                    }, {
                        itemStyle: {
                            color: 'yellow'
                        },
                        label: {
                            rotate: 0
                        }
                    }]
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