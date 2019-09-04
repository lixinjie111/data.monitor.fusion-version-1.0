<template>
    <div style="width: 100%; height: 100%; left: 0px; top: 0px; ">
        <div :id="targetId"  style="height:100%;width:100%;"></div>
    </div>
</template>
<script>


import _ from 'lodash';



export default {
    name:"Tusvn3DMap2",
    props:["targetId","background","navMode","minX","minY","minZ","maxX","maxY","maxZ","z","waitingtime"],
    data(){
        return {
            mapoption:{
                doc: this.targetId,
                // background:this.background == undefined? "#353239":this.background,
                background:this.background == undefined? "#000000":"#353239",
                navMode: this.navMode == undefined? Pt.EarthControls:Pt.OrbitControls   //    Pt.EarthControls  Pt.OrbitControls
            }
            ,viewer:null
            ,scene:null
            ,viewVector1:{x:this.minX,y:this.minY,z:this.minZ}
            ,viewVector2:{x:this.maxX,y:this.maxY,z:this.maxZ}


            ,shps:{}
            ,models:{}
            ,staticmodels:{}
            ,infoLabels:{gan:{},label:{}}
            ,deviceModels:{}
            ,mixCars:{}

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

            ,mainCarVID:"B21E-00-024"
            ,carBusinessData:{}
            ,action:'track'//hostVehicle  track
            ,vehicleIds:'B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020,B21E-00-021,B21E-00-022,B21E-00-023,B21E-00-024'
            ,defualtRadius:100
            ,defualtPitch:-0.8
            ,defualtZ:this.z==undefined?20.5:this.z
            ,rcuId:"2046A1037E1F"

            ,cameraDefualtZ:22.86
            ,cameraDefualtRadius:10
            ,cameraDefualtPitch:-0.2

            ,perceptionParams:null
            ,lastPerceptionMessage:null
            ,platformCars:null
            ,cachePerceptionQueue:new Array()//缓存感知数据
            ,processPerceptionInterval:1//处理缓存数据的间隔
            ,waitingProcessPerceptionTime:0
            ,lastPerceptionData:null
            ,person: new THREE.MeshStandardMaterial( { color: 0xC4B17A, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } )


            ,cacheTrackCarData:null
            ,lasttime:0
            ,cacheMainCarTrackData:new Array()
            ,lastMainCarData:null
            ,lastMainCarData2:null
            ,stepTime:150.0
            ,monitorTag:true
            ,time2:0//微调移动车的时间间隔
            ,intervalIds:new Array()

            //车辆监控
            ,cartrackwebsocketUrl:"ws://120.133.21.14:49982/mon"
            ,carid:'B21E-00-024'
            ,carTrackAction:'fusel_sider_veh'//fusel_sider_veh track
            // ,pmodels:{
            //     "2-2":new Array(),
            //     "2-1":new Array(),
            //     "1-1":new Array(),
            //     "1-2":new Array()
            // }//旁车模型
            ,pmodels:[]
            ,pCacheModelNum:100

            ,matStdObjects : new THREE.MeshStandardMaterial( { color: 0xef56e4, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } )
            ,matStdObjects_in : new THREE.MeshStandardMaterial( { color: 0xef56e4, roughness: 1, metalness: 0, opacity: 0.5, transparent: true } )
            ,person : new THREE.MeshStandardMaterial( { color: 0xC4B17A, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } )
            ,fontface:"宋体"
            ,fontSize:60

            ,pitch:0
            ,yaw:0
            ,roll:Math.PI*(10/90)
            // ,lastUtmPosition: null
            // ,nowUtmPosition: null
            // ,utmposition: null
            ,tag:true

            ,sourceProject:"EPSG:4326"
            // ,destinatePorject:"+proj=utm +zone=50 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"//北京
            ,destinatePorject:"+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"//上海
            ,timeA:0
            ,timeB:0
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
            // this.initWebsocket(this.websocketUrl);


            //车辆监控
            // this.initCarTrackWebsocket(this.cartrackwebsocketUrl);
            // this.changeMainCarId("ws://120.133.21.14:49982/mon",'B21E-00-024');
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
                // var extent = dl.getExtent(this.viewer) ;
                // debugger
                this.viewer.addEventListener("camera_changed", this.onCameraChanged)

                this.viewer.controls.addEventListener("drop",this.onDrop)

                // console.log("=======地理范围=======");
                // console.log(extent);

                // let poix = this.worldToScreen(326181.72659014474,3462354.6747002415,12.86);

                // console.log("=======像素位置======="+poix);
// 
                // this.changeRcuId2("ws://120.133.21.14:49982/mon","{\"action\": \"road_real_data\",\"data\": {\"polygon\": [[121.17979423666091,31.279518991604288],[121.16305725240798,31.279518991604288],[121.16305725240798,31.289571910992105],[121.17979423666091,31.289571910992105]]}}");

            },500);

            //处理缓存队列的数据
//            console.log("this.waitingtime:"+this.waitingtime);
            if(this.waitingtime!=null)
            {
                this.waitingProcessPerceptionTime = this.waitingtime;
            }
            setTimeout(() => {
//                console.log("1处理感知车辆缓存队列中的数据"+this.cachePerceptionQueue.length);
                this.processPerceptionData();
            }, this.waitingProcessPerceptionTime);

            // let id1 = setInterval(() => {
            //     this.processPerceptionMesage();
            // }, 200);
            // this.intervalIds.push(id1);

            // let id2=setInterval(() => {
            //    this.processPlatformCars();
            // }, 200);
            // this.intervalIds.push(id2);

            // setInterval(()=>{
            //     this.processCarTrackMessage();
            // },50);
            setTimeout(() => {
//                console.log("开始执行小车平滑移动");
                let id3=setInterval(() => {
                    if(this.monitorTag)
                    {
//                        console.log("当前缓存数据量："+this.cacheMainCarTrackData.length);
                        let d = this.cacheMainCarTrackData.shift();
                        this.moveMainCar(d);
                    }
                }, 2000);
                this.intervalIds.push(id3);
            }, 6000);

            
            // setInterval(() => {
            //     if(this.cacheMainCarTrackData.length>0&&this.tag)
            //     {
            //         console.log("开始播放动画");
            //         let d = this.cacheMainCarTrackData.shift();
            //         this.animateCar3(d);
            //         this.tag = false;
            //     }
                
            // }, 5000);
        },
        /**
         * 地图沿屏幕x,y,z方向移动
         * x,相对屏幕横方向移动距离,单位 米,可选,默认值 0.0
         * y,相对屏幕竖方向移动距离,单位 米,可选,默认值 0.0
         * z,相对屏幕外方向移动距离,单位 米,可选,默认值 0.0
         */
        move:function(x,y,z){
            dl.translate({viewer:this.viewer,x:x,y:z,z:y})
        },
        onCameraChanged:function(){
            this.$emit("CameraChanged",this);
        },
        onDrop:function(){
            this.$emit("mousedrop",this);
        },
        /**
         * 坐标转换
         */
        coordinateTransfer:function(sourceProject,destinatePorject,longitude,latitude){
            let targetCoor = proj4(sourceProject,destinatePorject,[longitude,latitude]);
            return targetCoor;
        },
        /**
         * 三维坐标转平面像素坐标
         */
        worldToScreen:function(x,y,z){
            let point = new THREE.Vector3(x,y,z==undefined? this.defualtZ:z);
            return dl.worldToScreen(point,this.viewer);
        },
         
        /**
         * 获取三维视窗的二维地理范围
         */
        getExtent:function(){
            return dl.getExtent(this.viewer);
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
         * z:高程
         */
        addShape:function(name,url,color,width,size,visible,map,proj,z){
            let shp = new dl.Shape({
                url: url,
                name: name,
                color: color==null?"#fff":color,
                width: width==null?1.0:width,
                size: size==null?6.0:size,
                visible: visible==null?true:visible,
                map: map==null?null:map,
                proj: proj,
                z:z
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
        removeModel:function(name){
            let m = this.getModel(name);
            if(m!=null)
            {
                dl.removeModel(m,this.viewer);
                delete  this.models[name];
            }
        },
        addGeometry:function(geomModel){
            this.scene.add(geomModel);
        },
        getModel:function(id){
          return this.models[id];
        },
        addStaticModel:function(name,url,x,y,z,pitch,yaw,roll){
            let model = new dl.Model({
                url: url
                // ,scale:scale==null?[1,1,1]:scale
                // scale:[5,5,5]
            });
            model.position.x = x;
            model.position.y = y;
            model.position.z = z;
            // if(color!=null)
            // {
            //     model.setColor(color);
            // }
            // model.setColor("#ffffff");
            let pitch1 = pitch==null?0:pitch;
            let yaw1 = yaw==null?0:yaw;
            let roll1 = roll==null?0:roll;
            model.rotation.set( pitch1,yaw1,roll1);

            this.scene.add(model);
            this.staticmodels[name]=model;
        },
        getStaticModel:function(id){
          return this.staticmodels[id];
        },
        remove3DInforLabel:function(name){
            let gan = this.infoLabels["gan"][name];
            let label = this.infoLabels["label"][name];
            if(gan!=null)
            {
                dl.removeModel(gan,this.viewer);
                delete this.infoLabels["gan"][name];
            }
            if(label!=null)
            {
                dl.removeModel(label,this.viewer);
                delete this.infoLabels["label"][name];
            }
        },
        add3DInfoLabel:function(name,text,x,y,z){
            var cylinderGeo = new THREE.CylinderGeometry(0.05, 0.05 ,8,0 ,0);
            var cylinderMat = new THREE.MeshLambertMaterial({//创建材料
                color:0xFF0000,
                wireframe:false
            });
            //创建圆柱体网格模型
            var cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
            cylinderMesh.position.set(x, y, z);//设置圆柱坐标
            cylinderMesh.rotation.x=Math.PI/2;
            cylinderMesh.position.set(x, y, z);

            
            this.scene.add(cylinderMesh);

            this.infoLabels["gan"][name]=cylinderMesh;

            var text1 = new dl.Text({
                text:text,
                fontsize:this.fontSize,
                borderThickness:0,
                textColor:{r: 0, g: 0, b: 0, a: 1.0}
            });

            this.infoLabels["label"][name]=text1;
            this.scene.add(text1);

            text1.setPositon([x,y,z]);
            text1.fontface=this.fontface;
            text1.update();
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


                    // var text1 = new dl.Text({
                    //     text:"",
                    //     fontsize:this.fontSize,
                    //     borderThickness:0,
                    //     textColor:{r: 0, g: 0, b: 0, a: 1.0}
                    // });

                    // this.deviceModels[deviceid].texts[m]=text1;
                    // this.scene.add(text1);
                    // text1.setPositon([0,0,0]);
                    // text1.fontface=this.fontface;
                    // text1.update();
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
                        var geoBox1 = new THREE.BoxBufferGeometry(3.8,1.6,  1.4);
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


                        // var text1 = new dl.Text({
                        //     text:"",
                        //     fontsize:this.fontSize,
                        //     borderThickness:0,
                        //     textColor:{r: 0, g: 0, b: 0, a: 1.0}
                        // });

                        // this.deviceModels[deviceid].texts[m]=text1;
                        // this.scene.add(text1);
                        // text1.setPositon([0,0,0]);
                        // text1.fontface=this.fontface;
                        // text1.update();
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

                        // let text = this.deviceModels[deviceid].texts[i];
                        // text.setText(d.uuid.substr(0,8));
                        // text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        let mdl = this.deviceModels[deviceid].cars[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        // let text = this.deviceModels[deviceid].texts[i];
                        // text.setText(d.uuid.substr(0,8));
                        // text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
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
        onPerceptionMessage:function(data){
//            console.log("=======================onPerceptionMessage===================");
//            console.log(new Date().getTime());
            this.lastPerceptionMessage = data;
            var data2 = JSON.parse(data.data);
            if(data2.result.dataFlag == 1)
            {
                this.platformCars=data2.result.vehDataDTO;
            }
            return;
            // this.models={};
            // this.count++;
            // if((this.count%this.interval)!=0)
            // {
            //     return;
            // }
            
        },
        addPerceptionData:function(data)
        {
        //     console.log("===========addPerceptionData=============");
        //     console.log(new Date().getTime());
            this.cachePerceptionQueue.push(data);            
        },
        
        processPerceptionData:function(){
            // let timeA = new Date().getTime();
            setInterval(() => {
                
                this.timeA = new Date().getTime();
//                console.log(this.timeA-this.timeB);
//                console.log("2处理感知车辆缓存队列中的数据:"+this.cachePerceptionQueue.length);
                if(this.cachePerceptionQueue.length>0)
                {
                    let data = this.cachePerceptionQueue.shift();
                    let  length = 0 ;
                    if(data!=null)
                    {
                        this.lastPerceptionMessage = data;


                        var data2 = JSON.parse(data.data);
                        if(data2.result.dataFlag == 1)
                        {
                            this.platformCars=data2.result.vehDataDTO;
                        }
                        let d2 = null;
                        try{
                            d2 = data2.result.vehDataDTO[0];
                            length = data2.result.vehDataDTO.length;
                        }catch(e){
                            console.log(data2.result);
                        }
                        if(d2!=null)
                        {
                            // if(this.lastPerceptionData!=null&&d2.gpsTime<this.lastPerceptionData.gpsTime)
                            // {
                            //     return;
                            // }
                            let pcarnum = 0;
                            let persons = 0;
                            let zcarnum = 0;
                            for (let i=0;i<length;i++)
                            {
                                let obj = data2.result.vehDataDTO[i];
                                if(obj.type == 1)
                                {
                                    zcarnum++;
                                    continue;
                                }
                                if(obj.targetType==0||obj.targetType==1||obj.targetType==3)
                                {
                                    persons++;
                                }else{
                                    pcarnum++;
                                }

                            }
                            let nums = length+"="+zcarnum +"(自车)+"+pcarnum+"(感知)+"+persons+"(人)";
                            let ss = this.timetrans(d2.gpsTime)+" 当前包数据条数："+ nums +"  缓存数:"+this.cachePerceptionQueue.length+"  最新数据时间：";
                            if(this.cachePerceptionQueue.length>0)
                            {
                                let d3 = this.cachePerceptionQueue[this.cachePerceptionQueue.length-1];
                                var data3 = JSON.parse(d3.data);

                                let d4 = null;
                                try{
                                    d4 = data3.result.vehDataDTO[0];
                                    ss+=this.timetrans(d4.gpsTime);
                                }catch(e){
//                                    console.log(data3.result);
                                    ss+="没有感知数据"
                                }
                            }else{
                                ss+=this.timetrans(d2.gpsTime);
                            }

                            
                            // this.$emit("processPerceptionDataTime",ss)
                             //不丢包
                            this.processPerceptionMesage();
                            this.processPlatformCars();
                            this.timeB = new Date().getTime();

                            let  hs = this.timeB-this.timeA;

                            ss+="  耗时："+hs

                            this.$emit("processPerceptionDataTime",ss)

                            // if(this.lastPerceptionData!=null)
                            // {
                            //     this.processPerceptionInterval = d2.gpsTime- this.lastPerceptionData.gpsTime-(timeB-timeA);
                            // }else{
                            //     this.processPerceptionInterval = 1;
                            // }
                            // if(this.processPerceptionInterval<=0)
                            // {
                            //     this.processPerceptionInterval = 1;
                            // }
                            // if(this.processPerceptionInterval>1000)
                            // {
                            //     this.processPerceptionInterval=200;
                            // }

                            if(d2!=null)
                            {
                                this.lastPerceptionData=d2;
                            }
//                            console.log("处理间隔："+this.processPerceptionInterval);
                        }
                       
                    }
                }
                // this.processPerceptionData();
            },0);//this.processPerceptionInterval
        },
        resetModels:function(){
            this.lastPerceptionMessage=null;
            for(var deviceid in this.deviceModels)
            {
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
            }
        },
        processPlatformCars:function(){
            if(this.platformCars!=null)
            {
                for(var key in this.models)
                {
                    let tag = false;
                    for(let i=0;i<this.platformCars.length;i++)
                    {
                        let vehid = this.platformCars[i].vehicleId;
                        if(key == vehid)
                        {
                            tag = true;
                            break;
                        }
                    }
                    if(!tag)
                    {
                        // debugger
                        // console.log(dl.models);
                        let model = this.models[key];
                        // dl.removeModel(model,this.viewer);
                        model.position.set( 0, 0, 0 );
                        delete this.models[key];
                        // this.tweens[key].stop();
                        delete this.tweens[key];
                    }
                }
                for(let i=0;i<this.platformCars.length;i++)
                {
                    // debugger;
                    let d = this.platformCars[i];
                    if(d.type == 1)//平台车
                    {
                        this.animateCar2(d);
                    }
                }
            }
        },
        processPerceptionMesage:function(){
            let data = null;
            if(this.lastPerceptionMessage==null)
            {
                return;
            }else{
                data = this.lastPerceptionMessage;
            }
            var data2 = JSON.parse(data.data);
            let fusionList = data2.result.vehDataDTO;
            // var deviceid = null;
            if(fusionList.length>0)
            {
                var deviceid ="0";
                if(this.deviceModels[deviceid]==null)
                {
                    this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                    this.mixCars[deviceid]={cars:[]};
                    for(let m = 0;m<this.cacheModelNum;m++)
                    {
                        //车
                        var geoBox1 = new THREE.BoxBufferGeometry(3.8,1.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                        model1.position.set( 0, 0, 0 );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;

                        this.scene.add(model1);
                        this.deviceModels[deviceid].cars[m] = model1;

                        //行人

                        var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                        var pmodel1 = new THREE.Mesh( pBox1, this.person );
                        pmodel1.position.set( 0, 0, 0 );
                        pmodel1.rotation.set( 0, 0, 0 );
                        pmodel1.castShadow = true;
                        pmodel1.receiveShadow = true;

                        this.deviceModels[deviceid].persons[m]= pmodel1;
                        this.scene.add(pmodel1);

                        //融合车辆
                        var geoBox_out = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model_out = new THREE.Mesh( geoBox_out, this.matStdObjects );

                        var geoBox_in = new THREE.BoxBufferGeometry(0.85, 2.3, 0.7);
                        var model_in = new THREE.Mesh( geoBox_in, this.matStdObjects_in );

                        model_out.position.set( 0, 0, 0 );
                        model_out.rotation.set( this.pitch,this.yaw,this.roll );
                        model_out.castShadow = true;
                        model_out.receiveShadow = true;

                        model_in.position.set( 0, 0, 0 );
                        model_in.rotation.set( this.pitch,this.yaw,this.roll );
                        model_in.castShadow = true;
                        model_in.receiveShadow = true;

                        var mixCar = new THREE.Group();
                        mixCar.add( model_out );
                        mixCar.add( model_in );

                        this.scene.add(mixCar);
                        this.mixCars[deviceid].cars[m] = mixCar;
                    }
                }else{
                    for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                    {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;
                    }
                    for(let q=0;q<this.mixCars[deviceid].cars.length;q++)
                    {
                        let mixCar = this.mixCars[deviceid].cars[q];
                        mixCar.position.x = 0;
                        mixCar.position.y = 0;
                        mixCar.position.z = 0;
                    }

                    for(let q=0;q<this.deviceModels[deviceid].persons.length;q++)
                    {
                        let person = this.deviceModels[deviceid].persons[q];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }
                }
            }
            for(let i = 0;i<fusionList.length;i++)
            {
                let d = fusionList[i];

                if(d.type==1)//平台车
                {
                    continue;
                }

                let dUTM = proj4(this.sourceProject,this.destinatePorject,[d.longitude,d.latitude]);
                if(d.targetType==0||d.targetType==1||d.targetType==3)
                {
                    if(i<this.deviceModels[deviceid].persons.length)
                    {
                        let mdl = this.deviceModels[deviceid].persons[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ;

                        // let text = this.deviceModels[deviceid].texts[i];
                        // text.setText(d.vehicleId.substr(0,8));
                        // text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        if(d.fuselStatus == 0)
                        {
                            let mdl = this.deviceModels[deviceid].cars[i];
                            mdl.position.x = dUTM[0];
                            mdl.position.y = dUTM[1];
                            mdl.position.z = this.defualtZ;
                            mdl.rotation.set( this.pitch,this.yaw,(Math.PI/180.0)*(d.heading-50));

                            this.changeModelColor(d,mdl);
                        }
                        // let text = this.deviceModels[deviceid].texts[i];
                        // text.setText(d.vehicleId.substr(0,8));
                        // text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                    }
                    if(i<this.mixCars[deviceid].cars.length)
                    {
                        if(d.fuselStatus == 1){
                            let mixCar = this.mixCars[deviceid].cars[i];
                            mixCar.position.x = dUTM[0];
                            mixCar.position.y = dUTM[1];
                            mixCar.position.z = this.defualtZ;
                            mixCar.rotation.set( this.pitch,this.yaw,(Math.PI/180.0)*d.heading);
                        }
                    }
                }
            }
        },
        onClose:function(data){
            console.log("结束连接");
        },
        reset3DMap:function()
        {
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
        changeRcuId2:function(url,params)
        {
            this.websocketUrl = url;
            // this.rcuId = rcuid;
            this.perceptionParams = params;
            this.deviceModels = {};
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
                    this.hostWebsocket.onmessage = this.onPerceptionMessage;
                    this.hostWebsocket.onclose = this.onClose;
                    this.hostWebsocket.onopen = this.onOpen2;
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
        onOpen2:function(){
            var params = this.perceptionParams;
            this.sendMsg(params);
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
        //单车监控改变监控车辆
        changeMainCarId:function(url,carid)
        {
            debugger;

            this.cartrackwebsocketUrl = url;
            this.carid = carid;
            this.mainCarVID = carid;
             if ('WebSocket' in window) {
                if(window.WebSocket){
                    if(this.carTrackWebsocket!=null)
                    {
                        if(this.carTrackWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                            this.carTrackWebsocket.close();
                        }
                    }
                    this.carTrackWebsocket=null;
                    this.carTrackWebsocket = new WebSocket(this.cartrackwebsocketUrl);
                    this.carTrackWebsocket.onmessage = this.onCarTrackMessage;
                    this.carTrackWebsocket.onclose = this.onCarTrackClose;
                    this.carTrackWebsocket.onopen = this.onCarTrackOpen;
                    this.carTrackWebsocket.onerror = this.onError;
                }
             }else{
                 console.log("该浏览器不支持websocket");
             }
        },

        initCarTrackWebsocket:function(url){
            if ('WebSocket' in window) {
                this.carTrackWebsocket = new WebSocket(url);
                this.carTrackWebsocket.onmessage = this.onCarTrackMessage;
                this.carTrackWebsocket.onclose = this.onCarTrackClose;
                this.carTrackWebsocket.onopen = this.onCarTrackOpen;
                this.carTrackWebsocket.onerror = this.onError;
            }else{
                console.log("该浏览器不支持WebSocket!");
            }
        },
        onCarTrackClose:function(data){
            console.log("结束连接");
        },
        onCarTrackOpen:function(){
            console.log("建立连接");
            var hostVehicle = {
                "action": this.carTrackAction,
                "vehicleId": this.carid
            }
            var hostVehicleMsg = JSON.stringify(hostVehicle);
            this.senCarTrackdMsg(hostVehicleMsg);
        },
        senCarTrackdMsg:function(msg){
            if(window.WebSocket){
                if(this.carTrackWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    this.carTrackWebsocket.send(msg); //send()发送消息
                    console.log("已发送消息:"+ msg);
                }
            }
        },
        onCarTrackMessage:function(data)
        {
            // console.log(data);
            // console.log("====================onCarTrackMessage===================");
            // let nowtime = new Date().getTime();
            // console.log(nowtime-this.lasttime);
            // this.lasttime = nowtime;
            this.cacheTrackCarData = data;
            this.processCarTrackMessage();
        },
        processCarTrackMessage:function(){
            debugger;
            
            // console.log("processCarTrackMessage:================>"+this.cacheMainCarTrackData.length);
            if(this.cacheTrackCarData == null)
            {
                return ;
            }
            let data = this.cacheTrackCarData;
            
            let json = JSON.parse(data.data);
            // console.log(json);
            //处理旁车信息
            let  pcars = json.result.data;
            if(pcars!=null)
            {
                if(this.pmodels.length == 0)
                {
                    for(let m=0;m<this.pCacheModelNum;m++)
                    {
                        let mesh1 = new THREE.MeshStandardMaterial( { color: 0xab6604, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } );
                        var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, mesh1);
                        model1.position.set(0,0, this.defualtZ );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;
                        this.scene.add(model1);
                        this.pmodels.push(model1);
                    }
                }
                for(let i=0;i<this.pmodels.length;i++)
                {
                    var model = this.pmodels[i];
                     model.position.set( 0, 0, this.defualtZ );
                }

                for(let n=0;n<pcars.length;n++)
                {
                    let pcar = pcars[n];
                    if(pcar.type!=1)
                    {
                        let dUTM = proj4(this.sourceProject,this.destinatePorject,[pcar.longitude,pcar.latitude]);
                        let model = this.pmodels[n];
                        model.position.set(dUTM[0],dUTM[1], this.defualtZ );
                        model.rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * pcar.heading);
                        this.changeModelColor(pcar,model);
                        
                    }else{//type=1  平台注册的车
                        // let mesh1 = new THREE.MeshStandardMaterial( { color: 0xab6604, roughness: 1, metalness: 0, opacity: 0.7, transparent: true } );
                        // var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        // var model1 = new THREE.Mesh( geoBox1, mesh1);
                        // this.animateCar(pcar,model1);
                        this.animateCar(pcar)
                    }
                    
                }
            }
            // return ;
            //处理自车信息
            let data2 = json.result.selfVehInfo;
            
            if(data2!=null)
            {
                // console.log(data2);
                // data2.gpsTime = new Date().getTime();
                // this.animateCar(data2);
                if(data2.vehicleId == this.mainCarVID)
                {
                    // console.log(this.cacheMainCarTrackData.length);
                    // this.cacheMainCarTrackData.push(data2);
                    // if(this.cacheMainCarTrackData.length<=2)
                    // {
                    //     let data3 = this.cacheMainCarTrackData.shift();
                    //     this.animateCar3(data3);
                    // }
                    // debugger
                    if(this.cacheMainCarTrackData.length==0)
                    {
                        this.cacheMainCarTrackData.push(data2);
                    }else{
                        if(data2.gpsTime<=this.lastMainCarData.gpsTime)
                        {
                            return;
                        }
                        let deltaTime = data2.gpsTime-this.lastMainCarData.gpsTime;
                        if(deltaTime<=this.stepTime)
                        {
                            this.cacheMainCarTrackData.push(data2);
                        }else{//插值处理
                            let deltaLon = data2.longitude-this.lastMainCarData.longitude;
                            let deltaLat = data2.latitude-this.lastMainCarData.latitude;
                            let steps = Math.ceil(deltaTime/this.stepTime);
                            let timeStep = deltaTime/steps;
                            let lonStep = deltaLon/steps;
                            let latStep = deltaLat/steps;
                            for(let i=1;i<=steps;i++)
                            {
                                let d = {};
                                d.longitude = this.lastMainCarData.longitude+lonStep*i;
                                d.latitude = this.lastMainCarData.latitude+latStep*i;
                                d.gpsTime = this.lastMainCarData.gpsTime + timeStep*i;
                                d.heading = data2.heading;
                                d.vehicleId = data2.vehicleId;

                                this.cacheMainCarTrackData.push(d);
                            }
                        }

                    }
                    this.lastMainCarData=data2;
                }else{
                    this.animateCar(data2);
                }
                
            }           
        },
        moveMainCar:function(data){
            console.log("当前缓存数据量moveMainCar："+this.cacheMainCarTrackData.length);
            if(data==null)
            {
                return;
            }
            let a = new Date().getTime();
            if(this.lastMainCarData2==null)
            {
                this.lastMainCarData2 = data;
                return;
            }else{
                let time = Math.floor(data.gpsTime - this.lastMainCarData2.gpsTime);
               
                setTimeout(() => {
                    
                    this.moveCar(data);
                    this.lastMainCarData2 = data;

                    let b = new Date().getTime();
                    // temptime = temptime - (b-a);
                    this.time2 = b-a;

                    let d = this.cacheMainCarTrackData.shift();
                    if(d!=null)
                    {
                        this.moveMainCar(d);
                    }
                    if(this.cacheMainCarTrackData.length>0)
                    {
                        this.monitorTag=false;
                    }else{
                        this.monitorTag=true;
                    }
                    

                    console.log("time:"+time);
                    console.log("time2:"+this.time2);
                    console.log(time-this.time2);
                }, time-this.time2<=0?1:time-this.time2);//time-this.time2
            }

        },
        moveCar:function(data){
            let vid = data.vehicleId;
            let carModel = this.models[vid];
            let position = proj4(this.sourceProject,this.destinatePorject,[data.longitude,data.latitude]);
            if(carModel==null)
            {
                this.addModel(vid,"./static/map3d/map_photo/car.3DS",position[0],position[1],this.defualtZ);
            }else{
                this.models[vid].position.set(position[0],position[1], this.defualtZ );
                this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * data.heading);
            }

            dl.moveTo({
                position: [position[0],position[1], this.cameraDefualtZ],
                radius: this.cameraDefualtRadius+10,
                yaw: -Math.PI / 180 * (data.heading),
                pitch: this.cameraDefualtPitch

            });
        },
        changeModelColor:function(data,model)
        {
            //ef56e4
            if(data.fuselType==2&&data.fuselLevel==1)
            {
                model.material.color.setStyle("#ffbf64");
            }
            if(data.fuselType==2&&data.fuselLevel==2)
            {
                model.material.color.setStyle("#ab6604");
            }
            if(data.fuselType==1&&data.fuselLevel==1)
            {
                model.material.color.setStyle("#a257d1");
            }
            if(data.fuselType==1&&data.fuselLevel==2)
            {
                model.material.color.setStyle("#651399");
            }
            model.material.color.setStyle("#bc2cb2");
        },
        animateCar:function(data2,model){
            // console.log(data2);
            if(data2==null)
            {
                return;
            }
            // if(data2.vehicleId=="B21E-00-018")
            // {
            //     try{
            //          console.log(data2);
            //     }catch(e){
            //         console.log(e);
            //         // console.log(data2);
            //     }
               
            // }
            
            if(data2!=null)
            {
                let vid = data2.vehicleId;
                let carModel = this.models[vid];
                if(carModel==null)
                {
                    if(model==undefined)
                    {
                        this.addModel(vid,"./static/map3d/map_photo/car.3DS",data2.longitude,data2.latitude,this.defualtZ);
                    }else{
                        this.models[vid]=model;
                    }
                }

                let carData = this.carBusinessData[vid];
                let lastUtmPosition = null;
                if(carData!=null)
                {
                    lastUtmPosition = this.carBusinessData[vid]['lastUtmPosition'];
                }else{
                    carData = {};
                    this.carBusinessData[vid]={};
                }

                if(this.carBusinessData[vid]['lastUtmPosition'] == null)
                {
                    this.carBusinessData[vid]['utmposition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].position.x = this.carBusinessData[vid]['utmposition'][0];
                        this.models[vid].position.y = this.carBusinessData[vid]['utmposition'][1];
                    }else{
                        this.models[vid].position.set(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.defualtZ );
                        this.changeModelColor(data2,this.models[vid]);
                    }

                    this.carBusinessData[vid]['utmposition'][2] = data2.heading;
                    this.carBusinessData[vid]['utmposition'][3] = data2.gpsTime;
                     if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].setHeading(-Math.PI / 180 * (data2.heading));
                    }else{
                        this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * data2.heading);
                    }
                    //vid与设定的主车vid相等则做相机跟随操作
                    if(this.mainCarVID == vid)
                    {
                        // this.updateCameraPosition(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.cameraDefualtZ,this.cameraDefualtRadius,this.cameraDefualtPitch,-Math.PI / 180 * (data2.heading));
                    }

                    this.carBusinessData[vid]['lastUtmPosition'] = {};
                    this.carBusinessData[vid]['lastUtmPosition'].x=this.carBusinessData[vid]['utmposition'][0];
                    this.carBusinessData[vid]['lastUtmPosition'].y=this.carBusinessData[vid]['utmposition'][1];
                    this.carBusinessData[vid]['lastUtmPosition'].rotation=this.carBusinessData[vid]['utmposition'][2];
                    this.carBusinessData[vid]['lastUtmPosition'].gpstime=this.carBusinessData[vid]['utmposition'][3];

                }else{
                    if(data2.gpsTime<=this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                    {
                        return;
                    }
                    this.carBusinessData[vid]['nowPosition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    this.carBusinessData[vid]['nowPosition'][2] = data2.heading;
                    this.carBusinessData[vid]['nowPosition'][3] = data2.gpsTime;
                    if(this.tweens[vid]==null)
                    {
                        this.tweens[vid] = new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                        .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                        .delay(0)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(
                            (d)=>{
                                this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                
                                if(this.mainCarVID==vid)
                                {
                                    dl.moveTo({
                                        position: [this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.cameraDefualtZ],
                                        radius: this.cameraDefualtRadius+10,
                                        yaw: -Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation),
                                        pitch: this.cameraDefualtPitch
                                    });
                                }
                            }
                        );

                    }else{
                            this.tweens[vid].stop();
                            this.tweens[vid]=new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                                    .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                                    .delay(0)
                                    .easing(TWEEN.Easing.Linear.None)
                                    .onUpdate(
                                        (d)=>{
                                            this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                            this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                                
                                            if(this.mainCarVID==vid)
                                            {
                                                dl.moveTo({
                                                    position: [this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.cameraDefualtZ],
                                                    radius: this.cameraDefualtRadius+10,
                                                    yaw: -Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation),
                                                    pitch: this.cameraDefualtPitch

                                                });
                                            }
                                        }
                                    )
                                    .onComplete((d)=>{

                                    });

                    }
                    this.tweens[vid].start();

                    if(this.carBusinessData[vid]['nowUtmPosition'] == null)
                    {
                        this.carBusinessData[vid]['nowUtmPosition'] = {};
                    }

                    this.carBusinessData[vid]['nowUtmPosition'].x = this.carBusinessData[vid]['nowPosition'][0];
                    this.carBusinessData[vid]['nowUtmPosition'].y = this.carBusinessData[vid]['nowPosition'][1];
                    this.carBusinessData[vid]['nowUtmPosition'].rotation = this.carBusinessData[vid]['nowPosition'][2];
                    this.carBusinessData[vid]['nowUtmPosition'].gpstime = this.carBusinessData[vid]['nowPosition'][3];
                    this.carBusinessData[vid]['lastUtmPosition'] = this.carBusinessData[vid]['nowUtmPosition'];
                }
            }
        },
        animateCar2:function(data2,model){
            // console.log(data2);
            if(data2!=null)
            {
                // debugger
                // data2.gpsTime = new Date().getTime();
                let vid = data2.vehicleId;
                let carModel = this.models[vid];
                if(carModel==null)
                {
                    if(model==undefined||model==null)
                    {
                        this.addModel(vid,"./static/map3d/map_photo/car.3DS",data2.longitude,data2.latitude,this.defualtZ);
                    }else{
                        // debugger;
                        this.models[vid]=model;
                    }
                    // this.add3DInfoLabel(vid,vid,data2.longitude,data2.latitude,this.defualtZ);
                }

                let carData = this.carBusinessData[vid];
                let lastUtmPosition = null;
                if(carData!=null)
                {
                    lastUtmPosition = this.carBusinessData[vid]['lastUtmPosition'];
                }else{
                    carData = {};
                    this.carBusinessData[vid]={};
                }

                if(this.carBusinessData[vid]['lastUtmPosition'] == null)
                {
                    this.carBusinessData[vid]['utmposition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].position.x = this.carBusinessData[vid]['utmposition'][0];
                        this.models[vid].position.y = this.carBusinessData[vid]['utmposition'][1];
                    }else{
                        this.models[vid].position.set(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.defualtZ );
                        this.changeModelColor(data2,this.models[vid]);
                    }
                    

                    // this.infoLabels["gan"][vid].position.set(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1],this.defualtZ+4);
                    // this.infoLabels["label"][vid].setPositon([this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1],this.defualtZ+8]);
                    // this.infoLabels["label"][vid].update();

                    // this.infoLabels[vid].position.y = this.carBusinessData[vid]['utmposition'][1];


                    this.carBusinessData[vid]['utmposition'][2] = data2.heading;
                    this.carBusinessData[vid]['utmposition'][3] = data2.gpsTime;
                     if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].setHeading(-Math.PI / 180 * (data2.heading));
                    }else{
                        this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * data2.heading);
                    }
                    //vid与设定的主车vid相等则做相机跟随操作
                    // if(this.mainCarVID == vid)
                    // {
                    //     this.updateCameraPosition(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.cameraDefualtZ,this.cameraDefualtRadius,this.cameraDefualtPitch,-Math.PI / 180 * (data2.heading));
                    // }

                    this.carBusinessData[vid]['lastUtmPosition'] = {};
                    this.carBusinessData[vid]['lastUtmPosition'].x=this.carBusinessData[vid]['utmposition'][0];
                    this.carBusinessData[vid]['lastUtmPosition'].y=this.carBusinessData[vid]['utmposition'][1];
                    this.carBusinessData[vid]['lastUtmPosition'].rotation=this.carBusinessData[vid]['utmposition'][2];
                    this.carBusinessData[vid]['lastUtmPosition'].gpstime=this.carBusinessData[vid]['utmposition'][3];

                    // console.log(this.carBusinessData[vid]['lastUtmPosition']);

                }else{
                    // console.log(this.carBusinessData[vid]['lastUtmPosition']);
                    if(data2.gpsTime<this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                    {
                        console.log('未按照顺序抵达');
                        return;
                    }
                    // if(this.mainCarVID==vid)
                    // {
                    //     dl.moveTo({
                    //         position: [this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.defualtZ],
                    //         radius: this.defualtRadius,
                    //         yaw: -Math.PI / 180 * (this.carBusinessData[vid]['utmposition'][2]),
                    //         pitch: this.defualtPitch

                    //     });
                    // }
                    this.carBusinessData[vid]['nowPosition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    this.carBusinessData[vid]['nowPosition'][2] = data2.heading;
                    this.carBusinessData[vid]['nowPosition'][3] = data2.gpsTime;
                    if(this.tweens[vid]==null)
                    {
                        this.tweens[vid] = new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                        .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                        .delay(0)
                        // .easing(TWEEN.Easing.Elastic.In)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(
                            (d)=>{
                                // console.log("onUpdate");
                                // console.log(d);
                                if(this.models[vid] instanceof dl.Model)
                                {
                                    if(this.models[vid]!=undefined&&this.models[vid]!=null)
                                    {
                                        this.models[vid].position.x = this.carBusinessData[vid]['lastUtmPosition'].x;
                                        this.models[vid].position.y = this.carBusinessData[vid]['lastUtmPosition'].y;
                                        this.models[vid].setHeading(-Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation));
                                    }
                                }else{
                                    if(this.models[vid]!=undefined&&this.models[vid]!=null)
                                    {
                                            this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                            // this.changeModelColor(data2,this.models[vid]);
                                            this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                    }
                                }
                            
                            //    this.infoLabels[vid].position.x = this.carBusinessData[vid]['lastUtmPosition'].x;
                            //    this.infoLabels[vid].position.y = this.carBusinessData[vid]['lastUtmPosition'].y;

                            // this.infoLabels["gan"][vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y,this.defualtZ+4);
                            // this.infoLabels["label"][vid].setPositon([this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y,this.defualtZ+8]);
                            // this.infoLabels["label"][vid].update();

                            
                            }
                        );

                    }else{
                            this.tweens[vid].stop();
                            this.tweens[vid]=
                                new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                                    .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                                    .delay(0)
                                    // .easing(TWEEN.Easing.Elastic.In)
                                    .easing(TWEEN.Easing.Linear.None)
                                    .onUpdate(
                                        (d)=>{
                                            // console.log("onUpdate");
                                            // console.log(d);
                                            if(this.models[vid] instanceof dl.Model)
                                            {
                                                if(this.models[vid]!=undefined&&this.models[vid]!=null)
                                                {
                                                    this.models[vid].position.x = this.carBusinessData[vid]['lastUtmPosition'].x;
                                                    this.models[vid].position.y = this.carBusinessData[vid]['lastUtmPosition'].y;
                                                    this.models[vid].setHeading(-Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation));
                                                }
                                                
                                            }else{
                                                if(this.models[vid]!=undefined&&this.models[vid]!=null)
                                                {
                                                    this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                                    // this.changeModelColor(data2,this.models[vid]);
                                                    this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                                }
                                            }

                                            
                                            // this.infoLabels["gan"][vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y,this.defualtZ+4);
                                            // this.infoLabels["label"][vid].setPositon([this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y,this.defualtZ+8]);
                                            // this.infoLabels["label"][vid].update();

                                            
                                        }
                                    )
                                    .onComplete((d)=>{
                                        // console.log('onComplete', d)
                                    })
                            ;

                    }
                    this.tweens[vid].start();
                    // this.tweens[vid].update();

                    if(this.carBusinessData[vid]['nowUtmPosition'] == null)
                    {
                        this.carBusinessData[vid]['nowUtmPosition'] = {};
                    }

                    this.carBusinessData[vid]['nowUtmPosition'].x = this.carBusinessData[vid]['nowPosition'][0];
                    this.carBusinessData[vid]['nowUtmPosition'].y = this.carBusinessData[vid]['nowPosition'][1];
                    this.carBusinessData[vid]['nowUtmPosition'].rotation = this.carBusinessData[vid]['nowPosition'][2];
                    this.carBusinessData[vid]['nowUtmPosition'].gpstime = this.carBusinessData[vid]['nowPosition'][3];

                    this.carBusinessData[vid]['lastUtmPosition'] = this.carBusinessData[vid]['nowUtmPosition'];
                    this.carBusinessData[vid]['utmposition'] = this.carBusinessData[vid]['nowPosition'];
                }

            }
        },
        animateCar3:function(data2,model){
            // console.log(data2);
            if(data2==null)
            {
                return;
            }
            // if(data2.vehicleId=="B21E-00-018")
            // {
            //     try{
            //          console.log(data2);
            //     }catch(e){
            //         console.log(e);
            //         // console.log(data2);
            //     }
               
            // }
            
            if(data2!=null)
            {
                let vid = data2.vehicleId;
                let carModel = this.models[vid];
                if(carModel==null)
                {
                    if(model==undefined)
                    {
                        this.addModel(vid,"./static/map3d/map_photo/car.3DS",data2.longitude,data2.latitude,this.defualtZ);
                    }else{
                        this.models[vid]=model;
                    }
                }

                let carData = this.carBusinessData[vid];
                let lastUtmPosition = null;
                if(carData!=null)
                {
                    lastUtmPosition = this.carBusinessData[vid]['lastUtmPosition'];
                }else{
                    carData = {};
                    this.carBusinessData[vid]={};
                }

                if(this.carBusinessData[vid]['lastUtmPosition'] == null)
                {
                    this.carBusinessData[vid]['utmposition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].position.x = this.carBusinessData[vid]['utmposition'][0];
                        this.models[vid].position.y = this.carBusinessData[vid]['utmposition'][1];
                    }else{
                        this.models[vid].position.set(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.defualtZ );
                        this.changeModelColor(data2,this.models[vid]);
                    }

                    this.carBusinessData[vid]['utmposition'][2] = data2.heading;
                    this.carBusinessData[vid]['utmposition'][3] = data2.gpsTime;
                     if(this.models[vid] instanceof dl.Model)
                    {
                        this.models[vid].setHeading(-Math.PI / 180 * (data2.heading));
                    }else{
                        this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * data2.heading);
                    }
                    //vid与设定的主车vid相等则做相机跟随操作
                    if(this.mainCarVID == vid)
                    {
                        // this.updateCameraPosition(this.carBusinessData[vid]['utmposition'][0],this.carBusinessData[vid]['utmposition'][1], this.cameraDefualtZ,this.cameraDefualtRadius,this.cameraDefualtPitch,-Math.PI / 180 * (data2.heading));
                    }

                    this.carBusinessData[vid]['lastUtmPosition'] = {};
                    this.carBusinessData[vid]['lastUtmPosition'].x=this.carBusinessData[vid]['utmposition'][0];
                    this.carBusinessData[vid]['lastUtmPosition'].y=this.carBusinessData[vid]['utmposition'][1];
                    this.carBusinessData[vid]['lastUtmPosition'].rotation=this.carBusinessData[vid]['utmposition'][2];
                    this.carBusinessData[vid]['lastUtmPosition'].gpstime=this.carBusinessData[vid]['utmposition'][3];

                }else{
                    if(data2.gpsTime<=this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                    {
                        return;
                    }
                    this.carBusinessData[vid]['nowPosition'] = proj4(this.sourceProject,this.destinatePorject,[data2.longitude,data2.latitude]);
                    this.carBusinessData[vid]['nowPosition'][2] = data2.heading;
                    this.carBusinessData[vid]['nowPosition'][3] = data2.gpsTime;
                    if(this.tweens[vid]==null)
                    {
                        this.tweens[vid] = new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                        .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                        .delay(0)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(
                            (d)=>{
                                this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                
                                if(this.mainCarVID==vid)
                                {
                                    dl.moveTo({
                                        position: [this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.cameraDefualtZ],
                                        radius: this.cameraDefualtRadius+10,
                                        yaw: -Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation),
                                        pitch: this.cameraDefualtPitch
                                    });
                                }
                            }
                        ).onComplete((d)=>{
                            console.log("onComplete1");
                            if(this.cacheMainCarTrackData.length>1)
                            {
                                // console.log("onComplete1=========>"+this.cacheMainCarTrackData.length);
                                let data3 = this.cacheMainCarTrackData.shift();
                                this.animateCar3(data3);
                            }
                        });

                    }else{
                            this.tweens[vid].stop();
                            TWEEN.remove(this.tweens[vid]);
                            this.tweens[vid]=new TWEEN.Tween(this.carBusinessData[vid]['lastUtmPosition'])
                                    .to({x: this.carBusinessData[vid]['nowPosition'][0], y: this.carBusinessData[vid]['nowPosition'][1], rotation: this.carBusinessData[vid]['nowPosition'][2]}, this.carBusinessData[vid]['nowPosition'][3]-this.carBusinessData[vid]['lastUtmPosition'].gpstime)
                                    .delay(0)
                                    .easing(TWEEN.Easing.Linear.None)
                                    .onUpdate(
                                        (d)=>{
                                            if(this.mainCarVID==vid)
                                            {
                                                dl.moveTo({
                                                    position: [this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.cameraDefualtZ],
                                                    radius: this.cameraDefualtRadius+10,
                                                    yaw: -Math.PI / 180 * (this.carBusinessData[vid]['lastUtmPosition'].rotation),
                                                    pitch: this.cameraDefualtPitch

                                                });
                                            }
                                            this.models[vid].position.set(this.carBusinessData[vid]['lastUtmPosition'].x,this.carBusinessData[vid]['lastUtmPosition'].y, this.defualtZ );
                                            this.models[vid].rotation.set( this.pitch,this.yaw,(-Math.PI / 180) * this.carBusinessData[vid]['lastUtmPosition'].rotation);
                                                
                                            
                                        }
                                    )
                                    .onComplete((d)=>{
                                        console.log("onComplete2");
                                        if(this.cacheMainCarTrackData.length>1)
                                        {
                                            // console.log("onComplete2=========>"+this.cacheMainCarTrackData.length);
                                            let data3 = this.cacheMainCarTrackData.shift();
                                            this.animateCar3(data3);
                                        }
                                    });

                    }
                    this.tweens[vid].start();

                    if(this.carBusinessData[vid]['nowUtmPosition'] == null)
                    {
                        this.carBusinessData[vid]['nowUtmPosition'] = {};
                    }

                    this.carBusinessData[vid]['nowUtmPosition'].x = this.carBusinessData[vid]['nowPosition'][0];
                    this.carBusinessData[vid]['nowUtmPosition'].y = this.carBusinessData[vid]['nowPosition'][1];
                    this.carBusinessData[vid]['nowUtmPosition'].rotation = this.carBusinessData[vid]['nowPosition'][2];
                    this.carBusinessData[vid]['nowUtmPosition'].gpstime = this.carBusinessData[vid]['nowPosition'][3];
                    this.carBusinessData[vid]['lastUtmPosition'] = this.carBusinessData[vid]['nowUtmPosition'];
                }
            }
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
        if ('WebSocket' in window) {
            if(window.WebSocket){
                if(this.carTrackWebsocket!=null)
                {
                    if(this.carTrackWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                        this.carTrackWebsocket.close();
                    }
                }
                this.carTrackWebsocket=null;
            }
        }else{
            console.log("该浏览器不支持websocket");
        }
        this.cacheMainCarTrackData=new Array();
        for(let i=0;i<this.intervalIds.length;i++)
        {
            clearInterval(this.intervalIds[i]);
        }
        this.intervalIds=new Array();

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
