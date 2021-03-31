import React, { useEffect, useState } from 'react';
import './Map.scss'
import newJPG from './image/new.jpg'
import oldJPG from './image/old.jpg'


function Map(props) {
  const {
    openTools,
    isPositionMode,
    myMarkerPosition,
    setMyMarkerPosition,
    setOpenTools,
    userPosition,
    studentId,
    studentName,
    signature,
    setSignature,
    setMyMapObj,
    myMapObj,
    recieverId,
    setReceiverInfo,
    isPhone,
    setIsFunMode,
    isFunMode,
    isAddPlaceMode,
    placePosition,
    setPlacePosition,
    previewPlaceMessage,
    setPreviewPlaceMessage,
    placeInfoList,
    setCommentMode,
    chatPlaceInfo,
    setIsMessageBoxShow,
    isGamMode,
    // setIsAddPlaceMode,
    nearbyUserList } = props

  const OLD_TO_NEW_BY_CAR = "老校区至新校区:驾车🚗"
  const NEW_TO_OLD_BY_CAR = "新校区至老校区:驾车🚗"
  const OLD_TO_NEW_BY_BUS = "老校区至新校区:公交🚌"
  const NEW_TO_OLD_BY_BUS = "新校区至老校区:公交🚌"

  const [isDrive, setIsDrive] = useState(false)
  // 面板状态 
  //0----选择出行方式 
  //1----选择路线
  //2----导航展示
  const [panelState, setPanelState] = useState(0)
  const [DriveType, setDriveType] = useState(OLD_TO_NEW_BY_CAR)
  const [route, setRoute] = useState([])
  const [points, setPoints] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [myMarker, setMyMarker] = useState(null)
  const [placeMarker, setPlaceMarker] = useState(null)
  const [isDrivePanelShow, setIsDrivePanelShow] = useState(false)
  const [driveRoute, setDriveRoute] = useState([])//导航去找朋友
  const [friendName, setFriendName] = useState("")
  const [isMessageCallbackShow, setIsMessageCallbackShow] = useState(false)
  const [messageCallback, setMessageCallback] = useState("")

  const [message, setMessage] = useState("")


  let map = null
  let mouseTool = null
  let newMarker = null
  let westMarker = null
  let eastMarker = null
  let northMarker = null

  const newPosition = [114.61617672935125, 30.45759461941093]
  const westPosition = [114.39835417717694, 30.520580596379155]
  const eastPosition = [114.40520669549704, 30.519101428977407]
  const northPosition = [114.3994557698071, 30.528924839045622]

  useEffect(() => {
    initMap()
  }, [])
  //关闭信息窗体
  function closePlaceInfoWindow() {
    SeeComment(0)
    isGamMode && setIsMessageBoxShow(true)
    map.clearInfoWindow();
  }
  function createPlaceInfoWindow(title, content, position, PlaceCode, CommentNumber) {
    var info = document.createElement("div");
    info.className = "custom-info input-card content-window-card";

    //可以通过下面的方式修改自定义窗体的宽高
    // info.style.width = "400px";
    // 定义顶部标题
    var top = document.createElement("div");
    var titleD = document.createElement("div");
    var closeX = document.createElement("img");
    top.className = "info-top";
    titleD.innerHTML = title;
    closeX.src = "https://webapi.amap.com/images/close2.gif";
    closeX.onclick = closePlaceInfoWindow;

    top.appendChild(titleD);
    top.appendChild(closeX);
    info.appendChild(top);

    // 定义中部内容
    var middle = document.createElement("div");
    middle.className = "info-middle";
    middle.style.backgroundColor = 'white';
    middle.innerHTML = content;
    var buttonList = document.createElement('div')
    buttonList.className = "window-button-list"
    var drive = document.createElement("span");
    drive.className = "drive-place";
    drive.innerText = "导航前往"
    drive.onclick = () => {
      driveToFriend(position)
    }
    buttonList.appendChild(drive)

    var comment = document.createElement("span");
    comment.className = "comment-place";
    comment.innerText = `查看/添加评论(${CommentNumber})`
    comment.onclick = () => {
      SeeComment(PlaceCode)
      setIsMessageBoxShow(false)
    }
    buttonList.appendChild(drive)
    buttonList.appendChild(comment)
    middle.appendChild(buttonList)
    info.appendChild(middle);

    // 定义底部内容
    var bottom = document.createElement("div");
    bottom.className = "info-bottom";
    bottom.style.position = 'relative';
    bottom.style.top = '0px';
    bottom.style.margin = '0 auto';
    var sharp = document.createElement("img");
    sharp.src = "https://webapi.amap.com/images/sharp.png";
    bottom.appendChild(sharp);
    info.appendChild(bottom);
    return info;
  }
  function createInfoWindow(title, content, closeInfoWindow) {
    var info = document.createElement("div");
    info.className = "custom-info input-card content-window-card";

    //可以通过下面的方式修改自定义窗体的宽高
    // info.style.width = "400px";
    // 定义顶部标题
    var top = document.createElement("div");
    var titleD = document.createElement("div");
    var closeX = document.createElement("img");
    top.className = "info-top";
    titleD.innerHTML = title;
    closeX.src = "https://webapi.amap.com/images/close2.gif";
    closeX.onclick = closeInfoWindow;

    top.appendChild(titleD);
    top.appendChild(closeX);
    info.appendChild(top);

    // 定义中部内容
    var middle = document.createElement("div");
    middle.className = "info-middle";
    middle.style.backgroundColor = 'white';
    middle.innerHTML = content;
    info.appendChild(middle);

    // 定义底部内容
    var bottom = document.createElement("div");
    bottom.className = "info-bottom";
    bottom.style.position = 'relative';
    bottom.style.top = '0px';
    bottom.style.margin = '0 auto';
    var sharp = document.createElement("img");
    sharp.src = "https://webapi.amap.com/images/sharp.png";
    bottom.appendChild(sharp);
    info.appendChild(bottom);
    return info;
  }
  function initMap() {
    const AMap = window.AMap

    map = new AMap.Map('container', {
      zoom: 14, //缩放级别
      center: [114.61617672935125, 30.45759461941093],
      resizeEnable: true,
      // layers: [new AMap.TileLayer.Satellite()],  //设置图层,可设置成包含一个或多个图层的数组
      // mapStyle: 'amap://styles/whitesmoke',  //设置地图的显示样式
      viewMode: '3D',  //设置地图模式
      pitch: 0,//地图仰角设定
      lang: 'zh_cn',  //设置地图语言类型
    });
    map.on('click', function (ev) {
      // 触发事件的对象
      var target = ev.target;
      // 触发事件的地理坐标，AMap.LngLat 类型
      var lnglat = ev.lnglat;
      // 触发事件的像素坐标，AMap.Pixel 类型
      var pixel = ev.pixel;
      // 触发事件类型
      var type = ev.type;
      setMyMarkerPosition([lnglat.lng, lnglat.lat])
      setPlacePosition([lnglat.lng, lnglat.lat])
    });
    initMarker()
    initPlugin()
    initEvent()
    getMapCenter()
    setPanelState(0)
    setMyMapObj(map)
  }

  function initMarker() {
    const AMap = window.AMap
    newMarker = new AMap.Marker({
      position: newPosition,
      title: '新校区',
      map: map,
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDMzQzQgMzEuODk1NCA0Ljg5NTQzIDMxIDYgMzFIMTJWMjRMMjQgMTZMMzYgMjRWMzFINDJDNDMuMTA0NiAzMSA0NCAzMS44OTU0IDQ0IDMzVjQyQzQ0IDQzLjEwNDYgNDMuMTA0NiA0NCA0MiA0NEg0VjMzWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjQgNlYxNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiAxMlY2QzM2IDYgMzQuNSA5IDMwIDZDMjUuNSAzIDI0IDYgMjQgNlYxMkMyNCAxMiAyNS41IDkgMzAgMTJDMzQuNSAxNSAzNiAxMiAzNiAxMloiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjggNDRWMzFIMjBMMjAgNDQiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTggNDRMMzAgNDQiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="
      // content:'<div class="marker-route marker-marker-bus-from">新</div>'
    });
    newMarker.setLabel({
      offset: new AMap.Pixel(-13, -24),
      content: "新校区"
    });
    westMarker = new AMap.Marker({
      position: westPosition,
      map: map,
      title: '西校区',
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDMzQzQgMzEuODk1NCA0Ljg5NTQzIDMxIDYgMzFIMTJWMjRMMjQgMTZMMzYgMjRWMzFINDJDNDMuMTA0NiAzMSA0NCAzMS44OTU0IDQ0IDMzVjQyQzQ0IDQzLjEwNDYgNDMuMTA0NiA0NCA0MiA0NEg0VjMzWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjQgNlYxNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiAxMlY2QzM2IDYgMzQuNSA5IDMwIDZDMjUuNSAzIDI0IDYgMjQgNlYxMkMyNCAxMiAyNS41IDkgMzAgMTJDMzQuNSAxNSAzNiAxMiAzNiAxMloiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjggNDRWMzFIMjBMMjAgNDQiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTggNDRMMzAgNDQiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="
    });
    westMarker.setLabel({
      offset: new AMap.Pixel(-13, -24),
      content: "西校区"
    });
    eastMarker = new AMap.Marker({
      position: eastPosition,
      map: map,
      title: '东校区',
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDMzQzQgMzEuODk1NCA0Ljg5NTQzIDMxIDYgMzFIMTJWMjRMMjQgMTZMMzYgMjRWMzFINDJDNDMuMTA0NiAzMSA0NCAzMS44OTU0IDQ0IDMzVjQyQzQ0IDQzLjEwNDYgNDMuMTA0NiA0NCA0MiA0NEg0VjMzWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjQgNlYxNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiAxMlY2QzM2IDYgMzQuNSA5IDMwIDZDMjUuNSAzIDI0IDYgMjQgNlYxMkMyNCAxMiAyNS41IDkgMzAgMTJDMzQuNSAxNSAzNiAxMiAzNiAxMloiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjggNDRWMzFIMjBMMjAgNDQiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTggNDRMMzAgNDQiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="

    });
    eastMarker.setLabel({
      offset: new AMap.Pixel(-13, -24),
      content: "东校区"
    });
    northMarker = new AMap.Marker({
      position: northPosition,
      map: map,
      title: '北校区',
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDMzQzQgMzEuODk1NCA0Ljg5NTQzIDMxIDYgMzFIMTJWMjRMMjQgMTZMMzYgMjRWMzFINDJDNDMuMTA0NiAzMSA0NCAzMS44OTU0IDQ0IDMzVjQyQzQ0IDQzLjEwNDYgNDMuMTA0NiA0NCA0MiA0NEg0VjMzWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjQgNlYxNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiAxMlY2QzM2IDYgMzQuNSA5IDMwIDZDMjUuNSAzIDI0IDYgMjQgNlYxMkMyNCAxMiAyNS41IDkgMzAgMTJDMzQuNSAxNSAzNiAxMiAzNiAxMloiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjggNDRWMzFIMjBMMjAgNDQiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTggNDRMMzAgNDQiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="

    });
    northMarker.setLabel({
      offset: new AMap.Pixel(-13, -24),
      content: "北校区"
    });
    map.add([newMarker, westMarker, northMarker, eastMarker]);
    // map.setFitView();
  }
  function initEvent() {

    const AMap = window.AMap
    let infoNew = getInfoWindow("未来城校区", newJPG, "湖北省武汉市东湖新技术开发区锦程街68号")
    let infoOld = getInfoWindow("南望山校区", oldJPG, "湖北省武汉市鲁磨路388号")
    const newBtn = document.querySelector('.new')
    const westBtn = document.querySelector('.west')
    const eastBtn = document.querySelector('.east')
    const northBtn = document.querySelector('.north')
    const distanceBtn = document.querySelector('.distance')
    const areaBtn = document.querySelector('.area')
    const toolBtn = document.querySelector('.tool')
    AMap.event.addListener(newMarker, 'click', function () {
      infoNew.open(map, newMarker.getPosition());
      map.setCenter(newPosition);
      map.setZoom(18)
      map.setPitch(60)
    });
    AMap.event.addListener(westMarker, 'click', function () {
      infoOld.open(map, westMarker.getPosition());
      map.setCenter(westPosition);
      map.setZoom(18)
      map.setPitch(60)
    });
    AMap.event.addListener(eastMarker, 'click', function () {
      infoOld.open(map, eastMarker.getPosition());
      map.setCenter(eastPosition);
      map.setZoom(18)
      map.setPitch(60)
    });
    AMap.event.addListener(northMarker, 'click', function () {
      infoOld.open(map, northMarker.getPosition());
      map.setCenter(northPosition);
      map.setZoom(18)
      map.setPitch(60)
    });
    newBtn.addEventListener('click', () => {
      // 传入经纬度，设置地图中心点
      // let newPosition = new AMap.LngLat(114.617863, 39.915085);  // 标准写法
      // 简写 let position = [116, 39]; 
      map.setCenter(newPosition);
      map.setZoom(18)
      map.setPitch(60)
      // // 获取地图中心点
      let currentCenter = map.getCenter();
    })
    westBtn.addEventListener('click', () => {
      map.setCenter(westPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
    })
    eastBtn.addEventListener('click', () => {
      map.setCenter(eastPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
    })
    northBtn.addEventListener('click', () => {
      map.setCenter(northPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
    })
    distanceBtn.addEventListener('click', () => {
      mouseTool.close(true)
      mouseTool.rule();
    })
    areaBtn.addEventListener('click', () => {
      mouseTool.close(true)
      mouseTool.measureArea();
    })
    toolBtn.addEventListener('click', () => {
      mouseTool.close(true)
    })

    function getInfoWindow(name, src, address) {
      var title = `中国地质大学${name}`,
        content = [];
      content.push("<img style=" + "width:120px;height:80px" + ` src='${src}' >地址：${address}`);
      content.push("校友工作服务电话：027-67883684");
      content.push("<a href='http://www.cug.edu.cn/'>官方网站</a>");
      var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: createInfoWindow(title, content.join("<br/>"), () => { map.clearInfoWindow() }),
        offset: new AMap.Pixel(16, -45)
      });
      return infoWindow
    }
  }
  function initPlugin() {
    const AMap = window.AMap
    map.plugin(["AMap.MouseTool"], function () {
      mouseTool = new AMap.MouseTool(map);
    });
    AMap.plugin([
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.OverView',
      'AMap.MapType',
      'AMap.Geolocation',
      'AMap.Driving'
    ], function () {
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      map.addControl(new AMap.ToolBar());
      // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
      map.addControl(new AMap.Scale());
      // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
      map.addControl(new AMap.OverView({ isOpen: true }));
      // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
      map.addControl(new AMap.MapType());
      // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
      map.addControl(new AMap.Geolocation());
    });
    // AMap.plugin('AMap.Autocomplete', function () {
    //   // 实例化Autocomplete
    //   var autoOptions = {
    //     //city 限定城市，默认全国
    //     city: '全国'
    //   }
    //   var autoComplete = new AMap.Autocomplete(autoOptions);
    //   autoComplete.search(keyword, function (status, result) {
    //     // 搜索成功时，result即是对应的匹配数据
    //   })
    // })
  }
  function getMapCenter() {

    const AMap = window.AMap
    AMap.plugin('AMap.Geolocation', function () {
      var geolocation = new AMap.Geolocation({
        // 是否使用高精度定位，默认：true
        enableHighAccuracy: true,
        // 设置定位超时时间，默认：无穷大
        timeout: 10000,
        // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
        buttonOffset: new AMap.Pixel(10, 20),
        //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        zoomToAccuracy: true,
        //  定位按钮的排放位置,  RB表示右下
        buttonPosition: 'RB'
      })

      geolocation.getCurrentPosition()
      AMap.event.addListener(geolocation, 'complete', onComplete)
      AMap.event.addListener(geolocation, 'error', onError)

      function onComplete(data) {
        const lat = data.position.lat
        const lng = data.position.lng
        const pathname = window.location.pathname

        if (pathname !== "/position") {
          map.setCenter([lng, lat])
          const curPosMarker = new AMap.Marker({
            position: [lng, lat],
            title: '我的定位',
            map: map,
            icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTIiIHI9IjgiIGZpbGw9IiNmMDAiIHN0cm9rZT0iI2YwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNDIgNDRDNDIgMzQuMDU4OSAzMy45NDExIDI2IDI0IDI2QzE0LjA1ODkgMjYgNiAzNC4wNTg5IDYgNDQiIHN0cm9rZT0iI2YwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjQgNDRMMjggMzlMMjQgMjZMMjAgMzlMMjQgNDRaIiBmaWxsPSIjZjAwIiBzdHJva2U9IiNmMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+"
            // content:'<div class="marker-route marker-marker-bus-from">新</div>'
          });
          curPosMarker.setLabel({
            offset: new AMap.Pixel(-18, -24),
            content: "<span style='color:red;font-weight:600;text-align:center;'>我的定位</span>"

          });
          map.add(curPosMarker)
        }
        if (userPosition[0] === 0 && userPosition[1] === 0 && pathname === '/position') {
          setMyMarkerPosition([lng, lat])
          map.setCenter([lng, lat])
          const curPosMarker = new AMap.Marker({
            position: [lng, lat],
            title: '我的定位',
            map: map,
            // content:'<div class="marker-route marker-marker-bus-from">新</div>'
          });
          curPosMarker.setLabel({
            offset: new AMap.Pixel(-18, -24),
            content: "<span style='color:red;font-weight:600;text-align:center;'>我的定位</span>"

          });
          map.add(curPosMarker)

        }
      }

      function onError(data) {
        // 定位出错
      }
    })
  }
  function startDrive(e) {
    switch (e.target.innerText) {
      case "新校区至老校区:驾车🚗":
        setDriveType(NEW_TO_OLD_BY_CAR)
        setPanelState(1)
        setPoints([
          { keyword: '中国地质大学未来城校区', city: '武汉' },
          { keyword: '中国地质大学西区(西2门)', city: '武汉' }
        ])
        break;
      case "老校区至新校区:驾车🚗":
        setDriveType(OLD_TO_NEW_BY_CAR)
        setPanelState(1)
        setPoints([
          { keyword: '中国地质大学西区(西2门)', city: '武汉' },
          { keyword: '中国地质大学未来城校区', city: '武汉' },
        ])
        break;
      case "新校区至老校区:公交🚌":
        setDriveType(OLD_TO_NEW_BY_BUS)
        setPanelState(1)
        setPoints([
          { keyword: '中国地质大学未来城校区', city: '武汉' },
          { keyword: '中国地质大学西区(西2门)', city: '武汉' }
        ])
        break;
      case "老校区至新校区:公交🚌":
        setDriveType(NEW_TO_OLD_BY_BUS)
        setPanelState(1)
        setPoints([
          { keyword: '中国地质大学西区(西2门)', city: '武汉' },
          { keyword: '中国地质大学未来城校区', city: '武汉' },
        ])
        break;
      default:
        console.error("出错了！")
        break;
    }

  }
  function getRoute(e) {
    setIsLoading(true)
    const AMap = window.AMap
    let policy = null
    // policy: AMap.DrivingPolicy.LEAST_TIME,//最短时间
    // policy: AMap.DrivingPolicy.LEAST_FEE,//最少费用
    // policy: AMap.DrivingPolicy.LEAST_DISTANCE,//最短距离
    // policy: AMap.DrivingPolicy.REAL_TRAFFIC,//实际交通考量
    if (DriveType == OLD_TO_NEW_BY_CAR || DriveType == NEW_TO_OLD_BY_CAR) {
      switch (e.target.innerText) {
        case "时间最短⏰":
          policy = AMap.DrivingPolicy.LEAST_TIME
          break;
        case "路程最短🛣️":
          policy = AMap.DrivingPolicy.LEAST_DISTANCE
          break;
        case "费用最少💰":
          policy = AMap.DrivingPolicy.LEAST_FEE
          break;
        case "系统推荐路线👍":
          policy = AMap.DrivingPolicy.REAL_TRAFFIC
          break;
        default:
          console.error("出错了！")
          break;
      }
      let thisPoints = [...points]
      map = new AMap.Map("container", {
        zoom: 15, //缩放级别
        center: [114.61617672935125, 30.45759461941093],
        resizeEnable: true,
      });
      //构造路线导航类
      var driving = new AMap.Driving({
        map: map,
        policy,
      });
      // 根据起终点名称规划驾车导航路线
      driving.search(thisPoints, function (status, result) {
        // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          console.log('绘制驾车路线完成')
          setRoute(result.routes)
          console.log(result);
        } else {
          console.error('获取驾车数据失败：' + result)
        }
        setIsLoading(false)
        setPanelState(2)
      });

    } else if (DriveType == NEW_TO_OLD_BY_BUS || DriveType == OLD_TO_NEW_BY_BUS) {
      // switch (e.target.innerText) {
      //   case "时间最短⏰":
      //     policy = AMap.TransferPolicy.LEAST_TIME
      //     console.log("here");
      //     break;
      //   case "费用最少💰":
      //     policy = AMap.TransferPolicy.LEAST_FEE
      //     break;
      //   case "换乘次数最少":
      //     policy = AMap.TransferPolicy.LEAST_TRANSFER
      //     break;
      //   case "走路距离最少🚶‍♀️":
      //     policy = AMap.TransferPolicy.LEAST_WALK
      //     break;
      //   case "不坐地铁🚇":
      //     policy = AMap.TransferPolicy.NO_SUBWAY
      //     break;
      //   case "系统推荐路线👍":
      //     policy = AMap.TransferPolicy.MOST_COMFORT
      //     break;
      //   default:
      //     console.error("出错了！")
      //     break;
      // }
      let thisPoints = [...points]
      map = new AMap.Map("container", {
        zoom: 14, //缩放级别
        center: [114.61617672935125, 30.45759461941093],
        resizeEnable: true,
      });

      //构造路线导航类
      var transfer = new AMap.Driving({
        map: map,
        // policy,
      });
      // 根据起终点名称规划驾车导航路线
      transfer.search(thisPoints, function (status, result) {
        // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          console.log('绘制出行路线完成')
          setRoute(result.routes)
          console.log(result);
        } else {
          console.error('获取出行数据失败：' + result)
        }
        setIsLoading(false)
        setPanelState(2)
      });
    } else {
      console.error("setPolicyError")
    }
  }
  function driveToFriend(position) {
    const AMap = window.AMap
    map = new AMap.Map("container", {
      zoom: 15, //缩放级别
      center: userPosition,
      resizeEnable: true,
    });
    //构造路线导航类
    var driving = new AMap.Driving({
      map: map,
      policy: AMap.DrivingPolicy.REAL_TRAFFIC,
    });
    // 根据起终点名称规划驾车导航路线
    let startPosition = [...userPosition]
    let endPosition = [...position]
    setIsLoading(true)
    driving.search(startPosition, endPosition, function (status, result) {

      // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
      if (status === 'complete') {
        console.log('绘制驾车路线完成')
        console.log("result.routes[0]", result.routes[0]);

        setIsDrivePanelShow(true)
        setDriveRoute(result.routes[0])
        console.log(result);
      } else {
        console.error('获取驾车数据失败：' + result)
      }
      setIsLoading(false)

    });
  }
  function SeeComment(placeCode) {
    setCommentMode(placeCode)
  }
  function panelRouter() {
    if (panelState === 0) {
      return (<>
        <div className="drive-type">请选择出行方向及方式</div>
        <div className="drive-button-list1">
          <button className="drive-button" onClick={e => { startDrive(e) }}>新校区至老校区:驾车🚗</button>
          <button className="drive-button" onClick={e => { startDrive(e) }}>老校区至新校区:驾车🚗</button>
        </div>
        <div className="drive-button-list2">
          <button className="drive-button" onClick={e => { startDrive(e) }} disabled>新校区至老校区:公交🚌</button>
          <button className="drive-button" onClick={e => { startDrive(e) }} disabled>老校区至新校区:公交🚌</button>
        </div>
      </>)
    } else if (panelState === 1) {
      return (
        <>
          <div className="drive-type">你选择的方式是{DriveType} </div>
          <div className="drive-type">请选择出行策略:</div>
          {DriveType.indexOf("驾车") !== -1 ?
            <>
              <div className="drive-button-list1">
                <button className="drive-button" onClick={e => { getRoute(e) }}>时间最短⏰</button>
                <button className="drive-button" onClick={e => { getRoute(e) }}>路程最短🛣️</button>
              </div>
              <div className="drive-button-list2">
                <button className="drive-button" onClick={e => { getRoute(e) }}>费用最少💰</button>
                <button className="drive-button suggest" onClick={e => { getRoute(e) }}>系统推荐路线👍</button>
              </div>
            </> :
            <>
              <div className="drive-button-list1">
                <button className="drive-button" onClick={e => { getRoute(e) }}>时间最短⏰</button>
                <button className="drive-button" onClick={e => { getRoute(e) }}>换乘次数最少</button>
              </div>
              <div className="drive-button-list2">
                <button className="drive-button" onClick={e => { getRoute(e) }}>费用最少💰</button>
                <button className="drive-button" onClick={e => { getRoute(e) }}>不坐地铁🚇</button>
              </div>
              <div className="drive-button-list3">
                <button className="drive-button" onClick={e => { getRoute(e) }}>走路距离最少🚶‍♀️</button>
                <button className="drive-button suggest" onClick={e => { getRoute(e) }}>系统推荐路线👍</button>
              </div>
            </>}
        </>
      )
    } else if (panelState === 2) {
      return (<>
        <div className="drive-type">{route[0].policy}路线,耗时约{Math.floor((route[0].time) / 60)}分钟,路线总长{route[0].distance}米</div>
        <div className="instruction-container">
          {route[0].steps.map((item, index) => {
            return (
              <div className="drive-path" key={item.instruction}>{index + 1}:{item.instruction}</div>
            )
          })}
        </div>

      </>

      )
    }
  }
  function addPlaceMarker() {
    placeMarker && myMapObj.remove(placeMarker)
    const AMap = window.AMap
    const icon = new AMap.Icon({
      image: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik00IDEySDQ0VjIwTDQyLjYwMTUgMjAuODM5MUM0MC4zODQ3IDIyLjE2OTIgMzcuNjE1MyAyMi4xNjkyIDM1LjM5ODUgMjAuODM5MUwzNCAyMEwzMi42MDE1IDIwLjgzOTFDMzAuMzg0NyAyMi4xNjkyIDI3LjYxNTMgMjIuMTY5MiAyNS4zOTg1IDIwLjgzOTFMMjQgMjBMMjIuNjAxNSAyMC44MzkxQzIwLjM4NDcgMjIuMTY5MiAxNy42MTUzIDIyLjE2OTIgMTUuMzk4NSAyMC44MzkxTDE0IDIwTDEyLjYwMTUgMjAuODM5MUMxMC4zODQ3IDIyLjE2OTIgNy42MTUzMSAyMi4xNjkyIDUuMzk4NTMgMjAuODM5MUw0IDIwVjEyWiIgZmlsbD0iIzAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik04IDIyLjQ4ODlWNDRINDBWMjIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNOCAxMS44MjIyVjRINDBWMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSIxOSIgeT0iMzIiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMiIgZmlsbD0iIzAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
      size: new AMap.Size(24, 24)
    });
    const Marker = new AMap.Marker({
      position: myMarkerPosition,
      map: myMapObj,
      icon
    });
    Marker.setLabel({
      offset: new AMap.Pixel(30, 5),
      content: "<span style='color:red;font-weight:600;text-align:center;'>地物位置</span>"
    });
    myMapObj.add(Marker)
    setPlaceMarker(Marker)
  }
  function addMarker(isUserPosition = false) {
    myMarker && myMapObj.remove(myMarker)
    const AMap = window.AMap
    const Marker = new AMap.Marker({
      position: isUserPosition ? userPosition : myMarkerPosition,
      map: myMapObj,
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNCAxNEMyNi43NjE0IDE0IDI5IDExLjc2MTQgMjkgOUMyOSA2LjIzODU4IDI2Ljc2MTQgNCAyNCA0QzIxLjIzODYgNCAxOSA2LjIzODU4IDE5IDlDMTkgMTEuNzYxNCAyMS4yMzg2IDE0IDI0IDE0WiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNyAyMEgyMUMyMC4wNzEzIDIwIDE5LjYwNyAyMCAxOS4yMTU5IDIwLjAzODVDMTUuNDE3NiAyMC40MTI2IDEyLjQxMjYgMjMuNDE3NiAxMi4wMzg1IDI3LjIxNTlDMTIgMjcuNjA3IDEyIDI4LjA3MTMgMTIgMjlIMzZDMzYgMjguMDcxMyAzNiAyNy42MDcgMzUuOTYxNSAyNy4yMTU5QzM1LjU4NzQgMjMuNDE3NiAzMi41ODI0IDIwLjQxMjYgMjguNzg0MSAyMC4wMzg1QzI4LjM5MyAyMCAyNy45Mjg3IDIwIDI3IDIwWiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MSAyNi43ODM3QzQyLjkwMTcgMjguMDA3OSA0NCAyOS40NTI3IDQ0IDMxQzQ0IDM1LjQxODMgMzUuMDQ1NyAzOSAyNCAzOUMxMi45NTQzIDM5IDQgMzUuNDE4MyA0IDMxQzQgMjkuNDUyNyA1LjA5ODI3IDI4LjAwNzkgNyAyNi43ODM3IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE5IDM0TDI0IDM5TDE5IDQ0IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+"
    });
    // Marker.setTitle("设置位置");
    Marker.setLabel({
      offset: new AMap.Pixel(-20, -25),
      content: "<span style='color:red;font-weight:500;text-align:center;'>我的位置</span>"
    });
    setMyMarker(Marker)
  }
  useEffect(() => {
    myMarker && myMapObj.add(myMarker)
  }, [myMarker])
  useEffect(() => {
    if (nearbyUserList && nearbyUserList.length > 0) {
      const center = [114, 30]
      const AMap = window.AMap
      map = new AMap.Map('container', {
        zoom: 15, //缩放级别
        center: userPosition,
        resizeEnable: true,
        // layers: [new AMap.TileLayer.Satellite()],  //设置图层,可设置成包含一个或多个图层的数组
        // mapStyle: 'amap://styles/whitesmoke',  //设置地图的显示样式
        viewMode: '3D',  //设置地图模式
        pitch: 0,//地图仰角设定
        lang: 'zh_cn',  //设置地图语言类型
      });
      const Marker = new AMap.Marker({
        position: userPosition,
        map: map,
        zindex: 101,
        icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNCAxNEMyNi43NjE0IDE0IDI5IDExLjc2MTQgMjkgOUMyOSA2LjIzODU4IDI2Ljc2MTQgNCAyNCA0QzIxLjIzODYgNCAxOSA2LjIzODU4IDE5IDlDMTkgMTEuNzYxNCAyMS4yMzg2IDE0IDI0IDE0WiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNyAyMEgyMUMyMC4wNzEzIDIwIDE5LjYwNyAyMCAxOS4yMTU5IDIwLjAzODVDMTUuNDE3NiAyMC40MTI2IDEyLjQxMjYgMjMuNDE3NiAxMi4wMzg1IDI3LjIxNTlDMTIgMjcuNjA3IDEyIDI4LjA3MTMgMTIgMjlIMzZDMzYgMjguMDcxMyAzNiAyNy42MDcgMzUuOTYxNSAyNy4yMTU5QzM1LjU4NzQgMjMuNDE3NiAzMi41ODI0IDIwLjQxMjYgMjguNzg0MSAyMC4wMzg1QzI4LjM5MyAyMCAyNy45Mjg3IDIwIDI3IDIwWiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MSAyNi43ODM3QzQyLjkwMTcgMjguMDA3OSA0NCAyOS40NTI3IDQ0IDMxQzQ0IDM1LjQxODMgMzUuMDQ1NyAzOSAyNCAzOUMxMi45NTQzIDM5IDQgMzUuNDE4MyA0IDMxQzQgMjkuNDUyNyA1LjA5ODI3IDI4LjAwNzkgNyAyNi43ODM3IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE5IDM0TDI0IDM5TDE5IDQ0IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
      });
      Marker.setLabel({
        offset: new AMap.Pixel(-15, -25),
        zindex: 101,
        content: "<span style='color:red;font-weight:600;text-align:center;'>我的位置</span>"
      });
      setMyMarker(Marker)
      setMyMapObj(map)
      getFriendMarkers(nearbyUserList)
    }
  }, [nearbyUserList, userPosition])
  useEffect(() => {
    if (isPositionMode && userPosition[0] != 0) {
      myMapObj.setCenter(userPosition)
      addMarker(true)
    } else if (userPosition[0] != 0 && userPosition[1] != 0) {
      myMapObj.setCenter(userPosition)
    }
  }, [isPositionMode, userPosition])
  useEffect(() => {
    if (isAddPlaceMode && userPosition[0] != 0) {
      myMapObj.setCenter(userPosition)
      addMarker(true)
    } else if (userPosition[0] != 0 && userPosition[1] != 0) {
      myMapObj.setCenter(userPosition)
    }
  }, [isAddPlaceMode, userPosition])
  function getFriendMarkers(nearbyUserList) {
    function getFriendInfoWindow(name, signature, position) {
      var title = name + "",
        content = [];
      content.push(signature);
      var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: createFriendInfoWindow(title, content.join("<br/>"), position),
        offset: new AMap.Pixel(16, -45)
      });
      return infoWindow
    }

    //构建自定义信息窗体
    function createFriendInfoWindow(title, content, position) {
      var info = document.createElement("div");
      info.className = "custom-info input-card content-window-card";

      //可以通过下面的方式修改自定义窗体的宽高
      // info.style.width = "400px";
      // 定义顶部标题
      var top = document.createElement("div");
      var titleD = document.createElement("div");
      var closeX = document.createElement("img");
      top.className = "info-top";
      titleD.innerHTML = title + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      closeX.src = "https://webapi.amap.com/images/close2.gif";
      closeX.onclick = closeFriendInfoWindow;

      top.appendChild(titleD);
      top.appendChild(closeX);
      info.appendChild(top);

      // 定义中部内容
      var middle = document.createElement("div");
      middle.className = "info-middle";
      middle.style.backgroundColor = 'white';
      middle.innerHTML = "<span style='color:red'>个性签名:</span>" + content;
      var chat = document.createElement("span");
      chat.className = "friend-chat";
      chat.innerText = "导航去找Ta"
      chat.onclick = () => {
        driveToFriend(position)
        setFriendName(title)
      }
      middle.appendChild(chat)
      info.appendChild(middle);


      // 定义底部内容
      var bottom = document.createElement("div");
      bottom.className = "info-bottom";
      bottom.style.position = 'relative';
      bottom.style.top = '0px';
      bottom.style.margin = '0 auto';
      var sharp = document.createElement("img");
      sharp.src = "https://webapi.amap.com/images/sharp.png";
      bottom.appendChild(sharp);
      info.appendChild(bottom);
      return info;
    }

    //关闭信息窗体
    function closeFriendInfoWindow() {
      map.clearInfoWindow();
    }
    const MarkerList = []
    const AMap = window.AMap
    let focusFlag = false
    let focusPos = [0, 0]
    nearbyUserList.map(item => {
      const lng = item.longitude
      const lat = item.latitude
      const Marker = new AMap.Marker({
        position: [lng, lat],
        map: map,
        icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTYiIHI9IjYiIGZpbGw9IiMxNzcwRTYiIHN0cm9rZT0iIzE3NzBFNiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzYgMzZDMzYgMjkuMzcyNiAzMC42Mjc0IDI0IDI0IDI0QzE3LjM3MjYgMjQgMTIgMjkuMzcyNiAxMiAzNiIgc3Ryb2tlPSIjMTc3MEU2IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiA0SDQ0VjEyIiBzdHJva2U9IiMxNzcwRTYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDRINFYxMiIgc3Ryb2tlPSIjMTc3MEU2IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNiA0NEg0NFYzNiIgc3Ryb2tlPSIjMTc3MEU2IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiA0NEg0VjM2IiBzdHJva2U9IiMxNzcwRTYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
      });
      Marker.setLabel({
        offset: new AMap.Pixel(-25, -25),
        content: `<span style='color:blue;font-weight:600;text-align:center;'>${item.username}</span><span style='font-weight:400'>的位置</span>`
      });
      AMap.event.addListener(Marker, 'click', function () {
        let infoNew = getFriendInfoWindow(item.username, item.signature, [lng, lat])
        infoNew.open(map, Marker.getPosition());
        map.setCenter([lng, lat]);
        map.setZoom(18)
        map.setPitch(60)
        leaveMessage({ id: item.student_id, name: item.username })
      });
      MarkerList.push(Marker)
      if (item.setFocus) {
        focusFlag = true
        focusPos = [lng, lat]
        item.setFocus = false
      }
    })
    const Marker = new AMap.Marker({
      position: userPosition,
      map: map,
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNCAxNEMyNi43NjE0IDE0IDI5IDExLjc2MTQgMjkgOUMyOSA2LjIzODU4IDI2Ljc2MTQgNCAyNCA0QzIxLjIzODYgNCAxOSA2LjIzODU4IDE5IDlDMTkgMTEuNzYxNCAyMS4yMzg2IDE0IDI0IDE0WiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNyAyMEgyMUMyMC4wNzEzIDIwIDE5LjYwNyAyMCAxOS4yMTU5IDIwLjAzODVDMTUuNDE3NiAyMC40MTI2IDEyLjQxMjYgMjMuNDE3NiAxMi4wMzg1IDI3LjIxNTlDMTIgMjcuNjA3IDEyIDI4LjA3MTMgMTIgMjlIMzZDMzYgMjguMDcxMyAzNiAyNy42MDcgMzUuOTYxNSAyNy4yMTU5QzM1LjU4NzQgMjMuNDE3NiAzMi41ODI0IDIwLjQxMjYgMjguNzg0MSAyMC4wMzg1QzI4LjM5MyAyMCAyNy45Mjg3IDIwIDI3IDIwWiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MSAyNi43ODM3QzQyLjkwMTcgMjguMDA3OSA0NCAyOS40NTI3IDQ0IDMxQzQ0IDM1LjQxODMgMzUuMDQ1NyAzOSAyNCAzOUMxMi45NTQzIDM5IDQgMzUuNDE4MyA0IDMxQzQgMjkuNDUyNyA1LjA5ODI3IDI4LjAwNzkgNyAyNi43ODM3IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE5IDM0TDI0IDM5TDE5IDQ0IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
    });
    Marker.setLabel({
      offset: new AMap.Pixel(-15, -25),
      content: "<span style='color:red;font-weight:600;text-align:center;'>我的位置</span>"
    });
    setMyMarker(Marker)
    setMyMapObj(map)
    map.add(MarkerList)
    if (focusFlag) {
      map.setCenter(focusPos)
      map.setZoom(18)
      map.setPitch(60)
    } else {
      map.setFitView(); //自适应
    }
    initMarker()
    initEvent()
  }
  function leaveMessage(toUserInfo) {
    setReceiverInfo(toUserInfo)
  }
  function getPlaceMarker(placeInfoList) {
    const PlaceMarkerList = []
    const AMap = window.AMap
    let typeText = ''
    let imgUrl = ''

    let darkStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let lightStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let halfStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`

    placeInfoList.map(item => {
      let {
        PlaceCode,
        Name,
        Address,
        CommentNumber,
        FounderComment,
        Number,
        Type,
        Score,
        Image1Url,
        Image2Url,
        Longitude,
        Latitude,
      } = item
      let starsDiv = '<div style="width:60px;height:12px;display:flex;align-items: center;justify-content:flex-start">'

      for (let i = 1; i < 6; i++) {
        if (i <= Score) {
          starsDiv += lightStar
        } else if (Score + 0.51 >= i) {
          starsDiv += halfStar
        } else {
          starsDiv += darkStar
        }
      }
      Score = String(Score)
      if(Score.length>5){
        Score = Score.slice(0,5)
      }
      let iconUrl = ''
      switch (Type) {
        case 1:
          typeText = '美食'
          iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik02IDE4SDQyVjI0QzQyIDI3LjMxMzcgMzkuMzEzNyAzMCAzNiAzMEgxMkM4LjY4NjI5IDMwIDYgMjcuMzEzNyA2IDI0VjE4WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MCA0Mkg4IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEzIDQyTDE2IDMwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM1IDQyTDMyIDMwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMwIDE4TDI3IDRIMjFMMTggMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzYgMTFINDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNOCAxMUgxMiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
          break;
        case 2:
          typeText = '娱乐'

          iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05IDI2QzkgMjYgOC45MjQyOSAyNi43ODY3IDggMzFDNy4wMjA1MyAzNS40NjQ4IDQgNDQgNCA0NEg0NEM0NCA0NCA0MC45Nzk1IDM1LjQ2NDggNDAgMzFDMzkuMDc1NyAyNi43ODY3IDM5IDI2IDM5IDI2IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIwIDI4QzIxIDM3IDE2IDQ0IDE2IDQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI4IDI4QzI3IDM3IDMyIDQ0IDMyIDQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTYgMThDNiAxOCAxMy41OTIzIDE3Ljk0NTIgMTcgMTdDMTkuODY1OSAxNi4yMDUxIDI0IDE0IDI0IDE0QzI0IDE0IDI3LjgyMjkgMTYuMTk0NCAzMC41IDE3QzM0LjA3MjIgMTguMDc1IDQyIDE4IDQyIDE4TDQxIDI1QzQxIDI1IDM3IDI3IDM2IDI3QzM1IDI3IDMzIDI1IDMyIDI1QzMxIDI1IDI4LjUgMjggMjggMjhDMjcuNSAyOCAyNSAyNSAyNCAyNUMyMyAyNSAyMSAyOC41IDIwIDI4LjVDMTkgMjguNSAxNyAyNSAxNiAyNUMxNS44MDIgMjUgMTUuNTI1NyAyNS4wNzg0IDE1LjIwOTggMjUuMjA0MUMxMy4wNjgxIDI2LjA1NjQgMTAuNzIxNCAyNi40ODg1IDguNTgxMTUgMjUuNjMyNUw3IDI1TDYgMThaIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI0IDVWMTUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzYgMTFWNC45OTk5OUMzNiA0Ljk5OTk5IDM0LjUgNy45OTk5OSAzMCA0Ljk5OTk5QzI1LjUgMS45OTk5OSAyNCA0Ljk5OTk5IDI0IDQuOTk5OTlWMTFDMjQgMTEgMjUuNSA3Ljk5OTk5IDMwIDExQzM0LjUgMTQgMzYgMTEgMzYgMTFaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'
          break;
        case 3:
          typeText = '基础设施'

          iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDRINDQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSI4IiB5PSI0IiB3aWR0aD0iMzIiIGhlaWdodD0iNDAiIHJ4PSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMCAzMkgyOFY0NEgyMFYzMloiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTUgMTJMMTcgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMTUgMThMMTcgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjMgMTJMMjUgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjMgMThMMjUgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzEgMTJMMzMgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzEgMThMMzMgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNCA0NEg0NCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yOCAzMkgzMEMzMC41NTIzIDMyIDMxLjAwOTggMzEuNTQ4IDMwLjkwNDQgMzEuMDA1OEMzMC4zNTE3IDI4LjE2NTMgMjcuNDcwOSAyNiAyNCAyNkMyMC41MjkxIDI2IDE3LjY0ODMgMjguMTY1MyAxNy4wOTU2IDMxLjAwNThDMTYuOTkwMiAzMS41NDggMTcuNDQ3NyAzMiAxOCAzMkgyMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
          break;

        default:
          break;
      }
      
      starsDiv += '</div>'
      const content = [];

      const title = `<div style="min-width:150px;font-weight:700">${Name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(地物代号:<span style="color:red">${PlaceCode}</span>)</div>`
      if (Image1Url !== '' && Image2Url !== '') {
        content.push(`<div><img src="${Image1Url}"style="width:120px;height:80px;border:1px black solid" /><img src="${Image2Url}"style="width:120px;height:80px;border:1px black solid" /></div>`);
      }
      else if (Image1Url !== '' && Image2Url === '') {
        content.push(`<img src="${Image1Url}"style="width:180px;height:120px;border:1px black solid" />`);
      }
      else if (Image1Url === '' && Image2Url !== '') {
        content.push(`<img src="${Image2Url}"style="width:180px;height:120px;border:1px black solid" />`);
      }
      content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">类型:<span style="font-size:16px;font-weight:700;">${typeText}</span><img src=${iconUrl} style="width:30px;height:30px;margin-left:20px" /></div>`)
      content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">评分:<span style="font-size:18px;font-weight:700;color:red;margin-right:20px">${Score}</span> ${starsDiv}</div>`);
      content.push(`<span style="font-size:16px">详细地址: ${Address}</span>`);
      content.push(`<span style="font-size:16px">联系电话: ${Number}</span>`);
      content.push(`<span style="font-size:16px">推荐人:<span style="font-weight:700;font-size:16px">
    ${studentName}</span></span>`);
      content.push(`<span style="font-size:16px">推荐语: <span style="color:red;font-size:14px">${FounderComment}</span></span>`);
      var newPlaceInfoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        content: createPlaceInfoWindow(title, content.join("<br/>"), [Longitude, Latitude], PlaceCode, CommentNumber),
        offset: new AMap.Pixel(16, -45)
      });
      const lng = item.Longitude
      const lat = item.Latitude
      const Marker = new AMap.Marker({
        position: [lng, lat],
        map: map,
        icon: iconUrl,
      });
      Marker.setLabel({
        offset: new AMap.Pixel(-25, -25),
        content: `<span style='color:black;font-weight:600;text-align:center;'>${Name}</span><span style='font-weight:400'></span>`
      });
      AMap.event.addListener(Marker, 'click', function () {
        newPlaceInfoWindow.open(map, Marker.getPosition());
        map.setZoom(17)
        if (isPhone) {
          map.setCenter([lng - 0.0005, lat + 0.0003]);
        } else {
          map.setCenter([lng + 0.0001, lat + 0.00015]);
        }
      });
      PlaceMarkerList.push(Marker)

    })

    map.add(PlaceMarkerList)
    const Marker = new AMap.Marker({
      position: userPosition,
      map: map,
      zindex: 101,
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNCAxNEMyNi43NjE0IDE0IDI5IDExLjc2MTQgMjkgOUMyOSA2LjIzODU4IDI2Ljc2MTQgNCAyNCA0QzIxLjIzODYgNCAxOSA2LjIzODU4IDE5IDlDMTkgMTEuNzYxNCAyMS4yMzg2IDE0IDI0IDE0WiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNyAyMEgyMUMyMC4wNzEzIDIwIDE5LjYwNyAyMCAxOS4yMTU5IDIwLjAzODVDMTUuNDE3NiAyMC40MTI2IDEyLjQxMjYgMjMuNDE3NiAxMi4wMzg1IDI3LjIxNTlDMTIgMjcuNjA3IDEyIDI4LjA3MTMgMTIgMjlIMzZDMzYgMjguMDcxMyAzNiAyNy42MDcgMzUuOTYxNSAyNy4yMTU5QzM1LjU4NzQgMjMuNDE3NiAzMi41ODI0IDIwLjQxMjYgMjguNzg0MSAyMC4wMzg1QzI4LjM5MyAyMCAyNy45Mjg3IDIwIDI3IDIwWiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MSAyNi43ODM3QzQyLjkwMTcgMjguMDA3OSA0NCAyOS40NTI3IDQ0IDMxQzQ0IDM1LjQxODMgMzUuMDQ1NyAzOSAyNCAzOUMxMi45NTQzIDM5IDQgMzUuNDE4MyA0IDMxQzQgMjkuNDUyNyA1LjA5ODI3IDI4LjAwNzkgNyAyNi43ODM3IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE5IDM0TDI0IDM5TDE5IDQ0IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
    });
    Marker.setLabel({
      offset: new AMap.Pixel(-15, -25),
      zindex: 101,
      content: "<span style='color:red;font-weight:600;text-align:center;'>我的位置</span>"
    });
    setMyMarker(Marker)
    map.setFitView(); //自适应
  }
  function showPlace(chatPlaceInfo) {
    const AMap = window.AMap

    if(!map){
      map = myMapObj
    }
    let typeText = ''
    let imgUrl = ''

    let darkStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let lightStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let halfStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`

    let {
      PlaceCode,
      Name,
      Address,
      CommentNumber,
      FounderComment,
      Number,
      Type,
      Score,
      Image1Url,
      Image2Url,
      Longitude,
      Latitude,
    } = chatPlaceInfo
    let starsDiv = '<div style="width:60px;height:12px;display:flex;align-items: center;justify-content:flex-start">'

    for (let i = 1; i < 6; i++) {
      if (i <= Score) {
        starsDiv += lightStar
      } else if (Score + 0.51 >= i) {
        starsDiv += halfStar
      } else {
        starsDiv += darkStar
      }
    }
    Score = String(Score)
    if(Score.length>5){
      Score = Score.slice(0,5)
    }
    let iconUrl = ''
    switch (Type) {
      case 1:
        typeText = '美食'
        iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik02IDE4SDQyVjI0QzQyIDI3LjMxMzcgMzkuMzEzNyAzMCAzNiAzMEgxMkM4LjY4NjI5IDMwIDYgMjcuMzEzNyA2IDI0VjE4WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MCA0Mkg4IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEzIDQyTDE2IDMwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM1IDQyTDMyIDMwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMwIDE4TDI3IDRIMjFMMTggMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzYgMTFINDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNOCAxMUgxMiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
        break;
      case 2:
        typeText = '娱乐'

        iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05IDI2QzkgMjYgOC45MjQyOSAyNi43ODY3IDggMzFDNy4wMjA1MyAzNS40NjQ4IDQgNDQgNCA0NEg0NEM0NCA0NCA0MC45Nzk1IDM1LjQ2NDggNDAgMzFDMzkuMDc1NyAyNi43ODY3IDM5IDI2IDM5IDI2IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIwIDI4QzIxIDM3IDE2IDQ0IDE2IDQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI4IDI4QzI3IDM3IDMyIDQ0IDMyIDQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTYgMThDNiAxOCAxMy41OTIzIDE3Ljk0NTIgMTcgMTdDMTkuODY1OSAxNi4yMDUxIDI0IDE0IDI0IDE0QzI0IDE0IDI3LjgyMjkgMTYuMTk0NCAzMC41IDE3QzM0LjA3MjIgMTguMDc1IDQyIDE4IDQyIDE4TDQxIDI1QzQxIDI1IDM3IDI3IDM2IDI3QzM1IDI3IDMzIDI1IDMyIDI1QzMxIDI1IDI4LjUgMjggMjggMjhDMjcuNSAyOCAyNSAyNSAyNCAyNUMyMyAyNSAyMSAyOC41IDIwIDI4LjVDMTkgMjguNSAxNyAyNSAxNiAyNUMxNS44MDIgMjUgMTUuNTI1NyAyNS4wNzg0IDE1LjIwOTggMjUuMjA0MUMxMy4wNjgxIDI2LjA1NjQgMTAuNzIxNCAyNi40ODg1IDguNTgxMTUgMjUuNjMyNUw3IDI1TDYgMThaIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI0IDVWMTUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzYgMTFWNC45OTk5OUMzNiA0Ljk5OTk5IDM0LjUgNy45OTk5OSAzMCA0Ljk5OTk5QzI1LjUgMS45OTk5OSAyNCA0Ljk5OTk5IDI0IDQuOTk5OTlWMTFDMjQgMTEgMjUuNSA3Ljk5OTk5IDMwIDExQzM0LjUgMTQgMzYgMTEgMzYgMTFaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'
        break;
      case 3:
        typeText = '基础设施'

        iconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDRINDQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSI4IiB5PSI0IiB3aWR0aD0iMzIiIGhlaWdodD0iNDAiIHJ4PSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMCAzMkgyOFY0NEgyMFYzMloiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTUgMTJMMTcgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMTUgMThMMTcgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjMgMTJMMjUgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjMgMThMMjUgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzEgMTJMMzMgMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzEgMThMMzMgMTgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNCA0NEg0NCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yOCAzMkgzMEMzMC41NTIzIDMyIDMxLjAwOTggMzEuNTQ4IDMwLjkwNDQgMzEuMDA1OEMzMC4zNTE3IDI4LjE2NTMgMjcuNDcwOSAyNiAyNCAyNkMyMC41MjkxIDI2IDE3LjY0ODMgMjguMTY1MyAxNy4wOTU2IDMxLjAwNThDMTYuOTkwMiAzMS41NDggMTcuNDQ3NyAzMiAxOCAzMkgyMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
        break;

      default:
        break;
    }

    starsDiv += '</div>'
    const content = [];

    const title = `<div style="min-width:150px;font-weight:700">${Name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(地物代号:<span style="color:red">${PlaceCode}</span>)</div>`
    if (Image1Url !== '' && Image2Url !== '') {
      content.push(`<div><img src="${Image1Url}"style="width:120px;height:80px;border:1px black solid" /><img src="${Image2Url}"style="width:120px;height:80px;border:1px black solid" /></div>`);
    }
    else if (Image1Url !== '' && Image2Url === '') {
      content.push(`<img src="${Image1Url}"style="width:180px;height:120px;border:1px black solid" />`);
    }
    else if (Image1Url === '' && Image2Url !== '') {
      content.push(`<img src="${Image2Url}"style="width:180px;height:120px;border:1px black solid" />`);
    }
    content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">类型:<span style="font-size:16px;font-weight:700;">${typeText}</span><img src=${iconUrl} style="width:30px;height:30px;margin-left:20px" /></div>`)
    content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">评分:<span style="font-size:18px;font-weight:700;color:red;margin-right:20px">${Score}</span> ${starsDiv}</div>`);
    content.push(`<span style="font-size:16px">详细地址: ${Address}</span>`);
    content.push(`<span style="font-size:16px">联系电话: ${Number}</span>`);
    content.push(`<span style="font-size:16px">推荐人:<span style="font-weight:700;font-size:16px">
    ${studentName}</span></span>`);
    content.push(`<span style="font-size:16px">推荐语: <span style="color:red;font-size:14px">${FounderComment}</span></span>`);
    var newPlaceInfoWindow = new AMap.InfoWindow({
      isCustom: true,  //使用自定义窗体
      content: createPlaceInfoWindow(title, content.join("<br/>"), [Longitude, Latitude], PlaceCode, CommentNumber),
      offset: new AMap.Pixel(16, -45)
    });
    const lng = Longitude
    const lat = Latitude
    const PlaceMarker = new AMap.Marker({
      position: [lng, lat],
      map: map,
      icon: iconUrl,
    });
    PlaceMarker.setLabel({
      offset: new AMap.Pixel(-25, -25),
      content: `<span style='color:black;font-weight:600;text-align:center;'>${Name}</span><span style='font-weight:400'></span>`
    });

    map.add(PlaceMarker)
    const Marker = new AMap.Marker({
      position: userPosition,
      map: map,
      zindex: 101,
      icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNCAxNEMyNi43NjE0IDE0IDI5IDExLjc2MTQgMjkgOUMyOSA2LjIzODU4IDI2Ljc2MTQgNCAyNCA0QzIxLjIzODYgNCAxOSA2LjIzODU4IDE5IDlDMTkgMTEuNzYxNCAyMS4yMzg2IDE0IDI0IDE0WiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNyAyMEgyMUMyMC4wNzEzIDIwIDE5LjYwNyAyMCAxOS4yMTU5IDIwLjAzODVDMTUuNDE3NiAyMC40MTI2IDEyLjQxMjYgMjMuNDE3NiAxMi4wMzg1IDI3LjIxNTlDMTIgMjcuNjA3IDEyIDI4LjA3MTMgMTIgMjlIMzZDMzYgMjguMDcxMyAzNiAyNy42MDcgMzUuOTYxNSAyNy4yMTU5QzM1LjU4NzQgMjMuNDE3NiAzMi41ODI0IDIwLjQxMjYgMjguNzg0MSAyMC4wMzg1QzI4LjM5MyAyMCAyNy45Mjg3IDIwIDI3IDIwWiIgZmlsbD0iIzEzRiIgc3Ryb2tlPSIjMTNGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MSAyNi43ODM3QzQyLjkwMTcgMjguMDA3OSA0NCAyOS40NTI3IDQ0IDMxQzQ0IDM1LjQxODMgMzUuMDQ1NyAzOSAyNCAzOUMxMi45NTQzIDM5IDQgMzUuNDE4MyA0IDMxQzQgMjkuNDUyNyA1LjA5ODI3IDI4LjAwNzkgNyAyNi43ODM3IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE5IDM0TDI0IDM5TDE5IDQ0IiBzdHJva2U9IiMxM0YiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
    });
    Marker.setLabel({
      offset: new AMap.Pixel(-15, -25),
      zindex: 101,
      content: "<span style='color:red;font-weight:600;text-align:center;'>我的位置</span>"
    });
    setMyMarker(Marker)
    AMap.event.addListener(PlaceMarker, 'click', function () {
      newPlaceInfoWindow.open(map, PlaceMarker.getPosition());
      map.setZoom(18)
    });
    if (isPhone) {
      map.setCenter([lng - 0.0005, lat + 0.0003]);
    } else {
      map.setCenter([lng + 0.0001, lat + 0.00015]);
    }
    newPlaceInfoWindow.open(map, PlaceMarker.getPosition());
    map.setZoom(18)
  }
  useEffect(() => {
    if (chatPlaceInfo.PlaceCode) {
      showPlace(chatPlaceInfo)
    }
  }, [chatPlaceInfo])

  useEffect(() => {
    if (previewPlaceMessage.placeName === undefined) {
      return
    }

    map = new AMap.Map('container', {
      zoom: 15, //缩放级别
      center: placePosition,
      resizeEnable: true,
      // layers: [new AMap.TileLayer.Satellite()],  //设置图层,可设置成包含一个或多个图层的数组
      // mapStyle: 'amap://styles/whitesmoke',  //设置地图的显示样式
      viewMode: '3D',  //设置地图模式
      pitch: 0,//地图仰角设定
      lang: 'zh_cn',  //设置地图语言类型
    });

    //构建自定义信息窗体


    const { placeName,
      address,
      comment,
      phoneNumber,
      type,
      score,
      image1Url,
      image2Url,
    } = previewPlaceMessage

    function closeInfoWindow() {
      map.clearInfoWindow();
      setPreviewPlaceMessage({})
      map.on('click', function (ev) {
        // 触发事件的对象
        var target = ev.target;
        // 触发事件的地理坐标，AMap.LngLat 类型
        var lnglat = ev.lnglat;
        // 触发事件的像素坐标，AMap.Pixel 类型
        var pixel = ev.pixel;
        // 触发事件类型
        var type = ev.type;
        setMyMarkerPosition([lnglat.lng, lnglat.lat])
        setPlacePosition([lnglat.lng, lnglat.lat])
      });
    }

    let typeText = ''
    let imgUrl = ''
    let darkStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let lightStar = `<img style="width:15px;height:15px;" src="data:image/png;base64,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" />`
    let starsDiv = '<div style="width:60px;height:12px;display:flex;align-items: center;justify-content:flex-start">'
    if (type === 1) {
      typeText = '美食'
      imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0xNCA0VjQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTggNVYxNUM4IDIwIDE0IDIwIDE0IDIwQzE0IDIwIDIwIDIwIDIwIDE1VjUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzAgMTJDMzAgNCAzOCA0IDM4IDRWMjFIMzBWMTJaIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTM4IDIxSDMwVjEyQzMwIDQgMzggNCAzOCA0VjIxWk0zOCAyMVY0NCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
    } else if (type === 2) {
      typeText = '娱乐'
      imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05IDQ0TDI0IDIyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTM5IDQ0TDI0IDIyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTkuMTMyMTcgMjRDOS4wNDUgMjMuMzQ1NyA5IDIyLjY3ODEgOSAyMkM5IDE5Ljg2NjcgOS40NDUzNCAxNy44Mzc0IDEwLjI0ODEgMTZDMTAuMzI4NSAxNS44MTYgMTAuNDEyNSAxNS42MzM5IDEwLjUgMTUuNDUzOCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTEuMTU2NyAyOS43NTMxQzEzLjI4ODggMzMuMjc3NCAxNi44MzA1IDM1Ljg1MzUgMjEuMDAwMiAzNi42OTk5IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yNyAzNi42OTk5QzMxLjIxNDEgMzUuODQ0NSAzNC43ODY2IDMzLjIyMjUgMzYuOTExIDI5LjY0MDUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTM4Ljg2NzggMjRDMzguOTU1IDIzLjM0NTcgMzkgMjIuNjc4MSAzOSAyMkMzOSAxOS42NTMgMzguNDYxIDE3LjQzMiAzNy41IDE1LjQ1MzgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTI3IDcuMzAwMDZDMjkuNjU1MyA3LjgzOTA2IDMyLjA1NTkgOS4wNzk0NiAzNCAxMC44MTk1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMS4wMDAxIDcuMzAwMDZDMTguMzQ0OCA3LjgzOTA2IDE1Ljk0NDIgOS4wNzk0NiAxNC4wMDAxIDEwLjgxOTVDMTMuNzg5OSAxMS4wMDc2IDEzLjU4NSAxMS4yMDE2IDEzLjM4NTcgMTEuNDAxMiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjI3IiByPSIzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMzciIHI9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMjQiIGN5PSI3IiByPSIzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMzYiIGN5PSIxMyIgcj0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI3IiByPSIzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMjIiIHI9IjQiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNNiA0NEwxNCA0NCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zNCA0NEw0MiA0NCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=='
    } else {
      typeText = '基础设施'
      imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik00IDQySDQ0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHJlY3QgeD0iOCIgeT0iMjIiIHdpZHRoPSIxMiIgaGVpZ2h0PSIyMCIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHJlY3QgeD0iMjAiIHk9IjQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIzOCIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI4IDMyLjAwODNIMzIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTIgMzIuMDA4M0gxNiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yOCAyMy4wMDgzSDMyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI4IDE0LjAwODNIMzIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='
    }
    for (let i = 1; i < 6; i++) {
      if (i <= score) {
        starsDiv += lightStar
      } else {
        starsDiv += darkStar
      }
    }
    starsDiv += '</div>'
    const content = [];

    const title = `<div style="min-width:150px;font-weight:700">${placeName}</div>`
    if (image1Url !== '' && image2Url !== '') {
      content.push(`<div><img src="${image1Url}"style="width:120px;height:80px;border:1px black solid" /><img src="${image2Url}"style="width:120px;height:80px;border:1px black solid" /></div>`);
    }
    else if (image1Url !== '' && image2Url === '') {
      content.push(`<img src="${image1Url}"style="width:180px;height:120px;border:1px black solid" />`);
    }
    else if (image1Url === '' && image2Url !== '') {
      content.push(`<img src="${image2Url}"style="width:180px;height:120px;border:1px black solid" />`);
    }
    content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">类型:<span style="font-size:16px;font-weight:700;">${typeText}</span><img src=${imgUrl} style="width:30px;height:30px;margin-left:20px" /></div>`)
    content.push(`<div style="font-size:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start">评分:<span style="font-size:18px;font-weight:700;color:red;margin-right:20px">${score}</span> ${starsDiv}</div>`);
    content.push(`<span style="font-size:16px">详细地址: ${address}</span>`);
    content.push(`<span style="font-size:16px">联系电话: ${phoneNumber}</span>`);
    content.push(`<span style="font-size:16px">推荐人:<span style="font-weight:700;font-size:16px">
    ${studentName}</span></span>`);
    content.push(`<span style="font-size:16px">推荐语: <span style="color:red;font-size:14px">${comment}</span></span>`);
    var newPlaceInfoWindow = new AMap.InfoWindow({
      isCustom: true,  //使用自定义窗体
      content: createInfoWindow(title, content.join("<br/>"), closeInfoWindow),
      offset: new AMap.Pixel(16, -45)
    });
    const icon = new AMap.Icon({
      image: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik00IDEySDQ0VjIwTDQyLjYwMTUgMjAuODM5MUM0MC4zODQ3IDIyLjE2OTIgMzcuNjE1MyAyMi4xNjkyIDM1LjM5ODUgMjAuODM5MUwzNCAyMEwzMi42MDE1IDIwLjgzOTFDMzAuMzg0NyAyMi4xNjkyIDI3LjYxNTMgMjIuMTY5MiAyNS4zOTg1IDIwLjgzOTFMMjQgMjBMMjIuNjAxNSAyMC44MzkxQzIwLjM4NDcgMjIuMTY5MiAxNy42MTUzIDIyLjE2OTIgMTUuMzk4NSAyMC44MzkxTDE0IDIwTDEyLjYwMTUgMjAuODM5MUMxMC4zODQ3IDIyLjE2OTIgNy42MTUzMSAyMi4xNjkyIDUuMzk4NTMgMjAuODM5MUw0IDIwVjEyWiIgZmlsbD0iIzAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik04IDIyLjQ4ODlWNDRINDBWMjIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNOCAxMS44MjIyVjRINDBWMTIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSIxOSIgeT0iMzIiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMiIgZmlsbD0iIzAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
      size: new AMap.Size(24, 24)
    });
    const Marker = new AMap.Marker({
      position: placePosition,
      map,
      icon
    });
    Marker.setLabel({
      offset: new AMap.Pixel(30, 5),
      content: "<span style='color:red;font-weight:600;text-align:center;'>地物位置</span>"
    });
    map.add(Marker)
    newPlaceInfoWindow.open(map, placePosition);
    map.setCenter([placePosition[0], placePosition[1] + 0.001]);
    map.setZoom(18)
    map.setPitch(60)
    setMyMapObj(map)
    setPlaceMarker(Marker)


  }, [previewPlaceMessage, placePosition, isPhone])

  useEffect(() => {
    if (placeInfoList && placeInfoList.length > 0) {
      const AMap = window.AMap
      map = new AMap.Map('container', {
        zoom: 15, //缩放级别
        center: userPosition,
        resizeEnable: true,
        // layers: [new AMap.TileLayer.Satellite()],  //设置图层,可设置成包含一个或多个图层的数组
        // mapStyle: 'amap://styles/whitesmoke',  //设置地图的显示样式
        viewMode: '3D',  //设置地图模式
        pitch: 0,//地图仰角设定
        lang: 'zh_cn',  //设置地图语言类型
      });

      setMyMapObj(map)
      getPlaceMarker(placeInfoList)
    }
  }, [placeInfoList, userPosition])
  return (
    <div className="map-container" onClick={() => {
      isPositionMode && addMarker()
      isAddPlaceMode && addPlaceMarker()
    }}>

      {isDrivePanelShow && <div className="drive-friend-panel">
        <div className="drive-friend-close" onClick={() => {
          location.reload()
        }}>❌</div>
        <div className="drive-friend-panel-title">正在去找{friendName},距Ta约{driveRoute.distance / 1000}千米</div>
        {driveRoute.steps && driveRoute.steps.map((item, index) => {
          return <div className="drive-friend-instruction" key={item.instruction}>{index}:{item.instruction}</div>
        })}
      </div>}
      {isLoading && <div className="loading">路径计算中...</div>}
      <div className={openTools ? "box" : "box-hide"}>
        {isDrive && <div className="drive-panel">
          <div className="panel-title">导航面板
            <span className="panel-close" onClick={() => {
              setIsDrive(false)
              initMap()
            }}>❌</span>
            {panelState > 0 && <span className="panel-prev" onClick={() => {
              setPanelState(panelState - 1)
            }}>{"<"}</span>}

          </div>
          {panelRouter()}
        </div>}
        {/* <h2 className="welcome">🌺欢迎各位老师参加毕业答辩🌺</h2> */}
        {isPhone ?
          <div className="module-box-phone">
            <div className="first-line">
              <button className="new">新校区</button>
              <button className="west">西校区</button>
              <button className="east">东校区</button>
              <button className="north">北校区</button>
            </div>
            <div className="second-line">
              <button className="distance">距离测量</button>
              <button className="area">面积测量</button>
              <button className="drive" onClick={() => { setIsDrive(true) }}>校区导航</button>
              <button className="tool">关闭工具</button>
            </div>
          </div>
          : <div className={"module-box"}>
            <button className="new">新校区</button>
            <button className="west">西校区</button>
            <button className="east">东校区</button>
            <button className="north">北校区</button>
            <button className="distance">距离测量</button>
            <button className="area">面积测量</button>
            <button className="drive" onClick={() => { setIsDrive(true) }}>校区导航</button>
            <button className="tool">关闭工具</button>
          </div>}

        <div className="info"></div>
      </div>
      {isPositionMode && <div className="position-box">
        <div className="position-mode-title">
          <span style={{ color: "red", fontSize: 23 }}>
            请点击地图选择你的位置
          </span>
        </div>
        <div className="position-mode-title">
          你目前的位置是
        </div>
        <div className="position-mode-title">
          经度
          <span style={{ color: "red", fontSize: 23 }}>
            {myMarkerPosition[0] === 0 ? userPosition[0] : myMarkerPosition[0]}
          </span>
        </div><div className="position-mode-title">
          纬度
          <span style={{ color: "red", fontSize: 23 }}>
            {myMarkerPosition[1] === 0 ? userPosition[1] : myMarkerPosition[1]}
          </span>
        </div>
        <div className="position-mode-title">更改个性签名(可不填 最多50字)</div>
        <div className="position-mode-title">
          <label htmlFor="signature">个性签名:</label>
          <input style={{ marginLeft: 20, height: 20, width: 150, fontSize: 18 }} placeholder="快来更改你的个性签名吧！" type="text" id="signature" value={signature}
            onChange={event => {
              setSignature(event.target.value)
            }} /></div>
      </div>}
      <div id="container"></div>
      <div className="author-box">
        <div className="author">朱宇宸©️CUGMap</div>
      </div>
    </div>
  );

}



export default Map;
