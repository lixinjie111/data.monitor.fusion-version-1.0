<template>
    <div class="slide-verify" id="slideVerify" onselectstart="return false;">
        <canvas :width="w" :height="h" ref="canvas" ></canvas>
        <div @click="refresh" class="slide-verify-refresh-icon"></div>
        <canvas :width="w" :height="h" ref="block"  class="slide-verify-block"></canvas>
        <!-- container -->
        <div class="slide-verify-slider" :class="{'container-active': containerActive, 'container-success': containerSuccess, 'container-fail': containerFail}">
            <div class="slide-verify-slider-mask" :style="{width: sliderMaskWidth}">
                <!-- slider -->
                <div @mousedown="sliderDown"
                    @touchstart="touchStartEvent"
                    @touchmove="touchMoveEvent"
                    @touchend="touchEndEvent"
                    class="slide-verify-slider-mask-item"
                    :style="{left: sliderLeft}">
                    <div class="slide-verify-slider-mask-item-icon"></div>
                </div>
            </div>
            <span class="slide-verify-slider-text">{{sliderText}}</span>
        </div>
    </div>
</template>
<script>
import { requestCreateCode, requestAuthCode} from '@/api/login';
    const PI = Math.PI;
    function sum(x, y) {
        return x + y
    }
    function square(x) {
        return x * x
    }
    export default {
        name: 'SlideVerify',
        props: {
            // block length
            l: {
                type: Number,
                default: 42,
            },
            // block radius
            r: {
                type: Number,
                default: 10,
            },
            // canvas width
            w: {
                type: Number,
                default: 310,
            },
            // canvas height
            h: {
                type: Number,
                default: 155,
            },
            loginForm: {
                type: Object,
            }
        },
        data() {
            return {
                containerActive: false, // container active class
                containerSuccess: false, // container success class
                containerFail: false, // container fail class
                canvasCtx: null,
                blockCtx: null,
                block: null,
                block_x: undefined, // container random position
                block_y: undefined,
                L: this.l + this.r * 2 + 3, // block real lenght
                img: undefined,
                originX: undefined,
                originY: undefined,
                isMouseDown: false,
                trail: [],
                sliderText: '向右滑动完成拼图',
                sliderLeft: 0, // block right offset
                sliderMaskWidth: 0, // mask width
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.initDom();
                this.initImg();
                this.bindEvents();
            },
            initDom() {
                this.block = this.$refs.block;
                this.canvasCtx = this.$refs.canvas.getContext('2d')//大图
                this.blockCtx = this.block.getContext('2d');
            },
            initImg() {
                const img = this.createImg(() => {
                    this.drawBlock(()=>{
                        this.canvasCtx.drawImage(img, 0, 0, this.w, this.h)
                        this.blockCtx.drawImage(img, 0, 0, this.w, this.h)
                        let {block_x: x,block_y: y,r,L} = this
                        let _y = y - r * 2 - 1;
                        let ImageData = this.blockCtx.getImageData(x, _y, L, L);
                        this.block.width = L;
                        this.blockCtx.putImageData(ImageData, 0, _y)
                    })
                });
                this.img = img;
            },
            drawBlock(callback) {
                let _this=this;
                let _params={
                    userNo:this.loginForm.userNo,
                    x:{
                        start:this.L + 10, 
                        end:this.w - (this.L + 10)
                    },
                    y:{
                        start:10 + this.r * 2, 
                        end:this.h - (this.L + 10)
                    }
                }
                requestCreateCode(_params).then(res => {
                    if(res.status == 200) {
                        _this.block_x = Number(window.atob(res.data.x));
                        _this.block_y = Number(window.atob(res.data.y));
                        _this.draw(_this.canvasCtx, _this.block_x, _this.block_y, 'fill')
                        _this.draw(_this.blockCtx, _this.block_x, _this.block_y, 'clip')
                        callback();
                    }
                })
            },
            draw(ctx, x, y, operation) {
                let { l,r} = this;
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
                ctx.lineTo(x + l, y)
                ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
                ctx.lineTo(x + l, y + l)
                ctx.lineTo(x, y + l)
                ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
                ctx.lineTo(x, y)
                ctx.lineWidth = 2
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
                ctx.stroke()
                ctx[operation]()
                ctx.globalCompositeOperation = 'overlay';
            },
            createImg(onload) {
                const img = document.createElement('img');
                img.crossOrigin = "Anonymous";
                img.onload = onload;
                img.onerror = () => {
                    img.src = this.getRandomImg()
                }
                img.src = this.getRandomImg()
                return img;
            },
            getRandomImg() {
                var imgSrc=require('../../../assets/images/verify/' + this.getRandomNumberByRange(1, 10)+'.jpg');
                return imgSrc;
            },
            getRandomNumberByRange(start, end) {
                return Math.round(Math.random() * (end - start) + start)
            },
            getRandomPos(start, end) {
                return Math.round(Math.random() * (end - start) + start)
            },
            refresh() {
                this.reset();
                this.$emit('refresh');
            },
            sliderDown(event) {
                this.originX = event.clientX;
                this.originY = event.clientY;
                this.isMouseDown = true;
            },
            touchStartEvent(e) {
                this.originX = e.changedTouches[0].pageX;
                this.originY = e.changedTouches[0].pageY;
                this.isMouseDown = true;
            },
            bindEvents() {
                document.addEventListener('mousemove', (e) => {
                    if (!this.isMouseDown) return false;
                    const moveX = e.clientX - this.originX;
                    const moveY = e.clientY - this.originY;
                    if (moveX < 0 || moveX + 38 >= this.w) return false;
                    this.sliderLeft = moveX + 'px';
                    let blockLeft = (this.w - 40 - 20) / (this.w - 40) * moveX;
                    this.block.style.left = blockLeft + 'px';

                    this.containerActive = true; // add active
                    this.sliderMaskWidth = moveX + 'px';
                    this.trail.push(moveY);
                });
                document.addEventListener('mouseup', (e) => {
                    if (!this.isMouseDown) return false
                    this.isMouseDown = false
                    if (e.clientX === this.originX) return false;
                    this.containerActive = false; // remove active
                    this.verify((obj)=>{
                        const {spliced,TuringTest,authToken} = obj;
                        if (spliced) {
                            if (TuringTest) {
                                this.containerSuccess = true;
                                this.reset();
                                this.$emit('success',authToken)
                            } else {
                                this.containerFail = true;
                                this.reset()
                            }
                        } else {
                            this.containerFail = true;
                            this.$emit('fail')
                            setTimeout(() => {
                                this.reset()
                            }, 300)
                        }
                    });
                })
            },
            touchMoveEvent(e) {
                if (!this.isMouseDown) return false;
                const moveX = e.changedTouches[0].pageX - this.originX;
                const moveY = e.changedTouches[0].pageY - this.originY;
                if (moveX < 0 || moveX + 38 >= this.w) return false;
                this.sliderLeft = moveX + 'px';
                let blockLeft = (this.w - 40 - 20) / (this.w - 40) * moveX;
                this.block.style.left = blockLeft + 'px';

                this.containerActive = true;
                this.sliderMaskWidth = moveX + 'px';
                this.trail.push(moveY);
            },
            touchEndEvent(e) {
                if (!this.isMouseDown) return false
                this.isMouseDown = false
                if (e.changedTouches[0].pageX === this.originX) return false;
                this.containerActive = false;
                this.verify((obj)=>{
                    const {spliced,TuringTest,authToken} = obj;
                    if (spliced) {
                        if (TuringTest) {
                            this.containerSuccess = true;
                            this.reset();
                            this.$emit('success',authToken)
                        } else {
                            this.containerFail = true;
                            this.reset()
                        }
                    } else {
                        this.containerFail = true;
                        this.$emit('fail')
                        setTimeout(() => {
                            this.reset()
                        }, 300)
                    }
                });
            },
            verify(callback) {
                const arr = this.trail // drag y move distance
                const average = arr.reduce(sum) / arr.length // average
                const deviations = arr.map(x => x - average) // deviation array
                const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length) // standard deviation
                const left = parseInt(this.block.style.left)
                let _params={
                    userNo:this.loginForm.userNo,
                    slideX:left
                }
                requestAuthCode(_params).then(res => {
                    if(res.status == 200) {
                        let authToken=res.data.authToken;
                        callback({
                            spliced: true,
                            TuringTest: average !== stddev, // equal => not person operate
                            authToken:authToken
                        })
                    }else {
                        callback({
                            spliced: false,
                            TuringTest: average !== stddev, // equal => not person operate
                        })

                    }
                })
                
            },
            reset() {
                this.block.style.left = 0;
                this.containerActive = false;
                this.containerSuccess = false;
                this.containerFail = false;
                this.sliderLeft = 0;
                this.sliderMaskWidth = 0;
                // canvas
                let {w, h} = this;
                this.canvasCtx.clearRect(0, 0, w, h)
                this.blockCtx.clearRect(0, 0, w, h)
                this.block.width = w

                //generate img
                this.img.src = this.getRandomImg()
            }
        }
    }
</script>
<style scoped>
    .slide-verify {
        position: relative;
        width: 310px;
        margin:auto
    }

    .slide-verify-block {
        position: absolute;
        left: 0;
        top: 0
    }

    .slide-verify-refresh-icon {
        position: absolute;
        right: 0;
        top: 0;
        width: 34px;
        height: 34px;
        cursor: pointer;
        background: url("../../../assets/images/verify/icon_light.png") 0 -437px;
        background-size: 34px 471px
    }

    .slide-verify-slider {
        position: relative;
        text-align: center;
        width: 310px;
        height: 40px;
        line-height: 40px;
        margin-top: 15px;
        background: #f7f9fa;
        color: #45494c;
        border: 1px solid #e4e7eb
    }

    .slide-verify-slider-mask {
        position: absolute;
        left: 0;
        top: 0;
        height: 40px;
        border: 0 solid #1991FA;
        background: #D1E9FE
    }

    .slide-verify-slider-mask-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        background: #fff;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: background .2s linear
    }

    .slide-verify-slider-mask-item:hover {
        background: #1991FA
    }

    .slide-verify-slider-mask-item:hover .slide-verify-slider-mask-item-icon {
        background-position: 0 -13px
    }

    .slide-verify-slider-mask-item-icon {
        position: absolute;
        top: 15px;
        left: 13px;
        width: 14px;
        height: 12px;
        background: url("../../../assets/images/verify/icon_light.png") 0 -26px;
        background-size: 34px 471px
    }
    .container-active .slide-verify-slider-mask-item {
        height: 38px;
        top: -1px;
        border: 1px solid #1991FA;
    }

    .container-active .slide-verify-slider-mask {
        height: 38px;
        border-width: 1px;
    }

    .container-success .slide-verify-slider-mask-item {
        height: 38px;
        top: -1px;
        border: 1px solid #52CCBA;
        background-color: #52CCBA;
    }

    .container-success .slide-verify-slider-mask {
        height: 38px;
        border: 1px solid #52CCBA;
        background-color: #D2F4EF;
    }

    .container-success .slide-verify-slider-mask-item-icon {
        background-position: 0 0 !important;
    }

    .container-fail .slide-verify-slider-mask-item {
        height: 38px;
        top: -1px;
        border: 1px solid #f57a7a;
        background-color: #f57a7a !important;
    }

    .container-fail .slide-verify-slider-mask {
        height: 38px;
        border: 1px solid #f57a7a;
        background-color: #fce1e1;
    }

    .container-fail .slide-verify-slider-mask-item-icon {
        top: 14px;
        background-position: 0 -82px !important;
    }

    .container-active .slide-verify-slider-text,
    .container-success .slide-verify-slider-text,
    .container-fail .slide-verify-slider-text {
        display: none;
    }
</style>
