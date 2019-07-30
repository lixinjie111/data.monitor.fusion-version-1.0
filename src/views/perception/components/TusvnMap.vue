<template>
    <div style="height:100%">
        <div :id="targetId"  style="height:100%" v-loading="isLoading"></div>
        <div :id="overlayContainerId" style="display: none;">
            <!-- <div id="marker" title="Marker">
                <img src="../../static/assets/images/loading.gif"/>
            </div> -->
            <!-- <img id="marker" src="../../static/assets/images/loading.gif"/> -->
        </div>
        <template v-for="(popupData,key,index) in popupDatas">
            <div :id="popupData.id+'-popup'" :ref="popupData.id+'-popup'" class="ol-popup" :key="index">
                <a href="#" :overlayid="popupData.id" :id="popupData.id+'-popup-closer'" class="ol-popup-closer" @click="closePopup($event)"></a>
                <div :id="popupData.id+'-popup-content'">
                    <span v-html="popupData.content"></span>
                </div>
            </div>
        </template>
        

    </div>
</template>
<script>

// import startIcon from '@/assets/images/start.png';
// import endIcon from '@/assets/images/end.png';
// import startIcon2 from '@/assets/images/start2.png';
// import endIcon2 from '@/assets/images/end2.png';

import _ from 'lodash';
import "ol/ol.css";
import { unByKey } from 'ol/Observable.js'
// import OLObservable from 'ol/Observable.js'
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import {Image as ImageLayer} from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {defaults as defaultControls,ScaleLine,FullScreen} from 'ol/control.js';
import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction.js';
import TileLayer from 'ol/layer/Tile.js';
import BingMaps from 'ol/source/BingMaps';
import OSM from 'ol/source/OSM.js';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import MousePosition from 'ol/control/MousePosition.js';
import * as mapInit from './MapUtils.js';

/*import TDate from '@/common/date.js'*/

import axios from 'axios'

export default {
    name:"TusvnMap",
    props:["targetId","overlayContainerId",], //'trafficInfo'
    data(){
        return {
            isLoading: false,
             orderStatus: -1
            ,map: null
            ,project:"EPSG:4326"//地图投影
            // 120.80224989415075-----latitude:31.28000259048651
            ,center: [120.80224989415075,31.28000259048651]//地图初始中心
            ,zoom: 10//地图初始缩放级别
            ,planLineTracks: []
            ,realLineTracks: []
            ,pageHeight: 400
            ,carLayerId:"carLayer"
            ,currentDivPolygon:null//记录旋转过后的，div窗口对应的矩形
            // ,startIcon: '@/assets/images/start.png'
            // ,endIcon: '@/assets/images/end.png'
            ,popupDatas:{}
            ,overlays:{}
        }
    },
    watch:{
    },
    methods: {       
        //初始化地图
        initMap:function(){

            this.$data.map = new Map({
                controls: defaultControls({attribution: false,zoom: false,}).extend([
                    // overviewMapControl
                    // new ScaleLine()
                    // ,new FullScreen()
                    // ,new MousePosition()
                ]),
                interactions: defaultInteractions().extend([
                    // new DragRotateAndZoom()
                ]),
                layers: [
                    new TileLayer({
//                        source: new OSM({
//                            wrapX: false,
//                            // url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                            // url:"http://113.208.118.62:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
//                            url:"http://120.133.21.14:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
//                            // url:"http://10.0.1.22:8086/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
//                            // url:"https://api.chinavehiclenet.cn:8769/mapproxy/mapserver/getMapTile?protocol=https&cache=true&server={a-c}&xyz={z}/{x}/{y}&type=vector&format=png&baseUrl=tile.openstreetmap.org"
//                        })
                        // source: new BingMaps({
                        //     key: 'AlgNEg0cVVHbTuJ8jXqJzA6uah5MIklbLmMySfTMb-GQZzEndCrxR1PxBEaWC3Bt',
                        //     imagerySet: "Aerial"  //'Road','RoadOnDemand','Aerial','AerialWithLabels','collinsBart','ordnanceSurvey'
                        //     // use maxZoom 19 to see stretched tiles instead of the BingMaps
                        //     // "no photos at this zoom level" tiles
                        //     // maxZoom: 19
                        // })
                    })
                ],
                target: this.targetId,
                // fit:true,
                view: new View({
                    projection:this.$data.project,
                    center: this.$data.center,
                    zoom: this.$data.zoom
                })
            });
            
            /*this.addWms("shanghai_qcc:dl_shcsq_wgs84_zc_0708","http://113.208.118.62:8080/geoserver/shanghai_qcc/wms","shanghai_qcc:dl_shcsq_wgs84_zc_0708","",1,true,null); // 上海汽车城
*/
            // this.clickEventKey = this.$data.map.on("click",this.mapClick);
            this.$data.map.getView().on("change:resolution",this.viewLevelChange);
            this.$data.map.on("moveend",this.moveEnd);
            
            // this.removeClickEvent();
            unByKey(this.clickEventKey);

            //测试用
            this.addVectorLayer("vectorLayer_01");

            // this.centerAt(116.38921511745102,39.912577179827466);
            // this.addLineString([[116.38921511745102,39.912577179827466]
            //     ,[116.39051330661422,39.91280248538472]
            //     ,[116.3911033925975,39.91340330020405]
            //     ,[116.39159691905624,39.91415431872822]
            //     ,[116.39247668361313,39.914336708941235]],
            //     "line_01",
            //     "red",
            //     "round",
            //     "round",
            //     [5,0],
            //     0,
            //     10,
            //     5,
            //     "vectorLayer_01"
            // );
        },
        /**
         * 根据像素位置获取经纬度坐标
         * 
         * @param {module:ol/pixel~Pixel} pixel  [2,4] 像素坐标位置
         */
        getCoordinateFromPixel:function(pixel){
            return this.$data.map.getCoordinateFromPixel(pixel);
        },
        /**
         * 根据经纬度获取像素坐标
         * @param {module:ol/coordinate~Coordinate} coordinate 经纬度坐标位置  
         */
        getPixelFromCoordinate:function(coordinate){
            return this.$data.map.getPixelFromCoordinate(coordinate);
        },
        /**
         * 添加信息窗口到地图中
         * obj格式如下：
         * {
         *     id:"0011",  //唯一编码
         *     content:"<span style='color:red'>001</span>",//信息框中显示的内容
         *     lon:117,//经度
         *     lat:39  //纬度
         * }
         */
        addInfoWindow:function(obj){           

            this.$set(this.$data.popupDatas, obj.id, obj);
            this.$nextTick(function(){
                let container = document.getElementById(obj.id+'-popup');
                let overlay = new Overlay({
                    element: container,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });
                this.$data.overlays[obj.id]=overlay;
                this.$data.map.addOverlay(overlay);
                overlay.setPosition([obj.lon,obj.lat]);
            });
        },

        addMyInfoWindow: function(obj, flag){

            this.pointData = obj;

            this.trafficInfo.id = obj.id;
            this.trafficInfo.eventName = obj.trafficInfo.eventName;

            this.circleLon = obj.lon;
            this.circleLat = obj.lat;
            
            if(obj.isEdit){
                this.initDetail(obj, flag);
                this.trafficInfo.isEdit = true;
            }else{

                obj.trafficInfo.longitude = this.toFixedLen(obj.trafficInfo.longitude);
                obj.trafficInfo.latitude = this.toFixedLen(obj.trafficInfo.latitude);
                let _alertCategory = this.trafficInfo.alertCategory;
                this.trafficInfo = obj.trafficInfo;
                this.trafficInfo.alertCategory = _alertCategory;
                this.trafficInfo.isEdit = false;

                this.initDatasourceList();

                // let radius = obj.trafficInfo.alertRadius;                
                let radius = obj.trafficInfo.affectRange;                
                this.drawBgCircle(obj.lon,obj.lat,radius);    
            }            

            this.showTrafficInfoPop = true;
            this.$refs.ruleFormMap.clearValidate();
            this.$nextTick(function(){
                let container = document.getElementById('traffic-info-release-popup');
                let overlay = new Overlay({
                    element: container,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });
                this.$data.overlays[obj.id]=overlay;
                this.$data.map.addOverlay(overlay);
                overlay.setPosition([obj.lon,obj.lat]);

                // 设置偏移
                overlay.setOffset([0,-29]);
            });

                

            if(!obj.isEdit){
                this.pubMsgIconID = 'pub_msg_ico_' + obj.id;
                this.drawPubMsgIcon(obj.lon,obj.lat,obj.icon);
            }
        },
        // 画圆形背景图片
        drawBgCircle(lon,lat,radius){
            
            // 245,147,7
            this.addCircle(lon,lat,radius,this.circleRangeID,[245,147,7,0.1],'#F59307',null,null,null,null,null,null,this.MessageTempLayer);
            
        },
        // 移除圆形背景图片
        clearCircle(){       
            
            this.removeFeature(this.circleRangeID,this.MessageTempLayer);
        },
        // 画 发布信息图标
        drawPubMsgIcon(lon,lat,icon){
            // lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset,scale
            let pubMsgBgIco = 'static/images/ico-bg2.png';
            let pubMsgBgIcoID = 'bg_' + this.pubMsgIconID;

            // [44,58]
            this.addImg(lon,lat,pubMsgBgIcoID,this.MessageTempLayer,pubMsgBgIco,[44,87],null,null,null,[0,15]);

            // [22,37]
            this.addImg(lon,lat,this.pubMsgIconID,this.MessageTempLayer,icon,[22,66],null,null,null,[0,15]);
        },
        // 移除 发布信息图标
        clearPubMsgIcon(){
            // console.log(this.pubMsgIconID);
            if(!this.pubMsgIconID) return;

            let pubMsgBgIcoID = 'bg_' + this.pubMsgIconID;

            this.removeFeature(pubMsgBgIcoID,this.MessageTempLayer);
            this.removeFeature(this.pubMsgIconID,this.MessageTempLayer);

            // this.$emit("setPointer",{bool: false, flag: true}); 
        },

        /**
         *关闭信息框
         */
        closeMyInfoWindow:function(e){

           this.clearCircle();
           this.clearPubMsgIcon();           
           
            //重置 表单
            // this.resetForm();

           // 关闭信息框
            let overlayid = 'traffic-info-release';
            let overlay = this.$data.overlays[overlayid];
            this.$data.map.removeOverlay(overlay);
            // e.target.blur();

            this.showTrafficInfoPop = false;

            return false;
        },
        

        /**
         *关闭信息框
         */
        closePopup:function(e){
            let overlayid = e.target.attributes.overlayid.value;
            let overlay = this.$data.overlays[overlayid];
            this.$data.map.removeOverlay(overlay);
            e.target.blur();
            return false;
        },
       
        mapClick:function(mevent){

            if(this.mapStatus == 'normal'){
                this.$emit("MapClick",this,mevent);
                this.removeClickEvent();        // 移除点击事件

            }else if(this.mapStatus == 'TempLayerInteraction'){
                
                let lon = mevent.coordinate[0];
                let lat = mevent.coordinate[1];

                // // 把新的坐标赋值给旧的坐标
                // this.pathPoint.oldVal.lon = this.pathPoint.newVal.lon;
                // this.pathPoint.oldVal.lat = this.pathPoint.newVal.lat;

                // 把当前坐标赋值给新的坐标
                this.pathPoint.newVal.lon = lon;
                this.pathPoint.newVal.lat = lat;
                
                this.pathPoint.pointList = [];

                // 第一次点击， 点击同一个位置 不画线
                // 判断 起点 ，终点
                if((this.pathPoint.newVal.lon != this.pathPoint.oldVal.lon) && (this.pathPoint.newVal.lat != this.pathPoint.oldVal.lat)){       
                    
                    // 画线
                    this.addPathLine(this.pathPoint.newVal.lon,this.pathPoint.newVal.lat,this.pathPoint.oldVal.lon,this.pathPoint.oldVal.lat);
                    
                    // 打点 
                    this.addPathIco(this.pathPoint.newVal.lon,this.pathPoint.newVal.lat,'new');
                    // 画按钮
                    // this.addPathIcoBtn(this.pathPoint.newVal.lon,this.pathPoint.newVal.lat);
                    
                    // 暂时无法区分覆盖物点击事件和地图点击事件，支持选一个点
                    this.removeClickEvent();
                }               
               
            }            
        },
        viewLevelChange:function(mevent){
            let z = parseInt(this.$data.map.getView().getZoom());
            if(this.$data.zoom!=z)
            {
                this.$emit("ViewLevelChange",this,z);
                this.$data.zoom=z;
            }
        },
        moveEnd:function(mevent){
            this.$emit("ExtentChange",this,this.getCurrentExtent());
        },
        /**
         * 固定地图到某一缩放级别，使鼠标滚轮失效
         * 
         * @param {Number} level  缩放级别
         */
        forbidZoom:function(level){
            let view = this.$data.map.getView();
            view.setZoom(level);
            view.setMaxZoom(level);
            view.setMinZoom(level);
        },
        /**
         * 旋转地图
         * 
         * @param {Number} rotation  弧度，180度=Math.PI弧度
         */
        rotateMap:function(rotation){
            let view = this.$data.map.getView();
            view.animate({
                rotation: rotation
            });
            //获取旋转后的当前窗口矩形Polygon
            let currentExtent = this.getCurrentExtent();
            this.$data.currentDivPolygon=new Polygon([[
                [currentExtent[2],currentExtent[3]],
                [currentExtent[2],currentExtent[1]],
                [currentExtent[0],currentExtent[1]],
                [currentExtent[0],currentExtent[3]],
                [currentExtent[2],currentExtent[3]]
            ]]);
            // view.setRotation(rotation);
            this.$data.currentDivPolygon.rotate(rotation,[(currentExtent[0]+currentExtent[2])/2,(currentExtent[1]+currentExtent[3])/2]);
            
        },
        /**
         * 判断是否在点在当前地图div对应Polygon的范围内
         */
        isInDivPolygon:function(x,y)
        {
            if(this.$data.currentDivPolygon==null)
            {
                let currentExtent = this.getCurrentExtent();
                this.$data.currentDivPolygon=new Polygon([[
                    [currentExtent[2],currentExtent[3]],
                    [currentExtent[2],currentExtent[1]],
                    [currentExtent[0],currentExtent[1]],
                    [currentExtent[0],currentExtent[3]],
                    [currentExtent[2],currentExtent[3]]
                ]]);
            }
            return this.$data.currentDivPolygon.intersectsCoordinate([x,y]);
        },

        /**
         * 禁止缩放
         */
        forbidDrag:function(){
            let controls = this.$data.map.getControls();
            let interactions = this.$data.map.getInteractions();
            for(var i=0;i<interactions.getArray().length;i++)
            {
                this.$data.map.removeInteraction(interactions.getArray()[i]);
            }
        },
        /**
         * 向地图中添加覆盖物
         * 
         * @param {any} id 
         * @param {Document} dom 
         * @param {Number} lon 
         * @param {Number} lat 
         * @param {String} className  样式
         * @param {Array.<Number>} offset  位置偏移
         */
        addOverlay:function(id, dom, lon, lat, className,offset) {
            mapInit.addOverlay(id, dom, lon, lat, className,offset,this.$data.map);
        },
        /**
         * 向地图中添加图片覆盖物
         * 
         * @param {any} id 
         * @param {String} imgUrl  图片地址
         * @param {Number} courseAngle 旋转角度
         * @param {Number} lon 
         * @param {Number} lat 
         * @param {String} bdata 业务数据
         * @param {Array.<Number>} offset  位置偏移 [x,y]
         * @param {Function} callback 点击的回调
         */
        addImgOverlay:function(id, imgUrl, courseAngle, lon, lat, bdata, offset, callback){

            let overLay_container = document.getElementById(this.overlayContainerId);
            let overLay_img = document.createElement("img");
            overLay_img.setAttribute("src",imgUrl);
            overLay_img.setAttribute("id",id);
            overLay_img.setAttribute("bdata",bdata);
            if(courseAngle!=null){
                overLay_img.style.transform = 'rotate(' + courseAngle + 'deg)';
            }

            if(callback!=null)
            {
                overLay_img.onclick=callback;

            }
            
            overLay_container.appendChild(overLay_img);
            mapInit.addOverlay(id, overLay_img, lon, lat, null,offset,this.$data.map);
        },
        /**
         * 重新设置覆盖物的位置
         * @param {String} id 
         * @param {Number} lon 
         * @param {Number} lat 
         */
        setOverlayPosition:function(id, lon, lat) {
            mapInit.setOverlayPosition(id, lon, lat,this.$data.map);
        },
        /**
         * 清除地图中的覆盖物
         * 
         */
        clearOverlays:function() {
            mapInit.clearOverlays(this.$data.map);
        },
        /**
         * 根据id移除覆盖物
         * 
         * @param {String} id 覆盖物的id
         */
        removeOverlayById:function(id) {
            mapInit.removeOverlayById(id,this.$data.map);
        },
        /**
         * 添加矢量图层
         * @param {string} id 矢量图层id
         */
        addVectorLayer:function(id){
            let carLayer = mapInit.generateVectorLayer(id);
            mapInit.addLayer(this.$data.map,carLayer);
        },
        /**
         * 通过Id获取图层
         * @param {string} id 图层id
         */
        getLayerById:function(id){
            return mapInit.getLayerByAttr(this.$data.map, "id", id);
        },
        /**
         * 通过Id获取图层
         * @param {string} id 图层id
         */
        removeLayerById:function(id){
           let layer = this.getLayerById(id);
           if(layer!=undefined)
           {
               this.$data.map.removeLayer(layer);
           }
        },
        // /**
        //  * 向地图中添加图片
        //  * 
        //  * @param {number} lon 浮点型的值
        //  * @param {number} lat 浮点型的值
        //  * @param {string} id 图片id
        //  * @param {string} layerId 图层id
        //  * @param {string} carImgUrl 图片地址
        //  * @param {Array.<number>} size 图片大小，例如：[22,37]
        //  * @param {number} rotation 旋转角度（弧度），顺时针方向为正。例如：顺时针方向偏转90度，对应的值是Math.PI/2
        //  * @param {boolean} rotateWithView 是否跟view一起旋转
        //  * @param {number} opacity 透明度，0到1之间的值
        //  * @param {Array.<number>} offset x、y方向的偏移，默认值是[0,0]。例如：[0,0]
        //  * @param {number} scale 图片缩放，默认为1
        //  */
        // addImg:function(lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset,scale){
        //      let carStyle = new Style({
        //         image:mapInit.generateIcon(carImgUrl||"static/images/warning.png",size||[22,37],rotation||0,rotateWithView||true,opacity||1,offset||[0,0],scale)
        //     });
        //     mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        // },
        /**
        * 向地图中添加图片
        *
        * @param {number} lon 浮点型的值
        * @param {number} lat 浮点型的值
        * @param {string} id 图片id
        * @param {string} layerId 图层id
        * @param {string} carImgUrl 图片地址
        * @param {Array.<number>} size 图片大小，例如：[22,37]
        * @param {number} rotation 旋转角度（弧度），顺时针方向为正。例如：顺时针方向偏转90度，对应的值是Math.PI/2
        * @param {boolean} rotateWithView 是否跟view一起旋转
        * @param {number} opacity 透明度，0到1之间的值
        * @param {Array.<number>} offset x、y方向的偏移，默认值是[0,0]。例如：[0,0]
        * @param {number} scale 图片缩放，默认为1
        * @param {Array.<number>} anchor Anchor. Default value is the icon center.
        */
        addImg:function(lon,lat,id,layerId,carImgUrl,size,rotation,rotateWithView,opacity,offset,scale,anchor){
            let carStyle = new Style({
                image:mapInit.generateIcon(carImgUrl||"../../static/assets/images/geolocation_marker_heading.png",size||[22,37],rotation||0,rotateWithView||true,opacity||1,offset||[0,0],scale,anchor)
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },       

        /**                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
         * 向地图中添加规则图形形点
         * 
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id id
         * @param {string} layerId 图层id
         * 图形的样式
         * @param {module:ol/style/Fill~Fill} fill 填充样式。调用generateFill生成
         * @param {number} points 点数
         * @param {number} radius 半径
         * @param {number} radius1  外半径（星形）
         * @param {number} radius2  内半径（星形）
         * @param {number} angle 偏转角度，弧度
         * @param {module:ol/style/Stroke~Stroke} stroke 边线的样式。调用generateStroke函数生成
         * @param {number} rotation 旋转角度，弧度
         * @param {boolean} rotateWithView 是否和view一起偏转
        */
        addRegularShapePoint:function(lon,lat,id,layerId,fill, points, radius, radius1, radius2, angle, stroke, rotation, rotateWithView){
             let carStyle = new Style({
                image:mapInit.generateRegularShape(fill, points, radius, radius1, radius2, angle, stroke, rotation, rotateWithView)
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },
        /**
         * 向地图中添加普通点
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id 图片id
         * @param {string} layerId 图层id
         * 
         * @param {number} radius 圆的半径 默认值是5
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，默认值是red，'black'、'red'、'green'、'white'、'#4271AE' 
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，默认值是green，'black'、'red'、'green'、'white'、'#4271AE'
         * @param {number} StrokeWidth 线宽度 默认值是3
         */
        addNormalPoint:function(lon,lat,id,layerId,radius,fillColor,strokeColor,StrokeWidth){
            let image = new CircleStyle({
                radius: radius||5,
                fill: new Fill({
                    color: fillColor||"red"
                }),
                stroke: new Stroke({
                    color: strokeColor||"green",
                    width: StrokeWidth||3
                })
            });
            let carStyle = new Style({
                image:image
            });
            mapInit.addPoint(lon,lat,id,carStyle,this.getLayerById(layerId));
        },

        /**
         * 向地图中添加文字
         * 
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值
         * @param {string} id 图片id
         * @param {string} layerId 图层id
         * @param {string} text 显示的文字
         * @param {string} font 字体，默认值：'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"'
         * @param {string} placement 位置，可取值，line、point,默认值：line
         * @param {number} textOffsetX  x方向上的偏移，单位像素，默认值：0
         * @param {number} textOffsetY  y方向上的偏移，单位像素，默认值：0
         * @param {string} fillColor 文字颜色，默认值：white
         * @param {module:ol/style/Stroke~Stroke} stroke 绘制的线条的样式
         * @param {string} backgroundFillColor 文字颜色，默认值：black
         * @param {module:ol/style/Stroke~Stroke} backgroundStroke 背景边框绘制的线条的样式
         * @param {Array.<number>} padding 内边距，默认值是[0, 0, 0, 0]
         * 
         * @param {boolean} withImg 是否带图标
         * @param {string} imgUrl 图片地址
         * @param {Array.<number>} imgSize 图片大小，例如：[22,37]
         * @param {Array.<number>} imgOffset x、y方向的偏移，默认值是[0,0]。例如：[0,0]
         * @param {number} scale 图片缩放，默认为1
         */
        addText:function(lon,lat,id,layerId,text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding,withImg,imgUrl,imgSize,imgOffset,scale){
             let textStyle = null;
             if(withImg){
                textStyle = new Style({
                    image:mapInit.generateIcon(imgUrl||"../../static/assets/images/geolocation_marker_heading.png",imgSize||[22,37],0,true,1,imgOffset||[0,0],scale),
                    text:mapInit.generateText(text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding||[0, 0, 0, 0]),
                });
             }else{
                textStyle = new Style({
                    text:mapInit.generateText(text, font, placement, textOffsetX, textOffsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding||[0, 0, 0, 0]),
                });
             }
             
            mapInit.addPoint(lon,lat,id,textStyle,this.getLayerById(layerId));
        },

        /**
         * 添加线条
         * @param {Array.<Array.<number>>} coordinates 坐标序列[[112,39],[113,40]]
         * @param {string} id 线条的ID
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * @param {string} layerId 图层id
         */
        addLineString:function(coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let lineStyle = new Style({
                stroke:mapInit.generateStroke(color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width)
            });
            mapInit.addLineString(coordinates, id, lineStyle, this.getLayerById(layerId));            
        },
        /**
         * 向地图中添加圆
         *  @param {number} lon 经度，浮点型的值
         *  @param {number} lat 纬度，浮点型的值
         *  @param {number} radius 半径
         *  @param {any} id 唯一标识
         *  @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         *  @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         *  @param {string} lineCap 线端点的样式。butt, round, or square.
         *  @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         *  @param {Array.<number>} lineDash 虚线设置。[5,5]
         *  @param {number} lineDashOffset 默认值是0。
         *  @param {number} miterLimit 默认值10
         *  @param {number} width 线宽度
         *  @param {module:ol/Layer} layer Openlayers的Layer对象
         */
        addCircle:function(lon, lat, radius, id,fillColor,strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let circleStyle = new Style({
                stroke:mapInit.generateStroke(strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width),
                fill:mapInit.generateFill(fillColor)
            });
            mapInit.addCircle(lon, lat,radius, id, circleStyle, this.getLayerById(layerId));
        },
        /**
         * 添加面
         * @param {Array.<Array.<Array.<module:ol/coordinate~Coordinate>>>} coords 数组型的值
         * @param {string} id 线条的ID
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} fillColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} strokeColor 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * @param {string} layerId 图层id
         */
        addMultiPolygon:function(coords, id, fillColor,strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, layerId) {
            let polygonStyle = new Style({
                stroke:mapInit.generateStroke(strokeColor, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width),
                fill:mapInit.generateFill(fillColor)
            });
            mapInit.addMultiPolygon(coords, id, polygonStyle, this.getLayerById(layerId));
        },
        /**
         * 添加箭头
         * @param {Array.<Array.<number>>} coordinates 坐标二维数组[[x1,y1],[x2,y2],[x3,y3]]
         * @param {*} id 箭头id
         * 
         * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE'
         * @param {string} lineCap 线端点的样式。butt, round, or square.
         * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
         * @param {Array.<number>} lineDash 虚线设置。[5,5]
         * @param {number} lineDashOffset 默认值是0。
         * @param {number} miterLimit 默认值10
         * @param {number} width 线宽度
         * 
         * @param {string} tailImgUrl 箭头尾的图片
         * @param {string} headImgUrl 箭头头的图片
         * @param {string} layerId 图层id
         */
        addArrow:function(coordinates, id, color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width, tailImgUrl, headImgUrl, layerId) {
            let lineStyle = new Style({
                stroke:mapInit.generateStroke(color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width)
            });
            mapInit.addArrow(coordinates, id, lineStyle, tailImgUrl||"../../static/assets/images/geolocation_marker.png", headImgUrl||"../../static/assets/images/geolocation_marker_heading.png", this.getLayerById(layerId));
        },
        /**
         * 将地图的中心移动到指定的点
         * @param {number} lon 浮点型的值
         * @param {number} lat 浮点型的值 
         */
        centerAt:function(lon,lat){
            this.$data.map.getView().setCenter([lon,lat]);
        },
        /**
         * 将地图缩放到某一级别
         * 
         * @param {number} level 整数值，取0到21的整数值
         */
        zoomTo:function(level){
            this.$data.map.getView().setZoom(level);
        },
        /**
         * 获取地图当前的矩形范围
         */
        getCurrentExtent:function(){
            return this.$data.map.getView().calculateExtent(this.$data.map.getSize());
        },
        /**
         * 获取地图当前的缩放级别
         */
        getCurrentLevel:function(){
            let z = parseInt(this.$data.map.getView().getZoom());
            return z;
        },
        /**
         * 移除地图上的要素
         * @param {*} id 要素id
         * @param {*} layerId 要素所在的图层ID
         */
        removeFeature:function(id, layerId) {
            let source = this.getLayerById(layerId).getSource();
            let f = source.getFeatureById(id);
            if (f != null) {
                source.removeFeature(f);
            }
        },
        /**
         * 移除所有要素
         * @param {*} layerId 要素所在的图层ID
         */
        removeAllFeature:function(layerId) {
            let source = this.getLayerById(layerId).getSource();
            if (source != null) {
                source.clear();
            }
        },
        // 绘制规划路线
        storkeLine(tracks) {
            
        },
        /**
         * 添加wms图层
         * 
         * @param {String} id 图层id
         * @param {String} url wms图层的地址
         * @param {String} layers wms图层的名称
         * @param {String} styles wms图层的样式，默认为空
         * @param {number} opacity wms图层的透明度，取值0~1,1不透明，0透明
         * @param {boolean} visble  wms是否可见，默认true
         * @param {String} version  wms是版本号
         */
        addWms:function(id,url,layers,styles,opacity,visble,version){
            mapInit.addWms(id,url,layers,styles,opacity,visble,version,this.$data.map)
        },
        // 规划路线
        translateCallback(data,color){

        },
        pageResize(){
            const borwserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            this.pageHeight = borwserHeight - 64;         
        },
        resize:function(size)
        {
            this.$data.map.setSize(size);
        }
    },
    created(){
    },
    mounted(){
        this.pageResize();
        window.onresize = () => {
            // this.pageResize();
        }
        //初始化地图
        setTimeout(() => {
            this.initMap();
            this.$emit("MapInitComplete",this);

            
        }, 100);
    },
    destroyed(){

    }
}
</script>
<style scoped>

    #map {
        width: 100%;
        height: 100%;
        overflow: hidden;
        margin:0;
        font-family:"微软雅黑";

        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    .map:-moz-full-screen {
        height: 100%;
    }
    .map:-webkit-full-screen {
        height: 100%;
    }
    .map:-ms-fullscreen {
        height: 100%;
    }
    .map:fullscreen {
        height: 100%;
    }
    .ol-rotate {
        top: 3em;
    }

    .ol-popup {
        position: absolute;

        /* background-color: white; */
        background-color: #333333;
        color: #fff;

        -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        /* padding: 15px; */
        /* border-radius: 10px; */
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
    }
    .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }
    .ol-popup:after {
        /* border-top-color: white; */
        border-top-color: #413d3d;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
    }
    .ol-popup:before {
        /* border-top-color: #cccccc; */
        border-top-color: #413d3d;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
    }
    .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 10px;
        right: 10px;
        /* top: 18px;
        right: 18px; */
        font-size: 16px;
        color: #fff;
        /* color: #F59307; */
        cursor: pointer;
        z-index: 9999;
    }
    .ol-popup-closer:hover{
        color: rgb(224, 217, 205);
        /* color: rgb(238, 195, 131); */
    }
    .ol-popup-closer:after {
        content: "✖";
    }
   

    .yk-pointer-normal{
        cursor: default;
        z-index: 3;
    }

    .yk-close-btn{
        top: 13px;
        right: 10px;
        position: absolute;
        width: 12px;
        cursor: pointer;
        z-index: 2001;
    }
    .yk-close-btn:hover{
        opacity: 0.6;
    }

    .yk-unit{
        width: 30px;
        display: inline-block;
        text-align: center;
    }

    .el-textarea__inner{
        border: 0px!important;
        background: rgb(102, 102, 102)!important;
        border: 0px!important;
        border-radius: 0px!important;
        color: #fff!important;

    }

    .el-select-dropdown__list{
        padding: 0px!important;
        height: 28px!important;
        line-height: 28px!important;
    }

    .yk-btn-tooltip {
        position: absolute;
        right: 50px;
        top: 0;
        &:hover {
            opacity: 1 !important;
        }
    }

</style>
<style lang="scss">
.path-view-popover {
    max-width: 256px;
    border: none;
    color: #999;
    // max-height: 200px;
    // overflow-y: auto;
}
.demo-ruleForm {
    .el-form-item__content {
        width: 240px;
        .el-input__inner {
            box-sizing: border-box;
            width: 100%;
        }
        .el-date-editor.el-input, .el-date-editor.el-input__inner {
            width: 100%;
        }
        &.el-form--inline {
            .el-input__inner {
                box-sizing: border-box;
                width: 100%;
            }
            .el-date-editor.el-input, .el-date-editor.el-input__inner {
                width: 100%;
            }
            // .el-date-editor--datetimerange.el-input, .el-date-editor--datetimerange.el-input__inner {
            //  width: 350px;
            // }
        }
    }
    .el-input-number {
        .el-input-number__increase, .el-input-number__decrease {
            border-radius: 0!important;
        }
    }
}
</style>