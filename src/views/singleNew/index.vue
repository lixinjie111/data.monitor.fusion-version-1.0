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
                iframeUrl: 'http://127.0.0.1:8080/modules/fusionMonitor/single.html?vehicleId='+this.$route.params.vehicleId+'&delayTime='+this.$route.query.delayTime
            }
        },
        components:{ Right },
        methods: {
            onLoadMap() {
                let _camData = {
                    type: 'updateSideList',
                    data: sessionStorage.getItem("sideList")
                };
                document.getElementById("c-iframe").contentWindow.postMessage(_camData,'*');
            },
        }
    }
</script>