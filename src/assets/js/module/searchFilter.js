/**
 * 模糊搜索方法封装
 */
class SearchFilter {
    constructor(){
        this.queryName = '';
    }
    static publicRemoteMethod(option) {
        if (option.query !== '') {
            this.queryName = option.query;
            option.searchOption.loading = true;
                this.requestRoadSideTypeahead(option);
        } else {
            option.searchOption.filterOption = [];
        }
    }
    static remoteMethodClick(searchOption, searchObj, key, searchUrl) {
        searchOption.filterOption = [];
        this.queryName = searchObj[key];
            searchOption.loading = true;
            this.requestRoadSideTypeahead({
                query: '',
                searchOption: searchOption,
                searchObj: searchObj,
                key: key,
                request: searchUrl
            });
    }
    static requestRoadSideTypeahead(option) {
        let _params = Object.assign({}, 
            {
                [option.key]: option.query
            }, 
             option.searchOption.otherParams ? option.searchOption.otherParams : {});
        option.request(_params).then(res => {
            if(res.status == 200){         
                option.searchOption.filterOption = res.data.list;
                console.log(option)
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