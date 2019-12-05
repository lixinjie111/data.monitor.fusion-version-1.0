<template>
    <div class="fusion-layout">
        <div class="c-fusion-left fusion-left">
            <div class="c-scroll-wrap">
                <div class="c-scroll-inner">
                    <left :canData="canData" :routeData="routeData"></left>
                </div>
            </div>
        </div>
        <right></right>
    </div>
</template>
<script>
    import Left from './components/left.vue'
    import Right from './components/right.vue'
    export default {
        data() {
            return {
                realData:{
                    oilDoor:0,
                    brakePedal:0,
                    headingAngle:0,
                    turnLight:'',
                    gpsTime:''
                },
                canConnectCount:0,
                routeData:{},
                canData:{}
            }
        },
        methods: {},
        components:{Left,Right},
        mounted() {},
       /* beforeRouteEnter(to, from, next) {
            debugger
            console.log(this, 'beforeRouteEnter'); // undefined
            console.log(to, '组件独享守卫beforeRouteEnter第一个参数');
            console.log(from, '组件独享守卫beforeRouteEnter第二个参数');
            console.log(next, '组件独享守卫beforeRouteEnter第三个参数');
            next(vm => {
                //因为当钩子执行前，组件实例还没被创建
                // vm 就是当前组件的实例相当于上面的 this，所以在 next 方法里你就可以把 vm 当 this 来用了。
                console.log(vm);//当前组件的实例
            });
        },*/
        destroyed(){
            //销毁Socket
            this.webSocket&&this.webSocket.close();
        }
    }
</script>
<style lang="scss" scoped>
    .fusion-left{
        width: 310px;
    }
    .fusion-layout{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
</style>