<template>
    <div class="c-box">
        <div class="c-fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :currentExtent="currentExtent" :spatCount="spatCount" :signCount="signCount" :perceptionData="perceptionData" :warningCount="warningCount" :vehData="vehData" v-show="leftShow"></left>
                </div>
            </div>
        </div>
        <right></right>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right'
    import HeaderTop from '../../components/header/index.vue';
    export default {
        data() {
            return {
                currentExtent:[],
                spatCount:0,
                signCount:0,
                time:0,
                perceptionData:{},
                vehData:{},
                leftShow:true,
                warningCount:0
            }
        },
        components:{
            HeaderTop,Left,Right
        },
        methods: {

        },
        mounted() {
            let _this = this;
            let leftShow = _this.$route.params.leftShow;
            if(leftShow=='true'){
                _this.leftShow=true;
            }else{
                _this.leftShow=false;
            }
        },
        destroyed(){
            clearInterval(this.time);
        }
    }
</script>
<style lang="scss" scoped>
.c-fusion-left{
    width: 310px;
}
</style>