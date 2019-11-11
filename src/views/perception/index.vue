<template>
    <div class="fusion-style">
        <div class="fusion-layout">
            <div class="c-fusion-left fusion-left">
                <div class="c-scroll-wrap">
                    <div class="c-scroll-inner">
                        <left :currentExtent="currentExtent" :spatCount="spatCount" :signCount="signCount" :perceptionData="perceptionData" :warningCount="warningCount" :vehData="vehData" v-show="leftShow"></left>
                    </div>
                </div>
            </div>
            <right></right>
        </div>
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
                leftShow:true
            }
        },
        components:{
            HeaderTop,Left,Right
        },
       /* watch:{
            '$route':function (newValue,oldValue) {
//                console.log(newValue.lon,newValue.lat);
                this.$router.replace("/refresh");
            },
        },*/
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
            //销毁Socket
//            this.socket.close();
            clearInterval(this.time);
        }
    }
</script>
<style lang="scss" scoped>

    .fusion-style{
        width: 100%;
        height: 100%;
        .fusion-left{
            width: 310px;
        }
    }
</style>