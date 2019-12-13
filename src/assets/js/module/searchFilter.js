/**
 * 模糊搜索方法封装
 */
class SearchFilter {
    constructor(){
        this.queryName = '';
    }
    static publicRemoteMethod(option) {
           this.queryName = option.query;
           this.requestRoadSideTypeahead(option);
    }
    static remoteMethodClick(searchOption,searchObj,key,searchUrl) {
            this.queryName = searchObj[key];
            this.requestRoadSideTypeahead({
                searchOption: searchOption,
                request: searchUrl
            });
    }
    static requestRoadSideTypeahead(option) { 
        option.request(option.searchOption.otherParams).then(res => {
            if(res.status == 200){ 
                option.searchOption.totalCount=res.data.totalCount;    
                if(option.searchOption.loadMore){
                    option.searchOption.filterOption.push(...res.data.list)
                }else{
                    option.searchOption.filterOption = res.data.list;
                }  
            }   
        }).catch(err => {

        });
    }
    static clearFunc(searchOption) {
        searchOption.filterOption = [];
    }
    static remoteMethodBlur(searchObj, key) {
        searchObj[key] = this.queryName;
    }
}
export default SearchFilter;