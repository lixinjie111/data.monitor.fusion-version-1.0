<template>
    <div style="width: 400px;height: 100%;">
        <iframe :src="src" ref="iframe" width="100%" height="100%"></iframe>
    </div>
</template>

<script>

    export default {
        data () {
            return {
                src: 'http://localhost:8082/#/liveTest',
                iframeWin: {}
            }
        },
        methods: {
            sendMessage () {
                // 外部vue向iframe内部传数据
                this.iframeWin.postMessage({
                    cmd: 'getFormJson',
                    params: {}
                }, '*')
            },
        },
        mounted () {
            let _this = this;
            // 在外部vue的window上添加postMessage的监听，并且绑定处理函数handleMessage
//            window.addEventListener('message', this.handleMessage)
            let iframe = this.$refs.iframe;
            this.iframeWin = this.$refs.iframe.contentWindow
            iframe.onload=function () {
                console.log("文档加载完毕")
                _this.sendMessage();
            }
//            this.sendMessage();
            /*setTimeout(()=>{
                this.sendMessage();
            },1000)*/
        },
        handleMessage (event) {
            // 根据上面制定的结构来解析iframe内部发回来的数据
            const data = event.data
            switch (data.cmd) {
                case 'returnFormJson':
                    // 业务逻辑
                    break
                case 'returnHeight':
                    // 业务逻辑
                    break
            }
        }
    }
</script>