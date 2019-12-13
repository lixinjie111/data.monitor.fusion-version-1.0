<template>
    <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" size="small" class="fusion-select">
        <el-form-item>
            <el-select v-model.trim="searchKey.field" @change="initChange()">
                <el-option label="车辆" value="1"></el-option>
                <el-option label="路侧点" value="2"></el-option>
            </el-select>
            <el-select
                class="select-content"
                v-model.trim="searchKey.value"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="remoteMethod"
                clearable
                v-loadmore="loadMore"
                @clear="$searchFilter.clearFunc(searchOption)"
                @focus="$searchFilter.remoteMethodClick(searchOption, searchKey, 'value',searchUrl)"
                @blur="$searchFilter.remoteMethodBlur(searchKey, 'value')"
                :loading="searchOption.loading">
                <el-option
                    v-for="item in searchOption.filterOption"
                    :key="searchKey.field == 1 ? item.plateNo : item.rsPtName"
                    :label="searchKey.field == 1 ? item.plateNo : item.rsPtName"
                    :value="searchKey.field == 1 ? item.vehicleId : item">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button  @click="showView()" class="enter">进入</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
  import { requestVehicle,requestRoadSide } from "@/api/overview/index.js";
    export default {
        data() {
            return {
                query:'',
                searchKey:{
                   field:'1',
                   value: null
                },
                params: {},
                searchUrl: null,
                searchOption: {
                    loading: false,
                    filterOption: [],
                    totalCount:'',
                    loadMore:false,
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
            loadMore(){
                var div = document.createElement('div');
                div.innerHTML = '加载中';
                div.setAttribute("class","el-select-dropdown__empty");

                if(this.searchOption.totalCount==this.searchOption.filterOption.length){
                    div.innerHTML = '已加载全部';
                    return;
                }
                this.searchOption.loadMore=true;
                this.searchOption.otherParams.page.pageIndex++;
                this.remoteMethod(this.query);
            },
            initChange(){
                this.searchKey.value='';
                this.searchOption.filterOption=[];
                this.searchOption.otherParams={
                    page:{
                        pageSize: 10,
                        pageIndex: 0,
                    }
                }
                this.remoteMethod();
            },
            remoteMethod(query){//输入时
                this.query = query;
                let _key = this.searchKey.field == 1 ? 'plateNo' : 'rsPtName';
                this.searchOption.otherParams[_key] = this.searchKey.value;
                this.$searchFilter.publicRemoteMethod({
                    query: query?query:'',
                    searchOption: this.searchOption,
                    searchObj: this.searchKey,
                    request: this.searchUrl
                });
            },
            showView(){
                if(this.searchKey.field==1){//车辆
                    if(this.searchKey.plateNo!=""){
                        this.$router.push({
                            path: "/single/" + this.searchKey.plateNo,
                            query:{delayTime:4}
                        });
                    }else{
                        this.$message({
                            type: 'error',
                            duration: '1500',
                            message: '请选择数据!',
                            showClose: true
                        });
                    }
                }else{//路侧点
                    if(this.searchKey.rsPtName!=""){
                        let centPos = [this.searchKey.rsPtName.ptLon,this.searchKey.rsPtName.ptLat];
                        this.$router.push({
                            path: '/perception/'+this.searchKey.rsPtName.rsPtId+ "/"+4+"/"+0.004+"/"+true,
                            query:{lng:centPos[0],lat:centPos[1],isShow:false}
                        });
                    }else{
                        this.$message({
                            type: 'error',
                            duration: '1500',
                            message: '请选择数据!',
                            showClose: true
                        });
                    }
                }
                
            }
        }
    }
</script>
<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";
.fusion-select {
    position: absolute;
    width: auto;
    top: 100px;
    left: 0;
    right: 0;
   @include layoutMode(pack)
}
</style>
<style lang="scss">
.fusion-select {
    .el-input__inner,.el-button{
        background:#676767;
        border: none;
        color:#fff;
        border-radius:0 !important;
    }
    .el-select .el-input{
        width: 85px;
        background:#7f7f7f;
        .el-input__inner{
             background:#7f7f7f;
        }
    }
    .select-content .el-input {
        margin-left:-12px;
        width: 230px;
        background:#676767;
        .el-input__inner{
             background:#676767;
        }
    }
}
.el-select-dropdown__item.selected {
    color: #f59307;
}
.el-select-dropdown{
    border: 1px solid #676767;
}
.el-select-dropdown__wrap{
    background:#676767;
     color:#fff;
}
.el-select-dropdown__item{
    color:#fff;
    border-bottom: 1px solid #6f6f6f;
}
.el-select-dropdown__item.hover, .el-select-dropdown__item:hover{
    background:#7f7f7f;
}
.el-popper[x-placement^=bottom] .popper__arrow::after {
    border-bottom-color: #676767;
}
.el-popper[x-placement^=bottom] .popper__arrow {
    border-bottom-color: #676767;
}
.el-select-dropdown__empty{
     background:#676767;
     color:#fff;
}
</style>