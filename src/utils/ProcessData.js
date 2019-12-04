class ProcessCarTrack {
    constructor(){
        this.spatObj={};
        this.spatPulseInterval='';//阈值范围
        this.routePulseInterval='';
        this.spatMaxValue = '';
        this.routeMaxValue = '';
        this.routeList=[];
    }

    receiveLightData(data){
        data.forEach(item=>{
            if(!this.spatObj[item.spatId]){
                this.spatObj[item.spatId] = new Array();
            }else{
                this.spatObj[item.spatId].push(item);
            }
        });
    }
    receiveRouteData(data){
        let track = data.track;
        let route = data.route;
        track.forEach(item =>{
            item.routeId = route.routeId;
        })
        this.routeList.push.apply(this.routeList,track);
    }

    processSpatData(time,delayTime){
        console.log("--------------")
        let data = [];
        for(let spatId in this.spatObj){
            if(this.spatObj[spatId].length>0){
                let spatData = this.getSpatMinValue(spatId,time,delayTime);
                if(!spatData){
                    return;
                }
                data.push(spatData);
            }
        }
        return data;
    }
    getSpatMinValue(spatId,time,delayTime){
        let cacheData = this.spatObj[spatId];
        let rangeData=null;
        let startIndex=-1;
        console.log("spatId:"+spatId+",找到最小值前："+cacheData.length);
        //找到满足条件的范围
        for(let i=0;i<cacheData.length;i++){
            let diff = Math.abs(time-cacheData[i].spatTime-delayTime);
            console.log("-----"+cacheData[i])
            console.log(spatId,cacheData.length,time,parseInt(cacheData[i].spatTime),delayTime,diff,i)
            if(diff<this.spatPulseInterval){
                if(startIndex !=-1 && i != startIndex+1) {
                    break;
                }
                if(!rangeData || (rangeData && diff < rangeData.delayTime)) {
                    startIndex=i;
                    let obj={
                        index:i,
                        delayTime: diff,
                        data:cacheData[i],
                        diff:diff
                    }
                    rangeData = obj;
                }else {
                    break;
                }
            }else {
                if(rangeData) {
                    break;
                }
            }
        }
        let minIndex=-1;
        let minData = {};
        let minDiff;
        //如果能找到最小范围
        console.log(rangeData)
        if(rangeData){
            minIndex = rangeData.index;
            minData = rangeData.data;
        }else{
            console.log("spat***********************");
            minIndex = 0;
            minData = cacheData[0];
            minDiff = Math.abs(time-minData.spatTime-delayTime);
            for(let i=0;i<cacheData.length;i++){
                let diff = Math.abs(time-parseInt(cacheData[i].spatTime)-delayTime);
                // let diff = time-cacheData[i].gpsTime-insertTime;
                // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
                if(diff<minDiff){
                    minData = cacheData[i];
                    minIndex = i;
                    minDiff = diff;
                }

            }
        }
        console.log("最小索引:"+minIndex);
        //找出的最小值无效
        if(minDiff&&minDiff>this.spatMaxValue){
            console.log("spat找到的最小值无效")
            return;
        }
        //打印出被舍弃的点
        let lostData = this.spatObj[spatId].filter((item,index)=>{
            return index<minIndex;
        })
        /*if(lostData.length>0){
            
        }*/
        lostData.forEach(item=>{
            let minDiff = Math.abs(time-cacheData[minIndex].spatTime);
            // console.log("插值最小的索引"+minIndex,minDiff);
            let d =  Math.abs(time-item.spatTime);
            // console.log("##"+d);
        })


        //找到最小值后，将数据之前的数值清除
        this.spatObj[spatId] = this.spatObj[spatId].filter((item,index)=>{
            return index>minIndex;
        })
        console.log("找到最小值后"+this.spatObj[spatId].length);

        //返回距离标尺的最小插值的数据
        return minData;
    }
    processRouteData(time,delayTime){
        let routeData;
        if(this.routeList.length>0){
            routeData = this.getRouteMinValue(time,delayTime);
            if(!routeData){
                return;
            }
        }else {
            console.log("行程没有数据")
        }
        return routeData;
    }
    getRouteMinValue(time,delayTime){
        let rangeData=null;
        let startIndex=-1;
        console.log("找到最小值前："+this.routeList.length);
        //找到满足条件的范围
        for(let i=0;i<this.routeList.length;i++){
            let diff = Math.abs(time-this.routeList[i].gpsTime-delayTime);
            // console.log(spatId,cacheData.length,time,parseInt(cacheData[i].spatTime),delayTime,diff,i)
            if(diff<this.routePulseInterval){
                if(startIndex !=-1 && i != startIndex+1) {
                    break;
                }
                if(!rangeData || (rangeData && diff < rangeData.delayTime)) {
                    startIndex=i;
                    let obj={
                        index:i,
                        delayTime: diff,
                        data:this.routeList[i],
                        diff:diff
                    }
                    rangeData = obj;
                }else {
                    break;
                }
            }else {
                if(rangeData) {
                    break;
                }
            }
        }
        let minIndex=-1;
        let minData = {};
        let minDiff;
        //如果能找到最小范围
        console.log(rangeData)
        if(rangeData){
            minIndex = rangeData.index;
            minData = rangeData.data;
        }else{
            console.log("spat***********************");
            minIndex = 0;
            minData = this.routeList[0];
            minDiff = Math.abs(time-minData.gpsTime-delayTime);
            for(let i=0;i<this.routeList.length;i++){
                let diff = Math.abs(time-parseInt(this.routeList[i].gpsTime)-delayTime);
                // let diff = time-cacheData[i].gpsTime-insertTime;
                // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
                if(diff<minDiff){
                    minData = this.routeList[i];
                    minIndex = i;
                    minDiff = diff;
                }

            }
        }
        console.log("最小索引:"+minIndex);
        //找出的最小值无效
        if(minDiff&&minDiff>this.routeMaxValue){
            console.log("route找到的最小值无效")
            return;
        }
        //打印出被舍弃的点
        let lostData = this.routeList.filter((item,index)=>{
            return index<minIndex;
        })
        /*if(lostData.length>0){
            
        }*/
        lostData.forEach(item=>{
            let minDiff = Math.abs(time-this.routeList[minIndex].gpsTime);
            // console.log("插值最小的索引"+minIndex,minDiff);
            let d =  Math.abs(time-item.gpsTime);
            // console.log("##"+d);
        })


        //找到最小值后，将数据之前的数值清除
        this.routeList = this.routeList.filter((item,index)=>{
            return index>minIndex;
        })
        console.log("找到最小值后"+this.routeList.length);

        //返回距离标尺的最小插值的数据
        return minData;
    }
}
export default ProcessCarTrack;