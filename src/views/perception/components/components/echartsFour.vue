<template>
    <div class="c-position-trbl" :id="id"></div>
</template>
<script>
import $echarts from 'echarts'
import { findRByAST } from '@/api/fusion'
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
            trafficClassify: [],
            rsiList: [],
            sourceData: []
        }
    },
    watch: {
        sourceData: {
            handler(newVal, oldVal) {
                console.log(newVal);
                this.trafficClassify.forEach(item => {
                    item.children = [];
                });
                for(let warnId in newVal) {
                    // let _classity = warnId.split('_')[0];              // 事件分类key
                    // let _alertType = newVal[warnId].eventType.split('_')[1];      // 事件告警key
                    let _alertType = newVal[warnId].alertType;      // 事件告警key,alertType(-1：表示公司私有协议，非RSI)
                    if(alertType == -1) {
                        continue;
                    }
                    let _filterData = this.rsiList.filter(function(val,index,arr){
                        return (val._alertType == _alertType)
                    });
                    let _classity = warnId.split('_')[0];
                    if(_filterData.length) {
                        _classity = _filterData[0].statType;
                    }

                    let _msg = newVal[warnId].msg || '其他';      // 事件名称
                    console.log(warnId, _classity, _alertType, _msg);

                    let _isFirst = -1;
                    this.trafficClassify.forEach((item, index) => {
                        if(item.key == _classity) {
                            _isFirst = index;
                            let _isSecond = -1;
                            item.children.forEach((subItem, subIndex) => {
                                if(subItem.key == _alertType) {
                                    subItem.value ++;
                                    _isSecond = subIndex;
                                }
                            });
                            if(_isSecond < 0) {
                                this.trafficClassify[_isFirst].children.push({
                                    key: _alertType,
                                    name: _msg.substr(0,4),
                                    value: 1
                                });
                            }
                        }
                    });
                    if(_isFirst < 0) {
                        this.trafficClassify.push({
                            key: _classity,
                            name: _classity,
                            children: [{
                                key: _alertType,
                                name: _msg,
                                warnId: warnId,
                                value: 1
                            }]
                        });
                    }
                }
                // console.log(this.trafficClassify);
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
        this.findRByAST();
           
        window.addEventListener('message', this.getMessage);
    },
    methods: {
        findRByAST() {
            // console.log('获取rsi事件列表');
            findRByAST().then(res => {
                this.rsiList = res.data;
                console.log(this.rsiList);
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
                        rotate: 'tangential',
                        verticalAlign: 'middle',
                        align: 'center',
                        color: '#fff',
                        textBorderWidth: 0,
                        fontWeight: 'lighter',
                        fontFamily: 'Microsoft YaHei',
                        fontSize: 10,
                        border: 'none',
                        // formatter: function () {
                        //     return 'tangential';
                        // }
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