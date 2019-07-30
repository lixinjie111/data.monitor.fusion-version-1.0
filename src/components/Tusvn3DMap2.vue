<template>
    <div style="width: 100%; height: 100%; left: 0px; top: 0px; ">
        <div :id="targetId"  style="height:100%;width:100%;"></div>
    </div>
</template>
<script>


import _ from 'lodash';



export default {
    name:"Tusvn3DMap2",
    props:["targetId","background","navMode","minX","minY","minZ","maxX","maxY","maxZ","z"],
    data(){
        return {
            mapoption:{
                doc: this.targetId,
                background:this.background == undefined? "black":this.background,
                navMode: this.navMode == undefined? Pt.EarthControls:Pt.OrbitControls   //    Pt.EarthControls  Pt.OrbitControls
            }
            ,viewer:null
            ,scene:null
            ,viewVector1:{x:this.minX,y:this.minY,z:this.minZ}
            ,viewVector2:{x:this.maxX,y:this.maxY,z:this.maxZ}


            ,shps:{}
            ,models:{}
            ,deviceModels:{
            }

            ,modelPersonArr:[]
            ,cacheModelNum:200
            ,interval:1
            ,count:0

            // ,websocketUrl:"ws://10.0.1.57:9999/ws"
            // ,websocketUrl:"ws://192.168.1.132:9998/ws"
            // ,websocketUrl:"ws://120.133.21.14:29998/ws"
            // ,websocketUrl:"ws://10.0.1.57:9982/mon"
            ,websocketUrl:"ws://192.168.1.68:9982/mon"
            ,hostWebsocket:null
            ,tweens: {}

            ,mainCarVID:"B21E-00-023"
            ,carBusinessData:{}
            ,action:'track'//hostVehicle  track
            ,vehicleIds:'B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020,B21E-00-021,B21E-00-022,B21E-00-023,B21E-00-024'
            ,defualtRadius:100
            ,defualtPitch:-0.8
            ,defualtZ:this.z==undefined?12.816:this.z
            ,rcuId:"2046A1037E1F"

            ,matStdObjects : new THREE.MeshStandardMaterial( { color: 0x7337E3, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } )
            ,person : new THREE.MeshStandardMaterial( { color: 0xC4B17A, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } )
            ,fontface:"宋体"
            ,fontSize:60

            ,pitch:0
            ,yaw:0
            ,roll:Math.PI*(10/90)
            // ,lastUtmPosition: null
            // ,nowUtmPosition: null
            // ,utmposition: null

            ,sourceProject:"EPSG:4326"
            // ,destinatePorject:"+proj=utm +zone=50 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"//北京
            ,destinatePorject:"+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"//上海
        }
    },
    watch:{
    },
    methods: {
        initMap:function(){
            this.viewer = dl.init(this.mapoption);
            this.scene = dl.scene;

            this.initView(this.viewVector1.x,this.viewVector1.y,this.viewVector1.z,this.viewVector2.x,this.viewVector2.y,this.viewVector2.z);

            //初始化websocket连接
            this.initWebsocket(this.websocketUrl);
            setTimeout(()=>{
                //科技园
                // this.updateCameraPosition(442454.32658068417,4427227.807881102,37.735093606867046,0.0000028926452461693342,-0.39699074074074336,-0.730706721974606);
                //科技园 小图
                // this.updateCameraPosition(442483.4140577592,4427251.954939776,31.211585511525108,31.559324326695666,-0.6520903697733481,-0.5889099326599347);
                this.$emit("mapcomplete",this);
                //上海
                // this.updateCameraPosition(326181.72659014474,3462354.6747002415,737.3642832288795,741.5052736914325,-1.5707963267948966,-0.05266622778143515);

                //上海自采 裁剪  全局
                // this.updateCameraPosition(326181.72659014474,3462354.6747002415,737.3642832288795,741.5052736914325,-1.5707963267948966,-0.05266622778143515);

            },500);
        },
        /**
         *获取相机参数
         */
        getCamera:function(){
          let obj = {
                   x:this.viewer.scene.view.position.x,
                   y:this.viewer.scene.view.position.y,
                   z:this.viewer.scene.view.position.z,
                   radius:this.viewer.scene.view.radius,
                   pitch:this.viewer.scene.view._pitch,
                   yaw:this.viewer.scene.view.yaw
               };
               return obj;
        },
        initView:function(x1,y1,z1,x2,y2,z2){
            let bbox = new THREE.Box3(new THREE.Vector3(x1,y1,z1), new THREE.Vector3(x2,y2,z2));
            dl.initView(bbox,this.viewer);
        },
        /**
         * name:矢量数据的名字 可选
         * url:矢量数据的url路径 必须
         * color:矢量数据的颜色类型，默认是 #fff，数据接受多种类型，比如 "rgb(255, 0, 0)"、"hsl(0, 100%, 50%)"、'#ff0000' 可选
         * width:矢量数据如果是线类型，该参数会起作用，默认是 1.0 可选
         * size:矢量数据如果是点类型，该参数会起作用，默认是 6.0 可选
         * visible:是否可见，默认是 true， 可选
         * map:纹理的url，默认是 null 可选
         * proj:数据的坐标系，默认是 和点云坐标系一致 可选
         */
        addShape:function(name,url,color,width,size,visible,map,proj){
            let shp = new dl.Shape({
                url: url,
                name: name,
                color: color==undefined?"#fff":color,
                width: width==undefined?1.0:width,
                size: size==undefined?6.0:size,
                visible: visible==undefined?true:visible,
                map: map==undefined?null:map,
                proj: proj
            });
            this.scene.add(shp);

            this.shps[name]=shp;
        },
        addModel:function(name,url,x,y,z){
            let model = new dl.Model({url: url});
            model.position.x = x;
            model.position.y = y;
            model.position.z = z;
            this.scene.add(model);
            this.models[name]=model;
        },
        getModel:function(id){
          return this.models[id];
        },
        updateModelPostion:function(modelId,x,y,z,heading){
            let model = this.models[modelId];
            if(model!=null)
            {
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                model.setHeading(heading);
            }
        },
        updateCameraPosition:function(x,y,z,radius,pitch,yaw){
            dl.moveTo({
                position: [x,y, z],
                radius: 0.001,
                yaw: yaw,
                pitch: pitch,
                viewer:this.viewer
            });
        },
        animate:function(time){
            requestAnimationFrame( animate );
            TWEEN.update( time );
        },
        update:function(e) {
            // console.log("=====================update====================================");
            // console.log(e)
            // model.position.x = lastUtmPosition.x;
            // model.position.y = lastUtmPosition.y;
            // model.setHeading(-Math.PI / 180 * (lastUtmPosition.rotation));
            // dl.moveTo({
            //         position: [lastUtmPosition.x+6,lastUtmPosition.y, 12.816],
            //         radius: 80,
            //         yaw: -Math.PI / 180 * (lastUtmPosition.rotation),
            //         pitch: -0.8
            // });
        },
        resetCamera:function(){
            this.updateCameraPosition(442456.0905737311,4427223.965503679, 60.22107514430958, 2.4329173138415072,-0.6747685185185206,-0.7853942219746017);
        },
        initWebsocket:function(url){
            if ('WebSocket' in window) {
                this.hostWebsocket = new WebSocket(url);
                this.hostWebsocket.onmessage = this.onMessage;
                this.hostWebsocket.onclose = this.onClose;
                this.hostWebsocket.onopen = this.onOpen;
                this.hostWebsocket.onerror = this.onError;
            }else{
                console.log("该浏览器不支持WebSocket!");
            }
        },
        timetrans:function (timestamp){
          var date = new Date(timestamp);//如果date为13位不需要乘1000
          var Y = date.getFullYear() + '-';
          var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
          var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
          var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
          var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
          var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
          var ms= date.getMilliseconds();
          return Y+M+D+h+m+s+"."+ms;
        },
        showBData:function(data)
        {
            this.models={};
            var time = this.timetrans(data.timestamp);
            this.$emit('showTimeStamp',time);
            var deviceid = data.deviceId;
            if(this.deviceModels[deviceid]==null)
            {
                this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                for(let m = 0;m<this.cacheModelNum;m++)
                {
                    // 0019D1AA0424  0019EAFA0104  0019EAFA0102  0018EAFA0332
                    //车
                    var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                    var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                    model1.position.set( 0, 0, 0 );
                    model1.rotation.set( this.pitch,this.yaw,this.roll );
                    model1.castShadow = true;
                    model1.receiveShadow = true;

                    this.scene.add(model1);
                    this.deviceModels[deviceid].cars[m] = model1;

                    var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                    var pmodel1 = new THREE.Mesh( pBox1, this.person );
                    pmodel1.position.set( 0, 0, 0 );
                    pmodel1.rotation.set( 0, 0, 0 );
                    pmodel1.castShadow = true;
                    pmodel1.receiveShadow = true;

                    this.deviceModels[deviceid].persons[m]= pmodel1;
                    this.scene.add(pmodel1);


                    var text1 = new dl.Text({
                        text:"",
                        fontsize:this.fontSize,
                        borderThickness:0,
                        textColor:{r: 0, g: 0, b: 0, a: 1.0}
                    });

                    this.deviceModels[deviceid].texts[m]=text1;
                    this.scene.add(text1);
                    text1.setPositon([0,0,0]);
                    text1.fontface=this.fontface;
                    text1.update();
                }
            }else{
                for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                {
                    let car = this.deviceModels[deviceid].cars[p];
                    car.position.x = 0;
                    car.position.y = 0;
                    car.position.z = 0;

                    let person = this.deviceModels[deviceid].persons[p];
                    person.position.x = 0;
                    person.position.y = 0;
                    person.position.z = 0;
                }
            }
        },
        showBData2:function(data){
             var deviceid = null;
            if(data!=null)
            {
                var time = this.timetrans(data.timestamp);
                this.$emit('showTimeStamp',time);
                deviceid = data.deviceId;
                if(this.deviceModels[deviceid]==null)
                {
                    this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                    for(let m = 0;m<this.cacheModelNum;m++)
                    {
                        //车
                        var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                        model1.position.set( 0, 0, 0 );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;

                        this.scene.add(model1);
                        this.deviceModels[deviceid].cars[m] = model1;

                        var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                        var pmodel1 = new THREE.Mesh( pBox1, this.person );
                        pmodel1.position.set( 0, 0, 0 );
                        pmodel1.rotation.set( 0, 0, 0 );
                        pmodel1.castShadow = true;
                        pmodel1.receiveShadow = true;

                        this.deviceModels[deviceid].persons[m]= pmodel1;
                        this.scene.add(pmodel1);


                        var text1 = new dl.Text({
                            text:"",
                            fontsize:this.fontSize,
                            borderThickness:0,
                            textColor:{r: 0, g: 0, b: 0, a: 1.0}
                        });

                        this.deviceModels[deviceid].texts[m]=text1;
                        this.scene.add(text1);
                        text1.setPositon([0,0,0]);
                        text1.fontface=this.fontface;
                        text1.update();
                    }
                }else{
                    for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                    {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;

                        let person = this.deviceModels[deviceid].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }
                }

            }
            for(let i = 0;i<data.data.targets.length;i++)
            {
                let d = data.data.targets[i];
                // // console.log(rsuDatas[i]);
                let dUTM = proj4(this.sourceProject,this.destinatePorject,[d.longitude,d.latitude]);

                if(d.type==0||d.type==1||d.type==3)
                {
                    if(i<this.deviceModels[deviceid].persons.length)
                    {
                        let mdl = this.deviceModels[deviceid].persons[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        let mdl = this.deviceModels[deviceid].cars[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                    }
                }
            }
        },
        setInterval:function(interval)
        {
            this.interval = interval;
            this.count = 0;
        },
        onMessage:function(data){
            this.models={};
            this.count++;
            if((this.count%this.interval)!=0)
            {
                return;
            }
            let rsuDatas = JSON.parse(data.data);
            var deviceid = null;
            if(rsuDatas.result.length>0)
            {
                var time = this.timetrans(rsuDatas.result[0].timestamp);
                this.$emit('showTimeStamp',time);
                deviceid = rsuDatas.result[0].deviceId;
                if(this.deviceModels[deviceid]==null)
                {
                    this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                    for(let m = 0;m<this.cacheModelNum;m++)
                    {
                        //车
                        var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                        model1.position.set( 0, 0, 0 );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;

                        this.scene.add(model1);
                        this.deviceModels[deviceid].cars[m] = model1;

                        var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                        var pmodel1 = new THREE.Mesh( pBox1, this.person );
                        pmodel1.position.set( 0, 0, 0 );
                        pmodel1.rotation.set( 0, 0, 0 );
                        pmodel1.castShadow = true;
                        pmodel1.receiveShadow = true;

                        this.deviceModels[deviceid].persons[m]= pmodel1;
                        this.scene.add(pmodel1);


                        var text1 = new dl.Text({
                            text:"",
                            fontsize:this.fontSize,
                            borderThickness:0,
                            textColor:{r: 0, g: 0, b: 0, a: 1.0}
                        });

                        this.deviceModels[deviceid].texts[m]=text1;
                        this.scene.add(text1);
                        text1.setPositon([0,0,0]);
                        text1.fontface=this.fontface;
                        text1.update();
                    }
                }else{
                    for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                    {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;
                    }

                    for(let p=0;p<this.deviceModels[deviceid].persons.length;p++)
                    {
                        let person = this.deviceModels[deviceid].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }

                    for(let p=0;p<this.deviceModels[deviceid].texts.length;p++){
                        var text1 = this.deviceModels[deviceid].texts[p];
                        text1.setPositon([0,0,0]);
                        text1.update();
                    }
                }

            }
            for(let i = 0;i<rsuDatas.result.length;i++)
            {
                let d = rsuDatas.result[i];
                let dUTM = proj4(this.sourceProject,this.destinatePorject,[d.target.longitude,d.target.latitude]);

                if(d.target.type==0||d.target.type==1||d.target.type==3)
                {
                    if(i<this.deviceModels[deviceid].persons.length)
                    {
                        let mdl = this.deviceModels[deviceid].persons[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.target.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        let mdl = this.deviceModels[deviceid].cars[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.target.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                    }
                }
            }
        },
        onClose:function(data){
            console.log("结束连接");
        },
        reset3DMap:function(){
            for(var key in this.deviceModels){
                for(let p=0;p<this.deviceModels[key].cars.length;p++)
                {
                    let car = this.deviceModels[key].cars[p];
                    car.position.x = 0;
                    car.position.y = 0;
                    car.position.z = 0;
                }

                for(let p=0;p<this.deviceModels[key].persons.length;p++)
                {
                    let person = this.deviceModels[key].persons[p];
                    person.position.x = 0;
                    person.position.y = 0;
                    person.position.z = 0;
                }

                for(let p=0;p<this.deviceModels[key].texts.length;p++){
                    var text1 = this.deviceModels[key].texts[p];
                    text1.setPositon([0,0,0]);
                    text1.update();
                }
        　　}
            if ('WebSocket' in window) {
                if(window.WebSocket){
                    if(this.hostWebsocket!=null)
                    {
                        if(this.hostWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                            this.hostWebsocket.close();
                        }
                    }
                    this.hostWebsocket=null;
                }
             }else{
                 console.log("该浏览器不支持websocket");
             }
        },
        changeRcuId:function(url,rcuid)
        {
            this.websocketUrl = url;
            this.rcuId = rcuid;
             if ('WebSocket' in window) {
                if(window.WebSocket){
                    if(this.hostWebsocket!=null)
                    {
                        if(this.hostWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                            this.hostWebsocket.close();
                        }
                    }
                    this.hostWebsocket=null;
                    this.hostWebsocket = new WebSocket(this.websocketUrl);
                    this.hostWebsocket.onmessage = this.onMessage;
                    this.hostWebsocket.onclose = this.onClose;
                    this.hostWebsocket.onopen = this.onOpen;
                    this.hostWebsocket.onerror = this.onError;
                }
             }else{
                 console.log("该浏览器不支持websocket");
             }
        },
        onOpen:function(){
            var hostVehicle = '{"action":"RCUPer","devId":"'+this.rcuId+'"}';
            this.sendMsg(hostVehicle);
        },
        sendMsg:function(msg){
            if(window.WebSocket){
                if(this.hostWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    this.hostWebsocket.send(msg); //send()发送消息
                    console.log("已发送消息:"+ msg);
                }
            }
        },
        onError:function(e){
            console.log(e);
        },
        pageResize(){
            const borwserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            this.pageHeight = borwserHeight - 64;
            // console.log('pageHeight : ' + this.pageHeight)
        },
        resize:function(size)
        {

        }
    },
    created(){

    },
    mounted(){
        this.pageResize();
        window.onresize = () => {
            this.pageResize();
        }
        //初始化地图
        setTimeout(() => {
            this.initMap();
        }, 1000);
    },
    destroyed(){

    }
}
</script>
<style>
    #map {
        width: 100%;
        height: 100%;
        overflow: hidden;
        margin:0;
    }
    canvas {
        width: 100%;
        height: 100%;
        position: relative;
    }

</style>
