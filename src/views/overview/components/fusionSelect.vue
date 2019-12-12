<template>
    <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" size="small" class="fusion-select">
        <el-form-item>
            <el-select v-model.trim="searchKey.field">
                <el-option label="车辆" value="1"></el-option>
                <el-option label="路侧点" value="2"></el-option>
            </el-select>
            <!-- <el-select
                v-if="searchKey.field==1"
                v-model.trim="searchKey.plateNo"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="plateNoRemoteMethod"
                clearable
                @clear="$searchFilter.clearFunc(plateNoOption)"
                @focus="$searchFilter.remoteMethodClick(plateNoOption, searchKey, 'plateNo',searchUrl)"
                @blur="$searchFilter.remoteMethodBlur(searchKey, 'plateNo')"
                :loading="plateNoOption.loading">
                <el-option
                    v-for="item in plateNoOption.filterOption"
                    :key="item.plateNo"
                    :label="item.plateNo"
                    :value="item.plateNo">
                </el-option>
            </el-select> -->
            <el-select
                v-if="searchKey.field==2"
                v-model.trim="searchKey.rsPtName"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="rsPtNameRemoteMethod"
                clearable
                @clear="$searchFilter.clearFunc(rsPtNameOption)"
                @focus="$searchFilter.remoteMethodClick(rsPtNameOption, searchKey, 'rsPtName',searchUrl)" 
                @blur="$searchFilter.remoteMethodBlur(searchKey, 'rsPtName')" 
                :loading="rsPtNameOption.loading">
                <el-option
                    v-for="item in rsPtNameOption.filterOption"
                    :key="item.rsPtName"
                    :label="item.rsPtName"
                    :value="item.rsPtName">
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
</template>
<script>
  import { requestVehicle,requestRoadSide } from "@/api/overview/index.js";
    export default {
        data() {
            return {
                searchKey:{
                   field:1,
                   plateNo:'' 
                },
                searchUrl: requestVehicle,
                searchUrl1: requestRoadSide,
                plateNoOption: {
                    loading: false,
                    filterOption: [],
                    defaultOption: [],
                    defaultFlag: false,
                    otherParams:{
                        page:{
                            pageSize: 200,
                            pageIndex: 0,
                        }
                    }
                },
                 rsPtNameOption: {
                    loading: false,
                    filterOption: [],
                    defaultOption: [],
                    defaultFlag: false,
                    otherParams:{
                        page:{
                            pageSize: 200,
                            pageIndex: 0,
                        }
                    }
                },
            }
        },
        methods: {
            initChange(){
                if(this.searchKey.field==1){
                     this.plateNoRemoteMethod();
                }else{
                     this.rsPtNameRemoteMethod();
                }
            },
            plateNoRemoteMethod(query){
                this.$searchFilter.publicRemoteMethod({
                    query: query,
                    searchOption: this.plateNoOption,
                    searchObj: this.searchKey,
                    key: 'plateNo',
                    request: this.searchUrl
                });
            },
            rsPtNameRemoteMethod(query){
                 this.$searchFilter.publicRemoteMethod({
                    query: query,
                    searchOption: this.plateNoOption,
                    searchObj: this.searchKey,
                    key: 'rsPtName',
                    request: this.searchUrl1
                });
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
    margin:auto
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