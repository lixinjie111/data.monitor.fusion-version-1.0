/**
 * 实时接口发送
 */
class GetExtend {
    constructor(){
    	
    }
    static getExtend(x,y,r){
       let currentExtent=[];
       let x0=x+r;
       let y0=y+r;
       let x1=x-r;
       let y1=y-r;
       currentExtent.push([x1, y0]);
       currentExtent.push([x0, y0]);
       currentExtent.push([x0, y1]);
       currentExtent.push([x1, y1]);
       return currentExtent;
    }
}
export default GetExtend;