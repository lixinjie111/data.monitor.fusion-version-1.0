<template>
<div id="login-warpper">
    <!-- 登录 -->
    <div class="login-card">
        <div class="login-header">
            <img class="login-logo" src="@/assets/images/logo.png">        
            <div class="login-title">启迪智能网联汽车感知融合平台</div>
        </div>
        <div class="login-item-box">
            <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="right" label-width="76px" class="login-form">
                <el-form-item prop="adminName" label="用户名：" class="login-item">
                    <el-input type="text" v-model.trim="loginForm.adminName" :maxlength="40" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码：" class="login-item">
                    <el-input type="password" v-model.trim="loginForm.password" :maxlength="20" placeholder="请输入密码"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <el-button class="login-button" type="primary" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>
    </div>
</div>
</template>

<script>
import { mapActions } from 'vuex';
var routers = [];
export default {
    name: 'Login',
    data() {
        var checkAdminName = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请填写用户名'));
            }else {
                callback();
            }
        };
        var checkPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
            }else {
                callback();
            }
        };
        return {
            loginForm: {
                adminName: '',
                password: ''
            },
            loginRules: {
                adminName: [
					{ validator: checkAdminName, trigger: 'blur' }
                ],
                password: [
                    { validator: checkPassword, trigger: 'blur' }
                ]
            },
            loading: false
        }
    },
    methods: {
        ...mapActions(['goLogin']),
        handleLogin() {
            let that = this;
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                    that.loading = true;
                    that.goLogin(that.loginForm).then(res => {

                        // var res = {
                        //     status: 200,
                        //     data: {
                        //         adminId: "shilu",
                        //         adminName: 123456
                        //     }
                        // };

                        that.$message.success(res.msg);
                        that.$router.push({ path: '/' });
                        that.loading = false;
                    }).catch(err => {
                        that.loading = false;
                    })
                } else {
                    // that.$message.error('error submit!!');
                    return false;
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
#login-warpper {
    height: 100%;
    background-color: #000;
    .login-card {
        position: absolute;
        top: 25%;
        left: 50%;
        width: 560px;
        transform: translate(-50%, 0);
        padding: 10px 0;
    }
    .login-header{
        padding: 10px 30px;
        border-bottom: 1px dashed #545350; 
        .login-logo {
            height: 30px;
        }
        .login-title {
            font-size: 30px;
            height: 46px;
            line-height: 46px;
            letter-spacing: 5px;
            font-family: 'MicrosoftYaHei';
            font-weight: 100;  
            color: #f4f7f8;  
        }
    }
    .login-item-box {
        padding: 10px 0;
        border-bottom: 1px dashed #545350;
        .login-form {
            width: 280px;
            margin: 0 auto;
        }
        .login-item {
            padding: 10px 0;
            margin: 0; 
        }
    }
    .login-button {
        display: block;
        width: 286px;
        margin: 20px auto 0;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143; 
        color: #fff;
        background-color: #00c1de;
        border-color: #00c1de;
        border-radius: 3px;
        border: 1px solid transparent;
        border-radius: 4px;
        &:hover{
            background: #33CDE5;
        }
    }
}
</style>
<style lang="scss">
.login-item-box {
    .el-form-item__label {
        color: #f4f7f8;
    }
    .el-input__inner {
        background: transparent;        
        border: 1px solid #eee;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color:#fff;        
        background-image: none;
        border: 1px solid #585757;        
        border-radius: 4px;
        height: auto;
        overflow: hidden;
        vertical-align: middle;
        box-sizing: border-box;
    }
}
</style>