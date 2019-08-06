<template>
        <ul class="bottom-overview">
           <li class="car-info-li" v-for="(item, index) in responseData" :key="item.vehicleId" @click="showView(item.vehicleId)">
                <div class="car-info">
                    <span class="car-index">{{index + 1}}</span>
                </div>
                <div class="car-detail">
                   <img :src="item.vehicleLogo" class="car-img" />
                </div>
                <div class="car-detail-info">
                    <p class="car-plate">{{item.plateNo}}</p>
                    <div class="driving-info">
                        <span class="driving-level">L{{item.autoLevel}}</span>
                        <span class="driving-trans">{{item.transmission}}</span>
                        <span class="direction" :style="{transform:'rotate('+ item.headingAngle +'deg)'}"></span>
                    </div>
                </div>
            </li>
        </ul>
</template>
<script>
import { getGpsRealConfig, getGpsRealList } from '@/api/overview/index.js';
export default {
	name: 'RightList',
	data () {
		return {
            items: 'nihao',
			vehicleIds: 'B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020',
			responseData: [],
			// 获取指定车辆实时信息
            webSocket:{},
            webSocketData: {
                // action: 'vehicleList',
                action: 'can_real_data',
                token: 'fpx',
                vehicleIds: 'B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020'
            }
		}
	},
	mounted() {
		this.getGpsRealConfig();
		// this.initWebSocket();
	},
	methods: {
        // 获取典型车辆
		getGpsRealConfig() {
			getGpsRealConfig().then(res => {
                this.vehicleIds = res.data;
				this.webSocketData.vehicleIds = res.data;
				this.initWebSocket();
			});
		},
		getGpsRealList() {
            // console.log('初始化页面，获取典型车辆列表实时信息');
			getGpsRealList({
				vehicleId: this.vehicleIds
			}).then(res => {
                let _responseData = res.data;
				_responseData.forEach(item => {
					this.initResult(item.vehicleId, item);
				});
			});
		},
        initResult(attr, result) {
    		let _filterResult = {};
			_filterResult.vehicleId = result.vehicleId;
			_filterResult.transmission = result.transmission;
			if(result.transmission != 'P') {
				_filterResult.speed = result.speed;
			}else {
				_filterResult.speed = 0;
			}
			_filterResult.headingAngle = result.headingAngle;
			_filterResult.turnLight = result.turnLight;
			_filterResult.autoLevel = result.autoLevel;
			_filterResult.vehicleLogo = result.vehicleLogo;
			_filterResult.plateNo = result.plateNo;

			// _filterResult.id = "echarts-" + attr;
			// _filterResult.echarts = null;
			// _filterResult.echartsData = [];
            // _filterResult.echartsData.push(result.speed);
            this.responseData.push(_filterResult);
        },
        initWebSocket(){
            // console.log('websocket获取指定车辆实时信息');
            if ('WebSocket' in window) {
                this.webSocket = new WebSocket(window.cfg.websocketUrl);  //获得WebSocket对象
            }
            this.webSocket.onmessage = this.onmessage;
            this.webSocket.onclose = this.onclose;
            this.webSocket.onopen = this.onopen;
            this.webSocket.onerror = this.onerror;
        },
        onmessage(message){
            let _json = JSON.parse(message.data),
            	_result = _json.result,
                _vehicleId = _result.vehicleId;
            this.responseData.forEach((item, index) => {
            	if (item.vehicleId === _vehicleId ) {
		            item.transmission = _result.transmission;
            		if(_result.transmission != 'P') {
		            	item.speed = _result.speed;
		            	item.headingAngle = _result.headingAngle;
		            	item.turnLight = _result.turnLight;
            		}else {
            			item.speed = 0;
            		}
            	}
            });
        },
        onclose(data){
            // console.log("结束--vehicleList--连接");
        },
        onopen(data){
            // console.log("建立--vehicleList--连接");
            //行程
            this.sendMsg(JSON.stringify(this.webSocketData));
        },
        sendMsg(msg) {
            // console.log("vehicleList--连接状态："+this.webSocket.readyState);
            if(window.WebSocket){
                if(this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    this.webSocket.send(msg); //send()发送消息
                    // console.log("vehicleList--已发送消息:"+ msg);
        			this.getGpsRealList();
                }
            }else{
                return;
            }
        },
        showView(carId) {
        	const { href } = this.$router.resolve({
                name: 'Single',
                params: {
                    vehicleId: carId
                }
            })
            window.open(href, '_blank')
        }
	},
    destroyed(){
        //销毁Socket
        this.webSocket.close();
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
.bottom-overview {
    display: flex;
    justify-content: center;
    align-items: center;
    .car-info-li {
        list-style-type: none;
        display: flex;
        // width: 269px;
        margin-right: 10px;
        cursor: pointer;
        background-color: rgba(94, 89, 112, 0.3);
        .car-index {
            text-align: center;
            width: 40px;
            font-size: 20px;
            line-height: 80px;
            letter-spacing: 2px;
            color: #ccc;
            display: inline-block;
            background-color: rgba(94, 89, 112, 0.3);
        }
        .car-detail {
            height: 80px;
            .car-img {
                width: 98px;
                height: 100%;
                display: block;
                padding: 0 9px;
				object-fit: cover;
            }
        }
        .car-detail-info {
            // height: 100%;
            .car-plate {
                font-size: 14px;
                padding-right: 16px;
            }
            .driving-info {
                line-height: 26px;
                height: 26px;
                padding-right: 16px;
                @include layoutMode(between);
                .driving-level{
                    width: 26px;
                    text-align: center;
					letter-spacing: 2px;
					background-color: #0b5330;
					border-radius: 3px;
                }
                .driving-trans{
                    font-size: 24px;
                    color: #dc8c00;
                    font-weight: bold;
                }
                .direction {
                    width: 16px;
                    background: url('../../../assets/images/carMonitor/arrow.png') no-repeat center center;
                    background-size: auto 24px;
                    transform-origin: center center !important;
                }
            }
        }
    }
    
}
</style>


