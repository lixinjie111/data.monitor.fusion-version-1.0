<template>
    <div class="c-map">
        <iframe :src="iframeUrl" class="c-iframe"></iframe>
        <right></right>
    </div>
</template>
<script>
    import Right from './components/right.vue'
    export default {
        data() {
            return {
                iframeUrl: 'http://127.0.0.1:8080/fusionMonitor/single.html?vehicleId='+this.$route.params.vehicleId+'&delayTime='+this.$route.query.delayTime
            }
        },
        components:{ Right },
        mounted() {}
    }
</script>