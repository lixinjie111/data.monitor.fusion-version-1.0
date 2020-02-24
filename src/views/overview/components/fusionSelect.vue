<template>
    <el-form ref="searchForm" :inline="true" :model="searchKey" :rules="rules" size="small" class="fusion-select">
        <el-form-item>
            <el-select 
                v-model.trim="searchKey.field" 
                @change="initChange()"
                popper-class="fusion-select-popper">
                <el-option label="车辆" value="1"></el-option>
                <el-option label="路侧点" value="2"></el-option>
            </el-select>
            <el-select
                popper-class="fusion-select-popper"
                class="select-content"
                v-model.trim="searchKey.value"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="remoteSearch"
                clearable
                :value-key="searchKey.field == 1 ?'':'rsPtId'"
                v-loadmore="loadMore"
                @clear="clearFunc()"
                @focus="remoteMethodClick()"
                @blur="$searchFilter.remoteMethodBlur(searchKey, 'value',)">
                <el-option
                    v-for="item in searchOption.filterOption"
                    :key="searchKey.field == 1 ? item.plateNo : item.rsPtName"
                    :label="searchKey.field == 1 ? item.plateNo : item.rsPtName"
                    :value="searchKey.field == 1 ? item.vehicleId : item">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button  @click="showView()" :loading="enterloading">进入</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    import { requestVehicle,requestRoadSide } from "@/api/overview/index.js";
    import {getCameraByRsId} from '@/api/fusion'
    export default {
        directives:{
            loadmore:{
                bind (el, binding) {
                    const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
                    SELECTWRAP_DOM.addEventListener('scroll', function () {
                        const CONDITION = this.scrollHeight - this.scrollTop < this.clientHeight+20;
                        if (CONDITION) {
                            binding.value(SELECTWRAP_DOM)
                        }
                    })
                }
            }
        },
        data() {
            return {
                enterloading: false,
                scrollDom:'',
                query:'',
                searchKey:{
                   field:'1',
                   value: null
                },
                params: {},
                searchUrl: requestVehicle,
                searchOption: {
                    loading: false,
                    filterOption: [],
                    totalCount:'',
                    loadMore:false,
                    clickFlag:false,
                    otherParams:{
                        page:{
                            pageSize: 10,
                            pageIndex: 0,
                        }
                    }
                },
            }
        },
        created() {
           this.remoteMethod(); 
        },
        methods: {
            loadMore(dom){
                this.scrollDom=dom;
                if(this.searchOption.totalCount==this.searchOption.filterOption.length){
                    return;
                }
                this.searchOption.loadMore=true;
                this.searchOption.otherParams.page.pageIndex++;
                this.remoteMethod(this.query);
              
            },
            initChange(){//切换
                this.searchKey.value='';
                this.searchOption.filterOption=[];
                this.searchOption.clickFlag = false;
                this.searchOption.loadMore=false;
                this.searchOption.otherParams={
                    page:{
                        pageSize: 10,
                        pageIndex: 0,
                    }
                }
                if(this.searchKey.field==1){//车辆
                    this.searchUrl=requestVehicle;
                }else{
                    this.searchUrl=requestRoadSide;
                }
                this.remoteMethod();
            },
            clearFunc(){//清除
                this.query="";
                this.searchKey.value='';
                this.searchOption.filterOption = [];
                this.searchOption.clickFlag = true;
                this.searchOption.otherParams.page.pageIndex=0;
            },
            remoteMethodClick(){//清除点击时
                if(this.searchOption.clickFlag){
                    this.searchOption.loadMore=false;
                    let _key = this.searchKey.field == 1 ? 'plateNo' : 'rsPtName';
                    if(this.searchKey.value==""||this.searchKey.value==null){
                        this.searchOption.otherParams[_key] = '';
                        this.$searchFilter.remoteMethodClick(this.searchOption,this.searchKey,"value",this.searchUrl)
                    }
                }
            },
            remoteSearch(query){//输入时
                if(this.scrollDom!=""){
                    this.scrollDom.scrollTop=0;
                }
                this.searchOption.loadMore=false;
                this.searchOption.otherParams.page.pageIndex=0;
                this.remoteMethod(query);
            },
            remoteMethod(query){
                this.query = query;
                let _key = this.searchKey.field == 1 ? 'plateNo' : 'rsPtName';
                this.searchOption.otherParams[_key] = query?query:'';
                this.$searchFilter.publicRemoteMethod({
                    query:query?query:'',
                    searchOption: this.searchOption,
                    request: this.searchUrl
                });
            },
            showView(){
                if(this.searchKey.field==1){//车辆
                    if(this.searchKey.plateNo!=""){
                        this.$router.push({
                            path: "/single/" + this.searchKey.value,
                            query:{delayTime: window.delayTime, isShowMapElement:window.isShowMapElement}
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
                        // console.log(this.searchKey);
                        // let centPos = [this.searchKey.value.ptLon,this.searchKey.value.ptLat];
                        // this.$router.push({
                        //     path: '/perception/'+this.searchKey.value.rsPtId+ "/"+4+"/"+0.004+"/"+true,
                        //     query:{lng:centPos[0],lat:centPos[1],isShow:false, isShowMapElement:window.isShowMapElement}
                        // });
                        this.getCameraByRsId(this.searchKey.value);
                    }else{
                        this.$message({
                            type: 'error',
                            duration: '1500',
                            message: '请选择数据!',
                            showClose: true
                        });
                    }
                }
            },
            getCameraByRsId(item){
                this.enterloading = true;
                getCameraByRsId({"rsId":item.rsPtId}).then(res => {
                    if(res.status == 200) {
                        let data = res.data;
                        if(data.camLst && data.camLst.length>0 && data.camLst[0].camParam){
                            sessionStorage.setItem("sTypeRoadCamLst",JSON.stringify(data));
                            this.$router.push({
                                path: '/perception/'+item.rsPtId+ "/"+window.delayTime+ "/"+window.miniExtend+"/"+true,
                                query:{lng:item.ptLon,lat:item.ptLat,isShow:false,isShowMapElement:window.isShowMapElement}
                            });
                        }else {
                            this.$message({
                                type: 'warning',
                                duration: '1500',
                                message: '请设置典型摄像头及其相关参数',
                                showClose: true
                            });
                            sessionStorage.removeItem("sTypeRoadCamLst");
                        }
                    }else {
                        sessionStorage.removeItem("sTypeRoadCamLst");
                    }
                    this.enterloading = false;
                }).catch(err => {
                    sessionStorage.removeItem("sTypeRoadCamLst");
                    this.enterloading = false;
                });
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
.el-form-item {
    margin-bottom: 0;
}
</style>
<style lang="scss">
.fusion-select {
    .el-input__inner,.el-button{
        background:#676767 !important;
        border-color: #676767 !important;
        color: #fff !important;
        border-radius:0 !important;
        height: 33px !important;
        vertical-align: top;
    }
    .el-select .el-input{
        width: 85px !important;
        background: #7f7f7f !important;
        .el-input__inner{
             background: #7f7f7f !important;
        }
    }
    .select-content .el-input {
        margin-left: -12px !important;
        width: 230px !important;
        background: #676767;
        .el-input__inner{
             background: #676767 !important;
        }
    }
}
.fusion-select-popper {
    border: 1px solid #676767 !important;
    .el-select-dropdown__item.selected {
        color: #f59307!important;
    }
    &.el-popper[x-placement^=bottom] .popper__arrow::after {
        border-bottom-color: #676767 !important;
    }
    &.el-popper[x-placement^=bottom] .popper__arrow {
        border-bottom-color: #676767 !important;
    }
    .el-select-dropdown__wrap{
        background:#676767 !important;
         color:#fff!important;
    }
    .el-select-dropdown__item{
        color:#fff !important;
        border-bottom: 1px solid #6f6f6f !important;
    }
    .el-select-dropdown__item.hover, .el-select-dropdown__item:hover{
        background:#7f7f7f !important;
    }
    .el-select-dropdown__empty{
         background: #676767 !important;
         color: #fff !important;
    }
}
</style>