/**
 * 模糊搜索方法封装
 */
class SearchFilter {
    constructor(){
        this.queryName = '';
    }
    static publicRemoteMethod(option) {
        //if (option.query !== '') {
            this.queryName = option.query;
            option.searchOption.loading = true;
                this.requestRoadSideTypeahead(option);
        // } else {
        //     option.searchOption.filterOption = [];
        // }
    }
    static remoteMethodClick(searchOption, searchObj, key, searchUrl) {
        this.queryName = searchObj[key];
            searchOption.loading = true;
            this.requestRoadSideTypeahead({
                query: '',
                searchOption: searchOption,
                searchObj: searchObj,
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
            option.searchOption.loading = false; 
        }).catch(err => {
            option.searchOption.loading = false;
        });
    }
    static clearFunc(searchOption) {
        searchOption.filterOption = [];
    }
    static remoteMethodBlur(searchObj, key) {
        searchObj[key] = this.queryName;
        this.queryName = "";
    }
}
export default SearchFilter;