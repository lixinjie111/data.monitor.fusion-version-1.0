<template>
    <div class="c-position-trbl" :id="id"></div>
</template>
<script>
import {getTrafficClassify} from '@/api/fusion'
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
            trafficClassify: [],
            sourceData: [],
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
            handler(newVal, oldVal) {
                this.trafficClassify.forEach(item => {
                    item.children = [];
                });
                for(let warnId in newVal) {
                    let _classity = warnId.split('_')[0];              // 事件分类key
                    let _category = newVal[warnId].eventType.split('_')[1];      // 事件告警key

                    let _isFirst = -1;
                    this.trafficClassify.forEach((item, index) => {
                        if(item.key == _classity) {
                            _isFirst = index;
                            let _isSecond = -1;
                            item.children.forEach((subItem, subIndex) => {
                                if(subItem.key == _category) {
                                    subItem.value ++;
                                    _isSecond = subIndex;
                                }
                            });
                            if(_isSecond < 0) {
                                this.trafficClassify[_isFirst].children.push({
                                    key: _category,
                                    name: item.msg,
                                    value: 1
                                });
                            }
                        }
                    });
                }
                console.log(this.trafficClassify);
                this.echarts.setOption(this.defaultOption());
            }
        }
    },
    created() {
        this.getTrafficClassify();
    },
    mounted(){
        this.echarts = $echarts.init(document.getElementById(this.id));
        this.echarts.setOption(this.defaultOption());

        window.addEventListener('message', this.getMessage);
    },
    methods: {
        getTrafficClassify() {
            getTrafficClassify({
                parentCode: "trafficType"
            }).then(res => {
                if(res.status == 200) {
                    res.data.forEach((item, index) => {
                        if(!this.trafficClassify[index]) {
                            this.trafficClassify[index] = {
                                key: item.key,
                                name: item.name,
                                children: []
                            }
                        }
                    });
                }
            });
        },
        getMessage(e) {
            // e.data为父页面发送的数据
            let eventData = e.data;
            if(eventData.type == 'warningData') {
                this.sourceData = eventData.data;
            }
        },
        defaultOption() {
            let option = {
                silent: true,
                series: {
                    radius: ['25%', '99%'],
                    type: 'sunburst',
                    sort: null,
                    highlightPolicy: 'ancestor',
                    data: this.trafficClassify,
                    label: {
                        show: false
                    },
                    levels: [{}, {
                        itemStyle: {
                            color: this.lineColor.red
                        }
                    }, {
                        itemStyle: {
                            color: this.lineColor.orange
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