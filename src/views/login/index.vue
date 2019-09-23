<template>
    <div id="login-warpper" v-if="visibleFlag">
        <img class="login-logo" src="static/images/login-logo.png">
        <div class="login-container">
            <img class="login-bg" src="static/images/login-bg.jpg">
            <div class="login-content">
                <div class="login-left">
                    <p class="login-left-title">云控，启迪未来</p>
                </div>
                <div class="login-card">
                    <div class="login-title">融合感知中心</div>
                    <div class="login-item-box">
                        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="right" label-width="105px" class="login-form">
                            <el-form-item prop="userNo" label="用户名" class="login-item">
                                <el-input type="text" v-model.trim="loginForm.userNo" :maxlength="40" placeholder="请输入用户名"></el-input>
                            </el-form-item>
                            <el-form-item prop="password" label="密码" class="login-item">
                                <el-input type="password" v-model.trim="loginForm.password" :maxlength="20" placeholder="请输入密码"  @keyup.enter.native="handleLogin"></el-input>
                            </el-form-item>
                        </el-form>
                        <el-button class="login-button" type="primary" :loading="loading" @click.native.prevent="handleLogin" >登 录</el-button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 登录 -->

        <div class="login-bottom">
            <span>建议浏览器：Chrome</span>
            <span>建议分辨率：1920x1080</span>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import { removeAuthInfo } from '@/session/index';
    export default {
        name: 'Login',
        data() {
            let checkAdminName = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('请填写用户名'));
                }else {
                    callback();
                }
            };
            let checkPassword = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                }else {
                    callback();
                }
            };
            return {
                visibleFlag: false,
                loginForm: {
                    userNo: '',
                    password: '',
                    platform: this.$store.state.admin.platform
                },
                loginRules: {
                    userNo: [
                        { validator: checkAdminName, trigger: 'blur' }
                    ],
                    password: [
                        { validator: checkPassword, trigger: 'blur' }
                    ]
                },
                loading: false
            }
        },
        created() {
            let _data = localStorage.getItem("yk-token");
            if(_data) {
                let _dataObj = JSON.parse(_data),
                    _delayTime = 1000 * 60 * 60 * 24;
                if (new Date().getTime() - _dataObj.time > _delayTime) {
                    console.log('信息已过期');
                    this.removeStorage();
                }else{
                    // 直接调用登录接口
                    let _params = {
                        token: _dataObj.data,
                        platform: this.$store.state.admin.platform
                    };
                    this.loginFunc(_params);
                }
            }else {
                this.removeStorage();
            }
        },
        methods: {
            ...mapActions(['goLogin']),
            handleLogin() {
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        this.loading = true;
                        this.loginFunc(this.loginForm);
                    } else {
                        this.loading = false;
                        return false;
                    }
                });
            },
            loginFunc(params) {
                this.goLogin(params).then(res => {
                    this.loading = false;
                    if(res.status == 200) {
                        this.$router.push({ path: '/overview' });
                        localStorage.setItem("yk-token",JSON.stringify({data:JSON.parse(res.data).token,"time":new Date().getTime()}));
                    }else {
                        this.removeStorage();
                    }
                }).catch(err => {
                    this.loading = false;
                    this.removeStorage();
                })
            },
            removeStorage() {
                removeAuthInfo();
                localStorage.removeItem("yk-token");
                this.visibleFlag = true;
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/assets/scss/theme.scss";
    #login-warpper {
        font-family: MicrosoftYaHei;
        position: relative;
        z-index: 999;
        height: 100%;
        background-color: #f2f2f2;
        letter-spacing: 2px;
        line-height: 40px;
        .login-logo {
            position: absolute;
            left: 49px;
            top: 36px;
        }
        .login-container {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            margin-top: -250px;
            height: 500px;
            .login-bg {
                width: 100%;
                height: 100%;
            }
        }
        .login-bottom {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
            span {
                padding: 0 20px;
            }
        }
        .login-content {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            @include layoutMode(between);
            .login-left {
                @include layoutMode();
                width: 65.5%;
                height: 100%;
                .login-left-title {
                    color: #fff;
                    font-size: 57px;
                    letter-spacing: 6px;
                    line-height: 90px;
                    border-bottom: 4px solid #dcdcdc;
                }
            }
            .login-card {
                position: absolute;
                top: 50%;
                right: 11.67%;
                transform: translate(0, -50%);
                background-color: rgba(255, 255, 255, .5);
                width: 440px;
                line-height: 50px;
            }
        }
        .login-title {
            font-size: 30px;
            height: 80px;
            letter-spacing: 3px;
            background-color: #f2f2f2;
            color: #000;
            @include layoutMode();
        }
        .login-item-box {
            padding: 40px 40px 57px;
            .login-item {
                background-color: #fff;
            }
        }
        .login-button {
            width: 100%;
            height: 50px;
            box-sizing: border-box;
            background-color: #3293bd;
            border-radius: 10px;
            font-size: 18px;
            color: #fff;
            border: none;
            margin-top: 30px;
        }
    }
</style>
<style lang="scss">
    @import "@/assets/scss/theme.scss";
    .login-item-box {
        .el-form-item {
            margin-right: 0 !important;
        }
        .el-form-item__label {
            position: relative;
            color: #999;
            height: 50px;
            padding: 0;
            @include layoutMode();
            &:after {
                content: "";
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 1px;
                background-color: #bfbfbf;
            }
        }
        .el-input__inner {
            font-size: 14px;
            background: transparent;
            border: none !important;
            height: 50px;
            padding: 0 21px;
            @include layoutMode(pack);
            color: #333 !important;
            width: 100% !important;
        }
        input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0px 1000px white inset;
            -webkit-text-fill-color: #333;
        }
        .el-button{
            i, span{
                line-height: 0;
                vertical-align: middle;
            }
        }
    }
</style>