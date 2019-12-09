<template>
    <!-- <iframe src="http://120.133.21.14:9093/fusionMonitorTwo/#/perception/310114_002/4/0.004/true?lng=121.1750307&lat=31.2826193&isShow=false" style="width: 100%; height: 100%;"></iframe> -->
   <!--  <div v-if="showFlag" style="width: 100%; height: 100%;">
        <iframe src="https://www.wellyyss.cn/ysCesium/views/index.html" style="width: 100%; height: 100%;"></iframe>
    </div> -->
    <div id="GISbox" ref="gisBox" style="width: 100%; height: 100%;"></div>
</template>
<script>

export default {
    data() {
        return {
            // showFlag: false
        }
    },
    mounted() {
        const _div = document.createElement("iframe");
        _div.id = "newID";
        _div.style.display = "none";
        //挂载在body里面，因为整个系统加载的时候，页面只有body，其他元素都还未加载
        document.body.appendChild(_div);
        setTimeout(() => {
            // this.showFlag = true;
            this.setGIS();
        }, 0);
    },
    // destoryed() {
    //     this.showFlag = false;
    // }
    methods: {
        setGIS() {
            //获取到3d的盒子
            var gis = document.getElementById("newID");
            //3d在页面中的样式，可根据自己的需求进行调整
            gis.style.display = "block";
            gis.style.position = "absolute";
            gis.style.top = "0px";
            gis.style.height = "100%";
            gis.style.width = "100%";
            // gis.src = "https://www.wellyyss.cn/ysCesium/views/index.html";
            // gis.src = "http://120.133.21.14:9093/fusionMonitorTwo/#/perception/310114_002/4/0.004/true?lng=121.1750307&lat=31.2826193&isShow=false";
            // gis.src = "http://120.133.21.14:9093/fusionMonitorThree/#/perception/310114_002/4/0.004/true?lng=121.1750307&lat=31.2826193&isShow=false";
            // gis.src = "http://120.133.21.14:9093/Cesium-map/index.html";
            gis.src = "https://map.baidu.com/@12953718,4841071,13z";
            //从body中移除
            document.body.removeChild(gis);
            //在本页面中的制定位置进行挂载
            // document.getElementById("GISbox").appendChild(gis);
                this.$refs.gisBox.appendChild(gis);
        },
        destory3D() {
            //获取到3d的盒子
            // var gis = document.getElementById("newID");
            // //隐藏
            // gis.style.display = "none";
            // //从当前页面中移除
            // document.getElementById("GISbox").removeChild(gis);

            //获取到3d的盒子
               var gis= this.$refs.gisBox.children[0];

                // var gis = document.getElementById("newID");
                //隐藏
                gis.style.display = "none";
                //从当前页面中移除
                this.$refs.gisBox.removeChild(gis);
                //重新挂载回body
//                 document.body.appendChild(gis);
        }
    },
    beforeDestroy(){
        //在本页面销毁前进行这一步操作
        this.destory3D()
    } 
}
</script>
