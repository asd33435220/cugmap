import React, { useEffect, useState } from 'react';
import './App.css'
import newJPG from './image/new.jpg'
import oldJPG from './image/old.jpg'


function App() {
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
    const h1 = document.querySelector('.welcome')
    const author = document.querySelector('.author')
    const colorList = ["red", "green", "yellow", "cyan","hotpink"]
    let i = 0
    setInterval(() => {
      h1.style.color = colorList[i]
      author.style.color = colorList[i]
      i++
      i = i % 4
    }, 300)
  }, [])
  function initMap() {
    map = new window.AMap.Map('container', {
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
      console.log("lnglat=", lnglat);
      // 触发事件的像素坐标，AMap.Pixel 类型
      var pixel = ev.pixel;
      // 触发事件类型
      var type = ev.type;
    });
    initMarker()
    initPlugin()
    initEvent()
    setPanelState(0)
  }
  function initMarker() {
    const AMap = window.AMap
    newMarker = new AMap.Marker({
      position: newPosition,
      title: '新校区',
      map: map,
      // content:'<div class="marker-route marker-marker-bus-from">新</div>'
    });
    westMarker = new AMap.Marker({
      position: westPosition,
      map: map,
      title: '西校区'
    });
    eastMarker = new AMap.Marker({
      position: eastPosition,
      map: map,
      title: '东校区'
    });
    northMarker = new AMap.Marker({
      position: northPosition,
      map: map,
      title: '北校区'
    });
    map.add([newMarker, westMarker, northMarker, eastMarker]);
    // map.setFitView();
  }
  function initEvent() {
    console.log("initEvent");

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
      console.log("here");
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
      console.log("currentCenter=", currentCenter);
    })
    westBtn.addEventListener('click', () => {
      map.setCenter(westPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
      console.log("currentCenter=", currentCenter);
    })
    eastBtn.addEventListener('click', () => {
      map.setCenter(eastPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
      console.log("currentCenter=", currentCenter);
    })
    northBtn.addEventListener('click', () => {
      map.setCenter(northPosition);
      map.setZoom(18)
      map.setPitch(60)
      let currentCenter = map.getCenter();
      console.log("currentCenter=", currentCenter);
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
        content: createInfoWindow(title, content.join("<br/>")),
        offset: new AMap.Pixel(16, -45)
      });
      return infoWindow
    }

    //构建自定义信息窗体
    function createInfoWindow(title, content) {
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

    //关闭信息窗体
    function closeInfoWindow() {
      map.clearInfoWindow();
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
          console.log("here");
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
      console.log("transfer");

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
            <div className="drive-path" key={item.instruction}>{index+1}:{item.instruction}</div>
            )
          })}
        </div>

      </>

      )
    }
  }
  return (
    <>
      {isLoading && <div className="loading">路径计算中...</div>}
      <div className="box">
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
        <h2 className="welcome">🌺欢迎各位老师参加毕业答辩🌺</h2>
        {/* <h2 className="title">朱宇宸的毕业设计</h2> */}
        <div className="module-box">
          <button className="new">新校区</button>
          <button className="west">西校区</button>
          <button className="east">东校区</button>
          <button className="north">北校区</button>
        </div>
        <div className="tool-box">
          <button className="distance">距离测量</button>
          <button className="area">面积测量</button>
          <button className="drive" onClick={() => { setIsDrive(true) }}>校区导航</button>
          <button className="tool">关闭工具</button>
        </div>
        <div className="info"></div>
      </div>
      <div id="container"></div>
      <div className="author-box">
        <div className="author">朱宇宸©️CUGMap</div>
      </div>

    </>
  );

}



export default App;