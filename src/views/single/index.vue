<template>
    <div class="c-map">
        <iframe 
            @load ="onLoadMap" 
            :src="iframeUrl" 
            id="c-iframe" 
            class="c-iframe">
        </iframe>
        <right></right>
    </div>
</template>
<script>
    import Right from './components/right.vue'
    export default {
        data() {
            return {
                // iframeUrl: window.config.staticUrl+'cesium-map/modules/fusionMonitor/single.html?vehicleId='+this.$route.params.vehicleId+'&delayTime='+this.$route.query.delayTime+"&v="+new Date().getTime(),
                iframeUrl: 'http://127.0.0.1:8080/modules/fusionMonitor/single.html?vehicleId='+this.$route.params.vehicleId+'&delayTime='+this.$route.query.delayTime+"&v="+new Date().getTime(),
            }
        },
        components:{ Right },
        methods: {
            onLoadMap() {
                // 获取路侧点列表
                let _sideListData = {
                    type: 'updateSideList',
                    data: sessionStorage.getItem("sideList")
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_sideListData,'*');
            },
        }
    }
</script>