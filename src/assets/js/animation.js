class Animation{
    constructor(){
        this.movement=0;
    }
    static positionMessage(id){
        if(!document.getElementById) return false;
        if(!document.getElementById(id)) return false;
        var elem = document.getElementById(id);
        elem.style.position = "absolute";
        elem.style.left = "50px";
        elem.style.top ="100px";
        this.moveElement(id,200,100,10);
    }

    static moveElement(elementID,final_x,final_y,interval){
        if(!document.getElementById) return false;
        if(!document.getElementById(elementID)) return false;
        var elem = document.getElementById(elementID);
        var xpos = parseInt(elem.style.left); //parseInt(string)把字符串里面的数值信息提取出来，因为后面要进行很多算术比较操作。
        var ypos = parseInt(elem.style.top);  //parseFloat(string)可以把带小数的数值（也就是浮点数）提取出来。
        if(xpos == final_x && ypos == final_y){
            clearTimeout(this.movement);
            return true;
        }
        if(xpos < final_x){ xpos++;}       //如果xpos小于终点的left,给它加1.
        if(xpos > final_x){ xpos--;}       //如果xpos大于终点的left,给它减1.
        if(ypos < final_y){ ypos++;}       //如果ypos小于终点的left,给它加1.
        if(ypos > final_y){ ypos--;}       //如果ypos大于终点的left,给它减1.
        elem.style.left = xpos + "px";
        elem.style.top = ypos + "px";
        var repeat = "moveElement('" + elementID + "'," + final_x + "," + final_y + "," + interval + ")";
        // this.movement = setTimeout(this.moveElement(elementID,final_x,final_y,interval),interval);
        this.movement = setTimeout(repeat,interval);
    }
}
export default Animation;

