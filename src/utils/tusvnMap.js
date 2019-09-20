export function getMap(map){
   // map.addShape("road_boundary","./static/map3d/dl_shcsq_zc/road_boundary.shp","#ffca08")
   
    map.addShape("lane_marking","./static/map3d/dl_shcsq_zc/Lane_marking.shp",dl.styles.lane_marking.color)
    //路标志
    map.addShape("lane_arrow","./static/map3d/dl_shcsq_zc/Direction_arrow.shp","#f3f3f3")
    map.addShape("lane_boundary","./static/map3d/dl_shcsq_zc/Lane_boundary.shp","#7c7c7c")
    map.addShape("lane_centerline","./static/map3d/dl_shcsq_zc/Lane_centerline.shp","#153641")
   
    // //斑马线
    map.addShape("Crosswalk","./static/map3d/dl_shcsq_zc/Crosswalk.shp","#f3f3f3")
    

    //画圆  326279.672803747 3462360.84818288   600m
    let circle = new dl.Circle({
          redius: 17000,
          center: [692384,3122050,13.618],
          color: "#000",
          outline: false,
          outlineColor: "#ff0000",
          opacity: 1,
          rotate: [0, 0, 0]
    }); 
    circle.setOpacity(0.1);
    map.addGeometry(circle);

}
