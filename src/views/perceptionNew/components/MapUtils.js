import _ from 'lodash';
import WKT from 'ol/format/WKT.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString.js';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Overlay from 'ol/Overlay.js';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Circle as CircleStyle, RegularShape, Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { Image as ImageLayer } from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';

import { transform } from 'ol/proj.js';

/**
 * 生成矢量图层
 * @param {string} id 图层id
 */
export function generateVectorLayer(id) {
    
    let source = new VectorSource({
        wrapX: false
    });
    let vector = new VectorLayer({
        source: source,
        style: new Style({
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.2)'
            }),
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new CircleStyle({
                radius: 3,
                fill: new Fill({
                    color: '#ff0000'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 1
                })
            })
        })
    });
    vector.set("id", id);
    return vector;
}
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
export function addWms(id, url, layers, styles, opacity, visble, version, map) {
    let wmsLayer = new ImageLayer({
        // extent: [121.22163118200001, 31.32581748800004, 121.2364790110001, 31.32988410000008],
        source: new ImageWMS({
            wrapX: false,
            url: url,
            // params: {'LAYERS': 'shanghai_qcc:roadcenter_route',VERSION:'1.1.0'},
            params: { 'LAYERS': layers, STYLES: styles || "", VERSION: version || '1.1.0' },
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0
        }),
        opacity: opacity || 0,
        visible: visble || true
    });
    wmsLayer.set("id", id);
    map.addLayer(wmsLayer);
}
/**
 * 向地图中添加覆盖物
 * 
 * @param {any} id 
 * @param {Document} dom 
 * @param {Number} lon 
 * @param {Number} lat 
 * @param {String} className  样式
 * @param {Array.<Number>} offset  位置偏移
 * @param {module:ol/Map} map Openlayers的Map对象
 */
export function addOverlay(id, dom, lon, lat, className, offset, map) {
    let marker = new Overlay({
        id: id,
        position: [lon, lat],
        positioning: 'center-center',
        element: dom,
        offset: offset || [0, 0],
        stopEvent: false,
        className: className
    });
    let overLay = map.getOverlayById(id);
    if (overLay != null) {
        map.removeOverlay(overLay);
    }
    map.addOverlay(marker);
}
/**
 * 清除地图中的覆盖物
 * 
 * @param {module:ol/Map} map Openlayers的Map对象
 */
export function clearOverlays(map) {
    let overLays = map.getOverlays();
    if (overLays != null) {
        overLays.forEach(overLay => {
            let element = overLay.getElement();
            map.removeOverlay(overLay);
            element.parentNode.removeChild(element);
        });
    }
}
/**
 * 根据id移除覆盖物
 * 
 * @param {String} id 
 * @param {module:ol/Map} map Openlayers的Map对象
 */
export function removeOverlayById(id, map) {
    let overLay = map.getOverlayById(id);
    if (overLay != null) {
        let element = overLay.getElement();
        map.removeOverlay(overLay);
        element.parentNode.removeChild(element);
    }
}
/**
 * 重新设置覆盖物的位置
 * @param {String} id 
 * @param {Number} lon 
 * @param {Number} lat 
 * @param {module:ol/Map} map Openlayers的Map对象
 */
export function setOverlayPosition(id, lon, lat, map) {
    let overLay = map.getOverlayById(id);
    if (overLay != null) {
        overLay.setPosition([lon, lat]);
    } else {
        console.log("不存在id为" + id + "的覆盖物");
    }
}
/**
 * 添加图层，相同id的图层会先移除掉
 * 
 * @param {module:ol/Map} map Openlayers的Map对象
 * @param {Array} layers 图层数组，layer必须调用layer.set('id',id)赋唯一标识，否则可能重复添加
 */
export function addLayers(map, layers) {
    if (map != null) {
        if (layers != null) {
            for (let n = 0; n < layers.length; n++) {
                let layer = layers[n];
                removeLayerByAttr(map, "id", layer.get("id"));
                map.addLayer(layer);
            }
        } else {
            console.log("没有可添加的图层");
        }
    }
}
/**
 * 根据属性名称和值移除对应的图层
 * 
 * @param {module:ol/Map} map Openlayers的Map对象
 * @param {string} attrName 属性名称
 * @param {*} attrValue 属性值
 */
export function removeLayerByAttr(map, attrName, attrValue) {
    if (!_.isEmpty(map)) {
        var layers = map.getLayers();
        var m = layers.getLength();
        for (let i = 0; i < m; i++) {
            var layer = layers.item(i);
            var value = layer.get(attrName);
            if (attrValue == value) {
                map.removeLayer(layer);
            }
        }
    } else {
        console.log("map为null");
    }
}
/**
 * 根据属性获取图层
 * @param {module:ol/Map} map 地图
 * @param {string} attrName 
 * @param {string} attrValue 
 */
export function getLayerByAttr(map, attrName, attrValue) {
    if (!_.isEmpty(map)) {
        var layers = map.getLayers();
        var m = layers.getLength();
        for (let i = 0; i < m; i++) {
            var layer = layers.item(i);
            var value = layer.get(attrName);
            if (attrValue == value) {
                return layer;
            }
        }
    } else {
        console.log("map为null");
    }
    return null;
}
/**
 * 添加图层
 * @param {module:ol/Map} map Openlayers的Map对象
 * @param {module:ol/Layer} layer Openlayers的Layer对象
 */
export function addLayer(map, layer) {
    if (!_.isEmpty(map)) {
        removeLayerByAttr(map, "id", layer.get("id"));
        map.addLayer(layer);
    } else {
        console.log("map为null");
    }
}
/**
 * 向地图中添加面要素
 *  @param {Array.<Array.<Array.<module:ol/coordinate~Coordinate>>>} coords 数组型的值
 *  @param {any} id 唯一标识
 *  @param {module:ol/Style} style Openlayers的Style对象
 *  @param {module:ol/Layer} layer Openlayers的Layer对象
 */
export function addMultiPolygon(coords, id, style, layer) {
    let multiPolygon = new MultiPolygon(coords);
    let multiPolygonFeature = new Feature(multiPolygon);
    multiPolygonFeature.setId(id);
    multiPolygonFeature.setStyle(style);

    //判断是否已经存在，如果存在先剔除
    let f = layer.getSource().getFeatureById(id);
    if (f != null) {
        layer.getSource().removeFeature(f);
    }

    layer.getSource().addFeature(multiPolygonFeature);
}
/**
 * 向地图中添加点要素
 *  @param {number} lon 浮点型的值
 *  @param {number} lat 浮点型的值
 *  @param {any} id 唯一标识
 *  @param {module:ol/Style} style Openlayers的Style对象
 *  @param {module:ol/Layer} layer Openlayers的Layer对象
 */
export function addPoint(lon, lat, id, style, layer) {
    let pointFeature = new Feature(new Point([lon, lat]));
    pointFeature.setId(id);
    pointFeature.setStyle(style);

    //判断是否已经存在，如果存在先剔除
    let f = layer.getSource().getFeatureById(id);
    if (f != null) {
        layer.getSource().removeFeature(f);
    }

    layer.getSource().addFeature(pointFeature);
}
/**
 * 向地图中添加圆
 *  @param {number} lon 浮点型的值
 *  @param {number} lat 浮点型的值
 *  @param {number} radius 半径
 *  @param {any} id 唯一标识
 *  @param {module:ol/Style} style Openlayers的Style对象
 *  @param {module:ol/Layer} layer Openlayers的Layer对象
 */
export function addCircle(lon, lat, radius, id, style, layer) {
    
    //cjj-2019.6.18  添加坐标转换
    // var circleIn3857 = new Circle(proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'), radius,'XY');
    // var circleIn4326 = circleIn3857.transform('EPSG:3857','EPSG:4326');
    // let circleFeature = new Feature(circleIn4326);
    // radius = 1000;
    var circleIn3857 = new Circle(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'), radius,'XY');
    var circleIn4326 = circleIn3857.transform('EPSG:3857','EPSG:4326');
    let circleFeature = new Feature(circleIn4326);

    // let circleFeature = new Feature(new Circle([lon, lat], radius));
    circleFeature.setId(id);
    circleFeature.setStyle(style);

    //判断是否已经存在，如果存在先剔除
    let f = layer.getSource().getFeatureById(id);
    if (f != null) {
        layer.getSource().removeFeature(f);
    }

    layer.getSource().addFeature(circleFeature);
}
/**
 * 添加线条
 * @param {Array.<Array.<number>>||String} coordinates 坐标序列[[112,39],[113,40]] 或者wkt,MULTILINESTRING((125.389335725555 43.8583870585032,125.384612993563 43.871334125479,125.386970579559 43.8738060564743,125.388557423556 43.8754463874713))
 * @param {string} id 线条的ID
 * @param {module:ol/Style} style 线条的样式
 * @param {module:ol/Layer} layer 图层
 */
export function addLineString(coordinates, id, style, layer) {
    let lineStringFeature = null;
    if (typeof coordinates == 'string') {
        let format = new WKT();
        lineStringFeature = format.readFeature(coordinates, null);
    } else {
        lineStringFeature = new Feature(new LineString(coordinates));
    }

    lineStringFeature.setId(id);
    lineStringFeature.setStyle(style);
    //判断是否已经存在，如果存在先剔除
    // console.log("==============================");
    // console.log(layer.getSource());
    let f = layer.getSource().getFeatureById(id);
    if (f != null) {
        layer.getSource().removeFeature(f);
    }
    layer.getSource().addFeature(lineStringFeature);
}
/**
 * 添加箭头
 * @param {Array.<Array.<number>>} coordinates 坐标二维数组[[x1,y1],[x2,y2],[x3,y3]]
 * @param {*} id 箭头id
 * @param {module:ol/Style} style 箭头线的样式
 * @param {string} tailImgUrl 箭头尾的图片
 * @param {string} headImgUrl 箭头头的图片
 * @param {module:ol/Layer} layer 图层
 */
export function addArrow(coordinates, id, style, tailImgUrl, headImgUrl, layer) {
    if (coordinates == null || coordinates.length < 2) {
        console.log("坐标串不符合要求");
        return null;
    }
    //添加中间部分
    let lineStringFeature = new Feature(new LineString(coordinates));
    lineStringFeature.setId(id);
    lineStringFeature.setStyle(style);

    //判断是否已经存在，如果存在先剔除
    let f = layer.getSource().getFeatureById(id);
    if (f != null) {
        layer.getSource().removeFeature(f);
    }
    layer.getSource().addFeature(lineStringFeature);

    //添加尾巴
    let tailFeature = new Feature(new Point(coordinates[0]));
    let tailId = id + "_tail";
    tailFeature.setId(tailId);
    let tailStyle = new Style({
        image: new Icon({
            src: tailImgUrl || '@/assets/images/geolocation_marker.png',
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: 0
        })
    });
    tailFeature.setStyle(tailStyle);
    let tail = layer.getSource().getFeatureById(tailId);
    if (tail != null) {
        layer.getSource().removeFeature(tail);
    }
    layer.getSource().addFeature(tailFeature);

    //添加头部
    let headFeature = new Feature(new Point(coordinates[coordinates.length - 1]));
    let headId = id + "_head";
    headFeature.setId(headId);


    let dx0 = coordinates[coordinates.length - 1][0] - coordinates[coordinates.length - 2][0];
    let dy0 = coordinates[coordinates.length - 1][1] - coordinates[coordinates.length - 2][1];
    let rotation0 = Math.atan2(dy0, dx0);

    let headStyle = new Style({
        image: new Icon({
            src: headImgUrl || '@/assets/images/geolocation_marker_heading.png',
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: (Math.PI / 2 - rotation0)
        })
    });
    headFeature.setStyle(headStyle);
    let head = layer.getSource().getFeatureById(headId);
    if (head != null) {
        layer.getSource().removeFeature(head);
    }
    layer.getSource().addFeature(headFeature);
}

/**
 * 移除箭头
 * @param {*} id 箭头id
 * @param {*} layer 箭头所在的图层
 */
export function removeArrow(id, layer) {
    let source = layer.getSource();
    let tail = source.getFeatureById(id + "_tail");
    if (tail != null) {
        source.removeFeature(tail);
    }
    let head = source.getFeatureById(id + "_head");
    if (head != null) {
        source.removeFeature(head);
    }
    let line = source.getFeatureById(id);
    if (line != null) {
        source.removeFeature(line);
    }
}

/**
 * 移除地图上的要素
 * @param {*} id 要素id
 * @param {*} layer 要素所在的图层
 */
export function removeFeature(id, layer) {
    let source = layer.getSource();
    let f = source.getFeatureById(id);
    if (f != null) {
        source.removeFeature(f);
    }
}
/**
 * 移除所有要素
 * @param {*} layer 要素所在的图层
 */
export function removeAllFeature(layer) {
    let source = layer.getSource();
    if (source != null) {
        source.clear();
    }
}


// /**
//  * 生成ICON:ol/style/Icon
//  * @param {string} src 图片的路径
//  * @param {module:ol/size~Size} size 图片大小，默认值[22,22]
//  * @param {number} rotation  图片旋转角度，单位是弧度，顺时针为正,例如：顺时针旋转90度，Math.PI/2
//  * @param {boolean} rotateWithView 是否跟view一起旋转图片，默认值是false
//  * @param {number} opacity 0-1之间的值
//  * @param {Array.<number>} offset 位置偏移，默认值是[0,0]
//  * @param {number} scale 图片缩放，默认为1
//  */
// export function generateIcon(src, size, rotation, rotateWithView, opacity, offset, scale) {
//     console.log(src);
//     let icon = new Icon({
//         src: src || "@/assets/images/geolocation_marker.png",
//         size: size || [22, 22],
//         rotation: rotation || 0,
//         rotateWithView: rotateWithView || false,
//         opacity: opacity || 1,
//         offset: offset || [0, 0],
//         scale: scale || 1
//     });
//     return icon;
// }
/**
* 生成ICON:ol/style/Icon
* @param {string} src 图片的路径
* @param {module:ol/size~Size} size 图片大小，默认值[22,22]
* @param {number} rotation 图片旋转角度，单位是弧度，顺时针为正,例如：顺时针旋转90度，Math.PI/2
* @param {boolean} rotateWithView 是否跟view一起旋转图片，默认值是false
* @param {number} opacity 0-1之间的值
* @param {Array.<number>} offset 位置偏移，默认值是[0,0]
* @param {number} scale 图片缩放，默认为1
* @param {Array.<number>} anchor Anchor. Default value is the icon center.
*/
export function generateIcon(src, size, rotation, rotateWithView, opacity, offset, scale,anchor) {
    // console.log(src);
    let icon = new Icon({
    src: src || "@/assets/images/geolocation_marker.png",
    size: size || [22, 22],
    rotation: rotation || 0,
    rotateWithView: rotateWithView || false,
    opacity: opacity || 1,
    offset: offset || [0, 0],
    scale: scale || 1,
    anchor:anchor||[0.5,0.5]
    });
    return icon;
    }

/**
 * 生成ICON:ol/style/Text
 * @param {string} text 显示的文字
 * @param {string} font 字体，默认值：'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"'
 * @param {string} placement 位置，默认值：line
 * @param {number} offsetX  x方向上的偏移，单位像素，默认值：0
 * @param {number} offsetY  y方向上的偏移，单位像素，默认值：0
 * @param {string} fillColor 文字颜色，默认值：white
 * @param {module:ol/style/Stroke~Stroke} stroke 绘制的线条的样式
 * @param {string} backgroundFillColor 文字颜色，默认值：black
 * @param {module:ol/style/Stroke~Stroke} backgroundStroke 背景边框绘制的线条的样式
 * @param {Array.<number>} padding 位置偏移，默认值是[0, 0, 0, 0]
 */
export function generateText(text, font, placement, offsetX, offsetY, fillColor, stroke, backgroundFillColor, backgroundStroke, padding) {
    console.log(text);
    let textStyle = new Text({
        text: text,
        font: font || 'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"',
        placement: placement || 'line',
        offsetX: offsetX,
        offsetY: offsetY,
        fill: new Fill({
            color: fillColor || 'white'
        }),
        backgroundFill: new Fill({
            color: backgroundFillColor || 'black'
        }),
        stroke: stroke,
        backgroundStroke: backgroundStroke,
        padding: padding || [0, 0, 0, 0]
    });
    return textStyle;
}

/**
 * 生成规则多边形样式
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
export function generateRegularShape(fill, points, radius, radius1, radius2, angle, stroke, rotation, rotateWithView) {
    let regularShape = new RegularShape({
        fill: fill,
        points: points,
        radius: radius || 5,
        radius1: radius1,
        radius2: radius2,
        angle: angle || 0,
        stroke: stroke,
        rotation: rotation || 0,
        rotateWithView: rotateWithView || false
    });
    return regularShape;
}


/**
 * 生成填充样式
 * @param {	module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE' [red, green, blue, alpha]
 */
export function generateFill(color) {
    let fill = new Fill({
        color: color || 'red'
    });
    return fill;
}


/**
 * 生成线的样式
 * @param {module:ol/color~Color | module:ol/colorlike~ColorLike} color 颜色值，'black'、'red'、'green'、'white'、'#4271AE'
 * @param {string} lineCap 线端点的样式。butt, round, or square.
 * @param {string} lineJoin 线连接处的样式。bevel, round, or miter.
 * @param {Array.<number>} lineDash 虚线设置。[5,5]
 * @param {number} lineDashOffset 默认值是0。
 * @param {number} miterLimit 默认值10
 * @param {number} width 线宽度
 */
export function generateStroke(color, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, width) {
    let stroke = new Stroke({
        color: color || 'red',
        lineCap: lineCap || 'round',
        lineJoin: lineJoin || 'round',
        lineDash: lineDash,
        lineDashOffset: lineDashOffset || 0,
        miterLimit: miterLimit || 10,
        width: width
    });
    return stroke;
}