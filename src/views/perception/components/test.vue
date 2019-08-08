<template>

    <div class="map">
        <tusvn-map :target-id="'mapFusion'"  ref="map"
                   background="black" minX=325295.155400   minY=3461941.703700  minZ=50
        maxX=326681.125700  maxY=3462723.022400  maxZ=80
        @mapcomplete="onMapComplete" @CameraChanged='cameraChanged'>
        </tusvn-map>
    </div>
</template>

<script>
    import TusvnMap from '@/components/Tusvn3DMap2'
    import {getMap} from '@/utils/tusvnMap.js';
    export default {
        data() {
            return {
                isFirst:false
            }
        },
        components: {TusvnMap},
        methods: {
            onMapComplete(){
                getMap(this.$refs.map);
                this.$refs.map.updateCameraPosition(326343.19123227906,3462351.5698124655,219.80550560213806,214.13348995135274,-1.5707963267948966,-2.7070401557402715);
                setTimeout(()=>{
                    console.log("向下移动5米")
                    let obj = this.$refs.map.getCamera();
                    //向左移5米
                    let x = obj.x;
                    let y = obj.y-5;
                    let z = obj.z;
                    let radius = obj.radius;
                    let pitch = obj.pitch;
                    let yaw = obj.yaw;
                    this.$refs.map.updateCameraPosition(x,y,z,radius,pitch,yaw);
                },5000)
                },
            cameraChanged(){
            }
        },
        mounted() {

        }
    }
</script>
<style scoped>
    .map{
        height:900px;
    }
</style>