<template>
    <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" size="small" class="fusion-select">
        <el-form-item>
            <el-select v-model.trim="searchKey.field" class="el-field">
                <el-option label="车辆" value="1"></el-option>
                <el-option label="路侧点" value="2"></el-option>
            </el-select>
            <el-select
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
                    :value="item.vehicleId">
                </el-option>
            </el-select>
            <el-select
                v-else
                v-model.trim="searchKey.rsPtName"
                filterable
                remote
                value-key="rsPtId"
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="rsPtNameRemoteMethod"
                clearable
                @clear="$searchFilter.clearFunc(rsPtNameOption)"
                @focus="$searchFilter.remoteMethodClick(rsPtNameOption, searchKey, 'rsPtName',searchUrl1)" 
                @blur="$searchFilter.remoteMethodBlur(searchKey, 'rsPtName')" 
                :loading="rsPtNameOption.loading">
                <el-option
                    v-for="item in rsPtNameOption.filterOption"
                    :key="item.rsPtName"
                    :label="item.rsPtName"
                    :value="item">
                </el-option>
            </el-select>
            <el-button  @click="showView()">进入</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
  import { requestVehicle,requestRoadSide } from "@/api/overview/index.js";
    export default {
        data() {
            return {
                searchKey:{
                   field:'1',
                   plateNo:'', 
                   rsPtName:''
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
                            pageSize: 10,
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
                            pageSize: 10,
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
            },
            showView(){
                if(this.searchKey.field==1){//车辆
                    this.$router.push({
                        path: "/single/" + this.searchKey.plateNo,
                        query:{delayTime:4}
                    });
                }else{//路侧点
                    let centPos = [this.searchKey.rsPtName.ptLon,this.searchKey.rsPtName.ptLat];
                    this.$router.push({
                        path: '/perception/'+this.searchKey.rsPtName.rsPtId+ "/"+4+"/"+0.004+"/"+true,
                        query:{lng:centPos[0],lat:centPos[1],isShow:false}
                    });
                }
                
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
    margin:auto;
}
</style>
<style lang="scss">
.fusion-select {
    .el-input__inner{
        background:#676767;
        border: 1px solid #676767;
        color:#fff;
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