export function getMap(map){
  map.addShape("road_boundary","./static/map3d/dl_shcsq_zc/road_boundary.shp","#ffffff",3,null,null,null,null,21.5)
  map.addShape("intersection","./static/map3d/dl_shcsq_zc/Intersection.shp","#351906")
  map.addShape("Crosswalk","./static/map3d/dl_shcsq_zc/Crosswalk.shp","#023c2d")
  map.addShape("lane_marking","./static/map3d/dl_shcsq_zc/Lane_marking.shp",dl.styles.lane_marking.color)
  map.addShape("lane_arrow","./static/map3d/dl_shcsq_zc/Direction_arrow.shp","#06c2ff")
  map.addShape("lane_boundary","./static/map3d/dl_shcsq_zc/Lane_boundary.shp","#fefefe")
  map.addShape("lane_centerline","./static/map3d/dl_shcsq_zc/Lane_centerline.shp","#153641")
  // map.addShape("greenbelts","./static/map3d/dl_shcsq_zc/greenbelts.shp","#73b273")
  // map.addShape("rcu_view","./static/map3d/dl_shcsq_zc/dl_shcsq_utm51_view.shp","rgba(182,255,0)")
  // debugger
  let area01 = new dl.Polygon({
    name:"弱视区01",
    color:"#ff0000",
    outline:false,
    outlineColor:"#ff0000",
    opacity:0.5,
    rotate:[0,0,0],
    vertices:[[326168.532791608,3462492.24786985,19.9],[326151.767751046,3462470.35067401,19.9],[326138.199775331,3462479.39599115,19.9],[326102.836848233,3462499.64194178,19.9],[326115.524310626,3462522.04746048,19.9],[326154.666481843,3462500.72172581,19.9],[326168.532791608,3462492.24786985]]
  });
  area01.updateVertices();
  area01.setOpacity(1);

  let area02 = new dl.Polygon({
    name:"弱视区02",
    color:"#ff0000",
    outline:false,
    outlineColor:"#ff0000",
    opacity:0.5,
    rotate:[0,0,0],
    vertices:[[326348.445197248,3462137.47069069,19.9],[326373.598831103,3462150.74621967,19.9],[326375.48231671,3462146.28261679,19.9],[326387.899833096,3462126.03666616,19.9],[326413.544703893,3462088.784117,19.9],[326392.488915239,3462073.39719453,19.9],[326365.764260409,3462111.72952772,19.9],[326348.48771587,3462137.37439851,19.9],[326348.445197248,3462137.47069069]]
  });
  area02.updateVertices();
  area02.setOpacity(1);

  let area03 = new dl.Polygon({
    name:"强视区01",
    color:"#adaf20",
    outline:false,
    outlineColor:"#f2abf2",
    opacity:0.5,
    rotate:[0,0,0],
    vertices:[[326335.2764,3462300.798,19.8],[326338.8912,3462300.075,19.8],[326342.1256,3462300.3238,19.8],[326342.468156596,3462300.32074875,19.8],[326342.805166426,3462300.25927757,19.8],[326343.126740243,3462300.14119026,19.8],[326343.423441758,3462299.969952,19.8],[326343.686564535,3462299.7505876,19.8],[326343.908387477,3462299.48953413,19.8],[326344.082401391,3462299.19445196,19.8],[326344.2035,3462298.874,19.8],[326351.762,3462272.1494,19.8],[326351.827136102,3462271.80810452,19.8],[326351.832228108,3462271.46068634,19.8],[326351.777122372,3462271.11762851,19.8],[326351.663481661,3462270.7892825,19.8],[326351.494734984,3462270.48555585,19.8],[326351.275974125,3462270.21561326,19.8],[326351.0138,3462269.9876,19.8],[326348.2255,3462267.9597,19.8],[326346.5548,3462266.0502,19.8],[326344.7218,3462263.4318,19.8],[326343.387,3462261.5631,19.8],[326341.4358,3462258.6364,19.8],[326340.7697,3462255.9723,19.8],[326340.7697,3462253.5187,19.8],[326340.7614,3462253.3376,19.8],[326340.508,3462250.5493,19.8],[326340.7451,3462247.9401,19.8],[326347.697,3462222.8065,19.8],[326357.9141,3462194.0373,19.8],[326377.2671,3462147.2677,19.8],[326390.1135,3462126.66,19.8],[326415.1917,3462090.2562,19.8],[326415.360144475,3462089.96067839,19.8],[326415.476077222,3462089.64088758,19.8],[326415.536145226,3462089.30607659,19.8],[326415.538611193,3462088.96592885,19.8],[326415.483403804,3462088.63028215,19.8],[326415.372119771,3462088.30884408,19.8],[326415.20797766,3462088.01091132,19.8],[326414.995724804,3462087.74510069,19.8],[326414.7415,3462087.5191,19.8],[326393.4157,3462071.5923,19.8],[326393.145094444,3462071.42208824,19.8],[326392.85082555,3462071.29716736,19.8],[326392.540411952,3462071.22072911,19.8],[326392.221784782,3462071.1947265,19.8],[326391.903085035,3462071.21982391,19.8],[326391.592455558,3462071.29538009,19.8],[326391.297832999,3462071.41946456,19.8],[326391.02674503,3462071.58890695,19.8],[326390.786118007,3462071.79937795,19.8],[326390.5821,3462072.0455,19.8],[326363.8575,3462110.1079,19.8],[326363.8302,3462110.1477,19.8],[326346.5537,3462136.0625,19.8],[326346.4857,3462136.1719,19.8],[326346.3844,3462136.3728,19.8],[326337.2109,3462157.4179,19.8],[326324.5296,3462185.4785,19.8],[326324.4728,3462185.6181,19.8],[326324.3824,3462185.9557,19.8],[326319.0007,3462216.6312,19.8],[326311.7537,3462242.3983,19.8],[326300.1655,3462276.6238,19.8],[326292.3775,3462298.9137,19.8],[326288.9178,3462306.0994,19.8],[326281.3623,3462321.75,19.8],[326266.2726,3462352.1987,19.8],[326265.0349,3462354.4266,19.8],[326245.981,3462377.506,19.8],[326209.6254,3462422.2098,19.8],[326193.3327,3462437.167,19.8],[326160.5049,3462462.1914,19.8],[326137.4155,3462478.3002,19.8],[326119.7126,3462487.9563,19.8],[326101.6409,3462497.3968,19.8],[326101.362615916,3462497.57338929,19.8],[326101.117002066,3462497.79316109,19.8],[326100.910688164,3462498.05018323,19.8],[326100.74924312,3462498.33751807,19.8],[326100.637024728,3462498.64740973,19.8],[326100.577062034,3462498.97149349,19.8],[326100.570973577,3462499.30102154,19.8],[326100.618923698,3462499.62709913,19.8],[326100.719618107,3462499.94092463,19.8],[326100.87033882,3462500.23402713,19.8],[326101.067017518,3462500.49849508,19.8],[326101.304345367,3462500.72718986,19.8],[326101.575916314,3462500.91393843,19.8],[326101.8744,3462501.0537,19.8],[326114.0531,3462523.0988,19.8],[326114.228909825,3462523.3596829,19.8],[326114.443456494,3462523.58976704,19.8],[326114.691430789,3462523.78335871,19.8],[326114.966696288,3462523.93566724,19.8],[326115.262441214,3462524.04292358,19.8],[326115.571347002,3462524.10247354,19.8],[326115.885769406,3462524.11284349,19.8],[326116.197927664,3462524.07377681,19.8],[326116.500097044,3462523.98624024,19.8],[326116.7848,3462523.8524,19.8],[326174.558,3462490.9163,19.8],[326174.7651,3462490.7797,19.8],[326203.1095,3462469.454,19.8],[326203.1926,3462469.3879,19.8],[326203.2346,3462469.3516,19.8],[326224.8303,3462450.1855,19.8],[326224.9926,3462450.0239,19.8],[326273.5829,3462395.7647,19.8],[326273.6251,3462395.7161,19.8],[326273.7348,3462395.5726,19.8],[326291.0114,3462370.7376,19.8],[326291.157403861,3462370.49190021,19.8],[326291.2669,3462370.2279,19.8],[326292.5653,3462366.3327,19.8],[326309.7669,3462333.5419,19.8],[326309.8088,3462333.4573,19.8],[326318.9483,3462313.8342,19.8],[326320.7725,3462310.7073,19.8],[326322.473,3462308.035,19.8],[326326.9143,3462304.3339,19.8],[326329.8568,3462302.8626,19.8],[326335.2764,3462300.798]]
  });
  area03.updateVertices();
  area03.setOpacity(0.6);

  // let area04 = new dl.Polygon({
  //   name:"强视区02",
  //   color:"#ff0000",
  //   outline:false,
  //   outlineColor:"#ff0000",
  //   opacity:0.5,
  //   rotate:[0,0,0],
  //   vertices:[[326308.053882088,3462332.29714815,13.618],[326283.279238006,3462322.19170122,13.618],[326267.784275133,3462353.30569277,13.618],[326289.870646913,3462365.57589931,13.618],[326308.053882088,3462332.29714815]]
  // });
  // area04.updateVertices();
  // area04.setOpacity(0.3);
  // debugger
  map.addGeometry(area03);
  // map.addGeometry(area01);
  // map.addGeometry(area02);
 
  // map.addGeometry(area04);


  //画圆  326279.672803747 3462360.84818288   600m
  let circle = new dl.Circle({
    redius:600.0,
    center:[326279.672803747,3462360.84818288,13.618],
    color:"#000000",
    outline:false,
    outlineColor:"#ff0000",
    opacity:0.5,
    rotate:[0,0,0]
  });
  // circle.updateVertices();
  // circle.setRotate([Math.PI/2,0,0]);
  circle.setOpacity(0.1);
  map.addGeometry(circle);

  // //添加测试模型
  // map.addStaticModel('street_lamp_two_opposite_0--2-','./static/map3d/models/3k7yjemk5hj4-Camera/Camera 3D Moldel/Camera.3ds/camera.3ds',326306.01741457346,3462292.4254359356,20.5);
  // map.addStaticModel('street_lamp_two_opposite_1-33','./static/map3d/models/8i54m1ynwow0-CameraV2/camera.3ds',326327.67026755644,3462291.9483077712,20.5);
  // map.addStaticModel('street_lamp_two_opposite_2-4','./static/map3d/models/icgvzl8hyw3k-cctv-camera/camera.obj',326334.33667123236,3462268.758218471,20.5);
  // map.addStaticModel('street_lamp_two_opposite_3-78','./static/map3d/models/model/camera.obj',326317.32345508446,3462265.5895430204,20.5);
  // map.addStaticModel('street_lamp_two_opposite_3-78','./static/map3d/models/poleWith2Camera1.3ds',326320.4451977463,3462281.583116995,20);
  map.addStaticModel('street_lamp_two_opposite_3-78','./static/map3d/models/poleWith2Camera3.3ds',326277.821,3462359.693,20,0,0,(Math.PI/180.0)*210);

  //添加路灯杆和信息牌
  let data = [[2340,5,326263.1536280000,3462381.9079600000,19.4429998472],
    [2341,7,326254.1579710000,3462374.1136300000,18.6064369752],
    [2310,5,325366.1640860000,3462375.5551000000,16.9854993298],
    [2311,5,325375.6322810000,3462365.8972400000,17.3424993529],
    [2309,5,325329.7795210000,3462372.5950000000,16.7029996886],
    [2312,5,325377.7216280000,3462362.6052700000,16.3709996119],
    [2523,5,326540.1035260000,3462363.0872000000,19.1509994255],
    [2471,7,326299.4905790000,3462347.9802100000,15.6145762711],
    [2506,5,326500.8533660000,3462359.4704400000,19.0839999359],
    [2342,5,326287.8751030000,3462342.0421700000,19.1744997575],
    [2308,5,325308.5112710000,3462347.9716100000,19.7079999521],
    [2507,5,326473.3538580000,3462339.2685300000,18.9909998815],
    [2522,5,326517.1527510000,3462340.1600800000,19.3185003014],
    [2343,8,326294.7772940000,3462330.1427300000,17.7579996064],
    [2470,7,326307.5496050000,3462331.0933600000,17.9360156565],
    [2508,5,326441.5722040000,3462325.8573400000,18.9874993305],
    [2469,7,326310.5414860000,3462326.8073000000,15.1468183308],
    [2509,5,326406.8918910000,3462316.2841900000,18.8305003982],
    [2468,7,326318.1477180000,3462318.9153800000,15.6234372168],
    [2345,7,326302.8019660000,3462311.6160300000,17.1534998491],
    [2377,7,326315.4915160000,3462314.8585500000,16.4422577827],
    [2344,5,326303.2004260000,3462310.4719800000,18.7549999728],
    [2510,7,326393.4147630000,3462310.6721400000,16.6629997234],
    [2518,5,326450.4556610000,3462302.2426000000,18.8659371476],
    [2511,5,326371.5602220000,3462307.0893100000,18.8180000823],
    [2513,5,326336.5736060000,3462299.8794100000,18.9999997954],
    [2516,7,326403.1004070000,3462301.2344800000,15.2130005996],
    [2621,5,325893.4301790000,3462712.3911500000,17.9645000380],
    [2622,7,325881.9157610000,3462720.0122700000,16.2179999138],
    [2619,5,325893.7957190000,3462700.3669200000,17.8984998046],
    [2604,5,325870.1127920000,3462710.7755200000,17.4060000877],
    [2323,5,325753.3076240000,3462507.1363400000,15.4780002012],
    [2325,5,325790.3096670000,3462511.7494100000,15.7654995694],
    [2335,5,326129.5281910000,3462500.2622900000,16.6540000811],
    [2322,5,325748.1849570000,3462503.9860600000,16.4209997430],
    [2530,5,326668.0999150000,3462497.1395800000,18.1504996033],
    [2321,5,325740.5371130000,3462498.9335900000,16.4354998841],
    [2500,5,326623.9477040000,3462488.0191700000,16.6110000576],
    [2336,8,326139.7540420000,3462494.2470600000,16.3974996283],
    [2362,5,326158.3472540000,3462482.7642300000,17.6300779357],
    [2320,5,325716.7577860000,3462487.6901400000,15.7585005238],
    [2529,5,326641.7346290000,3462469.5655200000,18.2370004864],
    [2319,5,325685.0348140000,3462471.3327200000,16.8685000315],
    [2501,5,326601.5145450000,3462464.5414100000,18.4665000926],
    [2502,7,326605.2458900000,3462464.5654400000,14.4230000045],
    [2318,5,325653.9995270000,3462455.2872000000,16.1075002029],
    [2337,5,326188.0216380000,3462460.6390400000,16.1784997954],
    [2527,5,326617.9151840000,3462444.7077100000,18.5114997537],
    [2317,8,325635.0679910000,3462445.6396800000,15.8879994526],
    [2355,5,325621.8202380000,3462439.4399300000,17.4543751254],
    [2528,8,326613.3499020000,3462443.8827100000,15.9574997635],
    [2338,5,326213.8384680000,3462437.8956300000,16.3219996765],
    [2517,7,326594.4268840000,3462438.7253800000,16.3851406168],
    [2503,5,326567.6985030000,3462429.1770100000,18.9240003865],
    [2339,7,326217.6761830000,3462433.0968700000,16.7242973670],
    [2526,5,326597.7272100000,3462423.4643000000,18.7680000873],
    [2316,5,325589.0662180000,3462425.3443400000,16.6010001376],
    [2380,7,326270.5094310000,3462408.5083900000,15.4859996347],
    [2315,5,325555.2024120000,3462412.6848400000,18.0684994533],
    [2504,5,326544.5211860000,3462404.7242900000,19.1220001023],
    [2525,5,326580.2832550000,3462405.2548200000,16.7564999373],
    [2524,7,326552.9974670000,3462395.0059700000,16.8435004712],
    [2378,7,326279.1663760000,3462397.2504000000,15.6684998779],
    [2605,8,325862.6445930000,3462690.0471800000,16.2084997993],
    [2620,7,325883.6466480000,3462693.7251900000,14.3770001094],
    [2618,5,325910.9279790000,3462667.1651400000,15.7714999850],
    [2606,5,325873.4509600000,3462679.4497600000,17.4854993920],
    [2607,5,325875.0640310000,3462648.1874300000,17.9335002403],
    [2617,5,325897.2424270000,3462649.8675600000,17.1479999580],
    [2626,7,325900.8776510000,3462621.0237000000,15.6389996224],
    [2608,7,325875.4335680000,3462628.5516400000,15.6600002747],
    [2382,7,325922.6961430000,3462573.0151800000,14.1834999828],
    [2616,5,325901.3423650000,3462617.1308200000,16.6289996738],
    [2473,5,326010.0801300000,3462557.0078500000,15.2706367283],
    [2474,7,325859.9124110000,3462558.0355700000,15.4981366305],
    [2358,5,325929.4912880000,3462550.3590900000,18.0655777230],
    [2475,7,325838.0134190000,3462552.4639400000,16.5320761411],
    [2356,6,325873.2881820000,3462546.3657700000,15.3720156326],
    [2331,6,325918.9280590000,3462549.8922500000,15.4140003099],
    [2329,5,325863.5314200000,3462544.8703900000,17.4959995224],
    [2332,5,326001.3766220000,3462545.0910200000,15.8219998255],
    [2360,7,325945.7312290000,3462540.1099300000,15.5775154605],
    [2328,6,325841.5388360000,3462540.5731900000,16.3820002749],
    [2327,5,325835.3087210000,3462538.7357800000,15.6364997699],
    [2359,7,325930.6742140000,3462539.5113200000,15.4957188144],
    [2333,5,326034.4271010000,3462538.1123500000,16.2010003700],
    [2357,8,325899.9932830000,3462538.1754900000,16.0500157251],
    [2334,5,326063.5826910000,3462529.4007800000,15.8705002441],
    [2326,5,325817.1164000000,3462533.5020300000,17.1524999216],
    [2498,7,326663.0596020000,3462524.9048000000,15.8485005836],
    [2381,5,325924.8955040000,3462527.4202100000,15.5279996901],
    [2324,5,325779.5040170000,3462518.7696300000,16.1665001884],
    [2330,5,325871.3498470000,3462521.9963900000,15.7399993911],
    [2499,5,326650.0327900000,3462515.2012900000,18.1705002043],
    [2361,5,326096.8493380000,3462516.3677000000,16.1155155673],
    [2347,5,326288.3403440000,3462294.9251700000,15.1189999282],
    [2346,5,326282.5573430000,3462297.4654200000,15.5270003303],
    [2520,7,326351.7690070000,3462287.9580700000,16.5801407139],
    [2515,5,326412.3754460000,3462291.3724000000,18.7434997599],
    [2519,5,326378.4445950000,3462282.6290200000,18.5971406441],
    [2521,6,326349.5187080000,3462287.3835400000,16.2006407123],
    [2514,5,326343.0413430000,3462269.6713600000,18.6034994762],
    [2512,7,326355.1411090000,3462276.4010700000,16.3629997711],
    [2365,5,326326.5685270000,3462239.1056200000,18.4285781457],
    [2348,6,326323.6759070000,3462248.8291000000,15.2025003209],
    [2364,7,326311.2888950000,3462227.3124900000,14.7371562048],
    [2363,7,326316.5964500000,3462234.5979600000,15.9805156066],
    [2376,7,326361.2266020000,3462176.2273500000,16.9480001240],
    [2349,5,326323.3715480000,3462210.6667300000,16.7739998176],
    [2351,5,326365.1922260000,3462139.5056400000,17.6955002769],
    [2350,5,326349.6818960000,3462171.7949700000,16.8354995623],
    [2263,5,326384.0445870000,3462107.9480800000,17.3804999962],
    [2375,7,326374.1489520000,3462125.2394200000,17.2827964931],
    [2264,5,326405.1584590000,3462078.9310000000,17.7760005369],
    [2467,8,326412.2193760000,3462086.8062400000,17.4625760524],
    [2266,5,326420.9119000000,3462060.6176900000,19.8356560245],
    [2366,8,326394.8039030000,3462075.3445000000,17.2918750271],
    [2267,5,326437.0693490000,3462043.6991700000,19.3565001860],
    [2265,5,326392.3453660000,3462052.8325500000,19.2069996371],
    [2269,5,326471.4280660000,3462011.4598400000,19.8630000725],
    [2268,5,326454.1323160000,3462027.3636300000,19.7159998789],
    [2368,7,326458.3552220000,3462006.5595700000,17.8343047276],
    [2367,7,326460.0598840000,3462007.0766000000,19.6528749838],
    [2369,5,326509.0940300000,3461974.5294200000,23.4246563091],
    [2374,5,326511.9093510000,3461977.0481500000,23.8534994184],
    [2270,5,326535.6022270000,3461950.0543600000,24.7054995670],
    [2466,5,326538.1755370000,3461952.9923100000,25.0653532653],
    [2314,5,325484.0280260000,3462392.4005300000,17.8214998617],
    [2379,5,326255.5865930000,3462393.0083600000,15.4934999256],
    [2505,5,326525.1224750000,3462384.5150900000,19.0854994099],
    [2472,7,326256.1536700000,3462392.2806400000,15.5915762691],
    [2313,5,325399.5044350000,3462378.4734600000,17.0019995756]]
  data.forEach((arr,index)=>{
    //信息牌
    if(arr[1]==3){
      map.addStaticModel('traffic_sign_stop_'+index,'./static/map3d/models/traffic_sign_stop.3ds',arr[2],arr[3],20);
    }
    //路杆灯
    if(arr[1]==5){
      map.addStaticModel('street_lamp_two_'+index,'./static/map3d/models/street_lamp_two.3ds',arr[2],arr[3],20);
    }
  })
  //添加路灯
  /*map.addStaticModel('street_lamp_two_0','./static/map3d/models/street_lamp_two.3ds',325605.9620401191,3462422.087016858,12.68);
  map.addStaticModel('street_lamp_two_1','./static/map3d/models/street_lamp_two.3ds',325644.5698510726,3462439.737268414,12.68);
  map.addStaticModel('street_lamp_two_2','./static/map3d/models/street_lamp_two.3ds',325678.213173572,3462456.845491925,12.68);
  map.addStaticModel('street_lamp_two_3','./static/map3d/models/street_lamp_two.3ds',325714.8015379905,3462475.9571395535,12.68);
  map.addStaticModel('street_lamp_two_4','./static/map3d/models/street_lamp_two.3ds',325751.7192636788,3462494.9147299756,12.68);
  map.addStaticModel('street_lamp_two_5','./static/map3d/models/street_lamp_two.3ds',325791.2291744284,3462513.0858777757,12.68);
  map.addStaticModel('street_lamp_two_6','./static/map3d/models/street_lamp_two.3ds',325839.45728057146,3462528.673690394,12.68);
  map.addStaticModel('street_lamp_two_7','./static/map3d/models/street_lamp_two.3ds',325871.50033267133,3462535.577747621,12.68);
  map.addStaticModel('street_lamp_two_8','./static/map3d/models/street_lamp_two.3ds',325927.26942355325,3462540.7501094346,12.68);
  map.addStaticModel('street_lamp_two_9','./static/map3d/models/street_lamp_two.3ds',325971.1791292096,3462539.308385897,12.68);
  map.addStaticModel('street_lamp_two_10','./static/map3d/models/street_lamp_two.3ds',326011.51930734934,3462530.549954456,12.68);
  map.addStaticModel('street_lamp_two_11','./static/map3d/models/street_lamp_two.3ds',326060.29745298775,3462517.6961886724,12.68);
  map.addStaticModel('street_lamp_two_12','./static/map3d/models/street_lamp_two.3ds',326110.0640013865,3462499.7403886765,12.68);
  map.addStaticModel('street_lamp_two_13','./static/map3d/models/street_lamp_two.3ds',326146.8028378673,3462478.6396884797,12.68);
  map.addStaticModel('street_lamp_two_14','./static/map3d/models/street_lamp_two.3ds',326184.09992171597,3462451.135337721,12.68);
  map.addStaticModel('street_lamp_two_15','./static/map3d/models/street_lamp_two.3ds',326213.6642104323,3462424.026798547,12.68);
  map.addStaticModel('street_lamp_two_16','./static/map3d/models/street_lamp_two.3ds',326239.9417744168,3462394.325700396,12.68);
  map.addStaticModel('street_lamp_two_17','./static/map3d/models/street_lamp_two.3ds',326261.54341858963,3462364.523596104,12.68);
  map.addStaticModel('street_lamp_two_18','./static/map3d/models/street_lamp_two.3ds',326283.7656650753,3462325.9076287984,12.68);
  map.addStaticModel('street_lamp_two_19','./static/map3d/models/street_lamp_two.3ds',326293.7409365265,3462305.101613318,12.68);
  map.addStaticModel('street_lamp_two_20','./static/map3d/models/street_lamp_two.3ds',326317.89209304436,3462233.2914442807,12.68);
  map.addStaticModel('street_lamp_two_21','./static/map3d/models/street_lamp_two.3ds',326338.3463113972,3462166.509419441,12.68);
  map.addStaticModel('street_lamp_two_22','./static/map3d/models/street_lamp_two.3ds',326360.74210184,3462124.440723257,12.68);
  map.addStaticModel('street_lamp_two_23','./static/map3d/models/street_lamp_two.3ds',326381.50148141605,3462094.623117925,12.68);
  map.addStaticModel('street_lamp_two_24','./static/map3d/models/street_lamp_two.3ds',326404.88685793115,3462064.49447238,12.68)



  map.addStaticModel('street_lamp_two_opposite_0','./static/map3d/models/street_lamp_two.3ds',326539.9124336911,3461961.7054950483,12.68);
  map.addStaticModel('street_lamp_two_opposite_1','./static/map3d/models/street_lamp_two.3ds',326513.87203228497,3461985.7805497725,12.68);
  map.addStaticModel('street_lamp_two_opposite_2','./static/map3d/models/street_lamp_two.3ds',326481.66853339976,3462015.608493991,12.68);
  map.addStaticModel('street_lamp_two_opposite_3','./static/map3d/models/street_lamp_two.3ds',326437.26901612466,3462057.088796324,12.68);
  map.addStaticModel('street_lamp_two_opposite_4','./static/map3d/models/street_lamp_two.3ds',326407.9536514446,3462091.627984262,12.68);
  map.addStaticModel('street_lamp_two_opposite_5','./static/map3d/models/street_lamp_two.3ds',326376.1808195288,3462139.740524388,12.68);
  map.addStaticModel('street_lamp_two_opposite_6','./static/map3d/models/street_lamp_two.3ds',326350.5054369998,3462201.284972825,12.68);
  map.addStaticModel('street_lamp_two_opposite_7','./static/map3d/models/street_lamp_two.3ds',326336.9131020676,3462244.3383032307,12.68);
  map.addStaticModel('street_lamp_two_opposite_8','./static/map3d/models/street_lamp_two.3ds',326348.00984258053,3462274.3429545504,12.68);
  map.addStaticModel('street_lamp_two_opposite_9','./static/map3d/models/street_lamp_two.3ds',326342.11978901166,3462296.5981887174,12.68);
  map.addStaticModel('street_lamp_two_opposite_10','./static/map3d/models/street_lamp_two.3ds',326312.36564479594,3462319.9917033706,12.68);
  map.addStaticModel('street_lamp_two_opposite_11','./static/map3d/models/street_lamp_two.3ds',326293.32005615474,3462357.6330448994,12.68);
  map.addStaticModel('street_lamp_two_opposite_12','./static/map3d/models/street_lamp_two.3ds',326269.8965779829,3462393.1162129235,12.68);
  // this.addStaticModel('street_lamp_two_opposite_13','./static/map3d/models/street_lamp_two.3ds',326269.5184563148,3462393.419889987,12.68);
  map.addStaticModel('street_lamp_two_opposite_14','./static/map3d/models/street_lamp_two.3ds',326254.2686340613,3462413.4506998067,12.68);
  map.addStaticModel('street_lamp_two_opposite_15','./static/map3d/models/street_lamp_two.3ds',326225.2493836086,3462442.6320404094,12.68);
  map.addStaticModel('street_lamp_two_opposite_16','./static/map3d/models/street_lamp_two.3ds',326183.79399392195,3462476.6293645953,12.68);
  map.addStaticModel('street_lamp_two_opposite_17','./static/map3d/models/street_lamp_two.3ds',326152.984818381,3462497.958909394,12.68);
  map.addStaticModel('street_lamp_two_opposite_18','./static/map3d/models/street_lamp_two.3ds',326109.57493707456,3462521.876607037,12.68);
  map.addStaticModel('street_lamp_two_opposite_19','./static/map3d/models/street_lamp_two.3ds',326064.91023163777,3462539.4207325154,12.68);
  map.addStaticModel('street_lamp_two_opposite_20','./static/map3d/models/street_lamp_two.3ds',326018.01353881694,3462553.284279363,12.68);
  map.addStaticModel('street_lamp_two_opposite_21','./static/map3d/models/street_lamp_two.3ds',325971.39649421745,3462560.897562495,12.68);
  map.addStaticModel('street_lamp_two_opposite_22','./static/map3d/models/street_lamp_two.3ds',325938.60034148674,3462562.482200762,12.68);
  map.addStaticModel('street_lamp_two_opposite_23','./static/map3d/models/street_lamp_two.3ds',325904.6023904722,3462584.014099191,12.68);
  map.addStaticModel('street_lamp_two_opposite_24','./static/map3d/models/street_lamp_two.3ds',325881.56604034174,3462581.124477936,12.68);
  map.addStaticModel('street_lamp_two_opposite_25','./static/map3d/models/street_lamp_two.3ds',325858.1721216263,3462556.677784916,12.68);
  map.addStaticModel('street_lamp_two_opposite_26','./static/map3d/models/street_lamp_two.3ds',325821.3680088696,3462547.6220940743,12.68);
  map.addStaticModel('street_lamp_two_opposite_27','./static/map3d/models/street_lamp_two.3ds',325782.45188748406,3462534.4376719757,12.68);
  map.addStaticModel('street_lamp_two_opposite_28','./static/map3d/models/street_lamp_two.3ds',325748.2227811228,3462518.9449371654,12.68);
  map.addStaticModel('street_lamp_two_opposite_29','./static/map3d/models/street_lamp_two.3ds',325723.55472146743,3462502.401337263,12.68);
  map.addStaticModel('street_lamp_two_opposite_30','./static/map3d/models/street_lamp_two.3ds',325704.09742565616,3462492.017142771,12.68);*/


  //添加红绿灯
  let spatData = [[326324.0245790000 ,3462249.0578100000 ,275 ],
    [326323.5613950000 ,3462248.8994600000 ,276 ],
    [325918.4860970000 ,3462549.8508800000 ,273 ],
    [325873.7186210000 ,3462546.4684800000 ,274 ],
    [325887.1233120000 ,3462536.9405500000 ,283 ],
    [326307.5628790000 ,3462299.4388200000 ,281 ],
    [326308.0562130000 ,3462299.6609100000 ,282 ],
    [326349.3830520000 ,3462287.5669200000 ,279 ],
    [326349.5930230000 ,3462287.1082200000 ,280],
    [326285.7199200000 ,3462263.4905400000 ,277],
    [326285.6372510000 ,3462264.0168700000 ,278]];
  spatData.forEach((arr,index)=>{
    map.addStaticModel('traffic_light_'+index,'./static/map3d/models/traffic_light.3ds',arr[0],arr[1],20);
  })
 /*
  map.addStaticModel('traffic_light_0','./static/map3d/models/traffic_light.3ds',325921.545860186,3462541.0160225183,12.68);
  map.addStaticModel('traffic_light_1','./static/map3d/models/traffic_light.3ds',325868.4327871947,3462561.2291684817,12.68);
  map.addStaticModel('traffic_light_2','./static/map3d/models/traffic_light.3ds',325898.55675146834,3462539.0550170965,12.68);
  map.addStaticModel('traffic_light_3','./static/map3d/models/traffic_light.3ds',326325.78270624415,3462247.0504668984,12.68);
  map.addStaticModel('traffic_light_4','./static/map3d/models/traffic_light.3ds',326314.74230815104,3462313.111718161,12.68);
  map.addStaticModel('traffic_light_5','./static/map3d/models/traffic_light.3ds',326343.54615430237,3462286.313593357,12.68);*/

  // //添加标识牌
  /*map.addStaticModel('traffic_sign_stop_0','./static/map3d/models/traffic_sign_stop.3ds',325894.67930130404,3462580.1783312797,12.68);
  map.addStaticModel('traffic_sign_stop_1','./static/map3d/models/traffic_sign_stop.3ds',326253.3704410266,3462374.6075555324,12.68);
  map.addStaticModel('traffic_sign_stop_2','./static/map3d/models/traffic_sign_stop.3ds',326260.07575023104,3462409.3542993385,12.68);*/

  //矮路灯
  /*map.addStaticModel("lamppost_01","./static/map3d/models/lamppost_01.3ds",442496.96,4427294.44,16);
  map.getStaticModel("lamppost_01").setHeading(30);
  map.getStaticModel("lamppost_01").setUpdate(true);



  //大路灯
  map.addStaticModel("street_lamp_two","./static/map3d/models/street_lamp_two.3ds",442501.99,4427272.65,16);
  map.getStaticModel("street_lamp_two").setHeading(30);
  map.getStaticModel("street_lamp_two").setUpdate(true);

  //红绿灯
  map.addStaticModel("traffic_light","./static/map3d/models/traffic_light.3ds",442533.95,4427306.77,16);
  map.getStaticModel("traffic_light").setHeading(30);
  map.getStaticModel("traffic_light").setUpdate(true);

  //标识牌
  map.addStaticModel("traffic_sign_stop","./static/map3d/models/traffic_sign_stop.3ds",442529.62,4427323.70,16);
  map.getStaticModel("traffic_sign_stop").setHeading(120);
  map.getStaticModel("traffic_sign_stop").setUpdate(true);

  //女人
  map.addStaticModel("Girl walking N090814","./static/map3d/models/Girl walking N090814.3DS",442529.62,4427325.70,16);
  map.getStaticModel("Girl walking N090814").setHeading(120);
  map.getStaticModel("Girl walking N090814").setUpdate(true);

  //男人
  map.addStaticModel("Man N151016.3DS","./static/map3d/models/Man N151016.3DS",442531.62,4427325.70,16);
  map.getStaticModel("Man N151016.3DS").setHeading(120);
  map.getStaticModel("Man N151016.3DS").setUpdate(true);*/
}
