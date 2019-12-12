<template>
    <el-autocomplete 
        placeholder="请输入内容" 
        v-model="input3" 
        popper-class="my-autocomplete"
        :fetch-suggestions="querySearch"
        @select="handleSelect"
        class="fusion-select">
        <!-- <el-select v-model="select" slot="prepend" placeholder="请选择">
            <el-option label="车辆" value="1"></el-option>
            <el-option label="路侧点" value="2"></el-option>
        </el-select>
        <el-button slot="append">进入</el-button> -->
        <template slot-scope="{ item }">
            <div class="name">{{ item.value }}</div>
            <span class="addr">{{ item.address }}</span>
        </template>
    <el-autocomplete>
</template>
<script>
    export default {
        data() {
            return {
                
            }
        }
    }
</script>
<style lang="scss" scoped>
.fusion-select {
    position: absolute;
    width:500px;
    top: 100px;
    left: 0;
    right: 0;
}
</style>
<style lang="scss">
.fusion-select {
    .el-input__inner{
        background:#676767;
        border: 1px solid #676767;
    }
    .el-select .el-input {
        width: 130px;
    }
    .fusion-select{
        .el-input-group__prepend, .el-input-group__append {
            background-color: #7f7f7f;
            color:#fff;
            border: 1px solid #7f7f7f;
        }
    } 
}
</style>