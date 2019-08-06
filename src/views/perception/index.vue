<template>
    <div class="fusion-style">
        <div class="fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :currentExtent="currentExtent" :spatCount="spatCount" :signCount="signCount"></left>
                </div>
            </div>
        </div>
        <div class="fusion-right">
            <right @getCurrentExtent="getCurrentExtent" @count="count"></right>
        </div>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right'
    export default {
        data() {
            return {
                webSocket:{},
                vehicleId:'B21E-00-021',
                currentExtent:[],
                spatCount:0,
                signCount:0
            }
        },
        methods: {
            getCurrentExtent(currentExtent){
                this.currentExtent = currentExtent;
                console.log("边界值："+this.currentExtent);
            },
            count(spatCount,signCount){
                this.spatCount = spatCount;
                this.signCount = signCount;
            }
        },
        components:{Left,Right},
        mounted() {

        }
    }
</script>
<style lang="scss" scoped>

    .fusion-style{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        .fusion-left{
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 270px;
            background: #1a1a1a;;
        }
        .fusion-right{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 270px;
        }
    }
</style>