import React, { Component, useState, useEffect } from 'react';
import LOGO from './images/logo.jpeg';
import MessageBox from '../MessageBox/MessageBox'
import PlaceBox from '../PlaceBox/PlaceBox'
import './NavBar.scss';

function NavBar(props) {
    const {
        openTools,
        isPositionMode,
        setIsPositionMode,
        isFunMode,
        setIsFunMode,
        setOpenTools,
        myMarkerPosition,
        isGamMode,
        setIsGamMode,
        setNearbyUserList,
        nearbyUserList,
        setUserPosition,
        studentId,
        setStudentId,
        studentName,
        setStudentName,
        signature,
        userPosition,
        setSignature,
        myMapObj,
        receiverInfo,
        setReceiverInfo,
        isPhone,
        setIsPhone,
        isAddPlaceMode,
        setIsAddPlaceMode,
        placePosition,
        previewPlaceMessage,
        setPreviewPlaceMessage,
    }
        = props
    const isMap = window.location.pathname === "/"
    const [isLogin, setIsLogin] = useState(false)
    const [isMore, setIsMore] = useState(false)
    const [isPanelShow, setIsPanelShow] = useState(false)
    const [panelMessage, setPanelMessage] = useState("")
    const [isMessageBoxShow, setIsMessageBoxShow] = useState(false)

    const showToast = (message, time=2000, url) => {
        setPanelMessage(message)
        setIsPanelShow(true)
        setTimeout(() => {
            url && (window.location = url)
            setPanelMessage('')
            setIsPanelShow(false)
        }, time)
    }

    function getToken() {
        React.$http.get('/token')
            .then(res => {
                console.log(res);
                console.log("isLogin", isLogin);
                if (res.data.with_token && !isLogin) {
                    setIsLogin(true);
                    setStudentId(res.data.student_id)
                    setStudentName(res.data.student_name)
                    setSignature(res.data.signature)
                    if (res.data.longitude !== 0 && res.data.latitude !== 0) {
                        const lng = res.data.longitude
                        const lat = res.data.latitude
                        setUserPosition([lng, lat])
                    }
                } else if (isLogin) {
                    setIsLogin(false);
                    setStudentId("")
                    setStudentName("")
                    const pathname = window.location.pathname
                    const isRedirect = pathname === "/position" || pathname === "/message"
                    if (isRedirect) window.location = "/"
                } else {
                    const pathname = window.location.pathname
                    const isRedirect = pathname === "/position" || pathname === "/message"
                    console.log("isRedirect", isRedirect);
                    if (isRedirect) window.location = "/"
                }
            })
    }
    async function getPosition() {
        console.log('heregetPosition');

        const res = await React.$http.get("/user/position")
        console.log("position-res", res);
        if (res.data.code === -2) {
            showToast(res.data.message, 2000, "/position")
        }
        showToast("已经为你匹配附近的校友,快给他们留言吧!", 2000)
        setIsGamMode(true)
        setIsMessageBoxShow(true)
        setUserPosition([res.data.user_lng, res.data.user_lat])
        setNearbyUserList(res.data.user_list);

    }
    useEffect(() => {
        const pathname = window.location.pathname
        if (pathname === "/position") {
            setIsPositionMode(true)
            setOpenTools(true)
            setNearbyUserList([])
            setIsMessageBoxShow(false)
        } else if (pathname === "/gam") {
            setIsGamMode(true)
            setOpenTools(true)
            getPosition()
        } else if (pathname === "/fun") {
            setIsFunMode(true)
            setOpenTools(true)
        } else if (pathname === "/addplace") {
            setIsAddPlaceMode(true)
            setOpenTools(true)
        }
        getToken()
        if (document.body.clientWidth < 1000) {
            setIsPhone(true)
        }
    }, [])
    const handleLogout = () => {
        localStorage.removeItem("token")
        getToken()
    }
    const handleAddPlace = async () => {

    }
    const handleChangePosition = async () => {
        console.log(myMarkerPosition);
        const flag = myMarkerPosition[0] === 0 && myMarkerPosition[1] === 0
        const res = await React.$http.get('/user/update/info', {
            params: {
                longitude: flag ? userPosition[0] : myMarkerPosition[0],
                latitude: flag ? userPosition[1] : myMarkerPosition[1],
                signature: signature,
            }
        })
        console.log(res)
        setIsPanelShow(true)
        setTimeout(() => {
            setIsPanelShow(false)
        }, 2000)
        if (res.data.code === 1) {
            showToast(res.data.message + ",即将跳转社交模式,快跟附近的校友聊天吧！", 2000, "/gam")
        } else {
            showToast(res.data.message + ",请重试", 2000)
        }

    }
    window.addEventListener('resize', event => {
        if (document.body.clientWidth < 1000 && !isPhone) {
            setIsPhone(true)
        }
        if (document.body.clientWidth > 1000 && isPhone) {
            setIsPhone(false)
        }
    })

    const getFriendInfo = async (friend_id) => {
        let flag = false
        nearbyUserList.map(item => {
            if (item.student_id === friend_id) {
                const lng = item.longitude
                const lat = item.latitude
                myMapObj.setCenter([lng, lat])
                myMapObj.setZoom(18)
                myMapObj.setPitch(60)
                flag = true
                return
            }
        })
        if (flag) return
        const res = await React.$http.get("/user/posinfo", {
            params: {
                position: userPosition.join(";"),
                student_id: friend_id
            }
        })
        console.log(res);
        res.data.userinfo.setFocus = true
        const newList = [...nearbyUserList, res.data.userinfo]
        setNearbyUserList(newList)
    }
    return (
        <div className="nav-container" >
            {isMessageBoxShow && <MessageBox
                receiverInfo={receiverInfo}
                setReceiverInfo={setReceiverInfo}
                studentId={studentId}
                getFriendInfo={getFriendInfo}
            />}
            {isAddPlaceMode && <PlaceBox
                previewPlaceMessage={previewPlaceMessage}
                setPreviewPlaceMessage={setPreviewPlaceMessage}
                showToast={showToast}
                isPhone={isPhone}
                placePosition={placePosition} />}
            {isPanelShow && <div className="nav-panel">{panelMessage}</div>}
            <img src={LOGO} className="nav-logo" style={{ marginLeft: isPhone ? 5 : 40 }} onClick={() => {
                window.open("https://www.cug.edu.cn/", '_blank')
            }} />
            {!(isPhone && isLogin) && <div className="nav-main-text">地大地图</div>}
            {isLogin && studentName !== "" &&
                <div className="nav-welcome" style={{ marginLeft: isPhone ? 5 : 40 }}>
                    <div className="nav-username"><span style={{ color: "red", fontSize: 20, margin: 0 }}>欢迎回来</span>{studentName}</div>
                    <div className={"nav-user-signature"} onClick={() => {
                        if (signature === "") window.location = "/position"
                    }}>{signature === "" ? "你还没有个性签名喔，快去更新一下吧！" : signature}</div>
                </div>
            }
            {
                !isMap && (
                    <>
                        {isPhone ? (
                            <div className="nav-right-phone">
                                <div className="nav-right-phone-barbox"
                                    onClick={() => {
                                        setIsMore(!isMore)
                                    }}>
                                    <div className="nav-right-phone-line"></div>
                                    <div className="nav-right-phone-line"></div>
                                    <div className="nav-right-phone-line"></div>
                                </div>
                                {isMore && (
                                    <div className="nav-right-phone-more-pannel">
                                        {isFunMode && <div className="nav-right-phone-more-pannel-line">美食</div>}
                                        {isFunMode && <div className="nav-right-phone-more-pannel-line">娱乐</div>}
                                        {isFunMode && <div className="nav-right-phone-more-pannel-line">基础设施</div>}
                                        {isFunMode && <div className="nav-right-phone-more-pannel-line" onClick={() => {
                                            setIsAddPlaceMode(true)
                                            window.location = "/addplace"
                                        }}>新增地点</div>}
                                        {isAddPlaceMode && <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                handleAddPlace()
                                                setIsMore(false)
                                            }}>保存地点信息
                                        </div>}
                                        {isPositionMode && <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                handleChangePosition()
                                                setIsMore(false)
                                            }}>保存我的信息
                                        </div>}
                                        <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                setIsMore(false)
                                                setOpenTools(!openTools)
                                            }}> {openTools ? "关闭" : "打开"}工具栏</div>
                                        <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                window.location = "/"
                                                setIsMore(false)
                                            }}>回到地图</div>

                                        {/* <div className="nav-right-phone-more-pannel-line"></div> */}
                                        <div className="nav-right-phone-more-pannel-line"></div>
                                    </div>
                                )}
                            </div>

                        ) : (
                            <div className="nav-right-goback">
                                {isFunMode && <div className="nav-right-button">美食</div>}
                                {isFunMode && <div className="nav-right-button">娱乐</div>}
                                {isFunMode && <div className="nav-right-button">基础设施</div>}

                                {isFunMode && <div className="nav-right-button" onClick={() => {
                                    setIsAddPlaceMode(true)
                                    window.location = "/addplace"
                                }}>新增地点</div>}
                                {isAddPlaceMode && <div className="nav-right-button"
                                    onClick={() => {
                                        handleAddPlace()
                                        setIsMore(false)
                                    }}>保存地点信息
                                        </div>}
                                {isPositionMode && <div className="nav-right-button" onClick={() => {
                                    handleChangePosition()
                                }}>保存我的信息
                                </div>}
                                <div className="nav-right-button"
                                    onClick={() => {
                                        setIsMore(false)
                                        setOpenTools(!openTools)
                                    }}> {openTools ? "关闭" : "打开"}工具栏</div>
                                <div className="nav-right-button" onClick={() => {
                                    window.location = "/"
                                }}>回到地图
                                </div>

                            </div>
                        )}
                    </>
                )
            }
            {
                isMap && <>
                    {isPhone ? (
                        <div className="nav-right-phone">
                            <div className="nav-right-phone-barbox"
                                onClick={() => {
                                    setIsMore(!isMore)
                                }}>
                                <div className="nav-right-phone-line"></div>
                                <div className="nav-right-phone-line"></div>
                                <div className="nav-right-phone-line"></div>
                            </div>
                            {isMore && (
                                <div className="nav-right-phone-more-pannel">
                                    {isLogin && <div className="nav-right-phone-more-pannel-line" onClick={() => {
                                        window.location = "/fun"
                                        setIsFunMode(true)
                                    }}> 吃喝玩乐</div>}
                                    <div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            setIsMore(false)
                                            if (isLogin) {
                                                if (userPosition[0] !== 0 && userPosition[0] !== 0) {
                                                    window.location = "/gam"
                                                    setIsGamMode(true)
                                                } else {
                                                    setIsPanelShow(true)
                                                    setPanelMessage("你需要先补充位置信息，才能开始社交喔！")
                                                    setTimeout(() => {
                                                        window.location = "/position"
                                                    }, 2000)
                                                }
                                            } else {
                                                window.location = "/register"
                                            }
                                        }}>{isLogin ? '我的社交' : '注册'}</div>
                                    <div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            setIsMore(false)
                                            if (isLogin) {
                                                window.location = "/position"
                                                setIsPositionMode(true)
                                            } else {
                                                window.location = "/login"
                                            }
                                        }}
                                    >{isLogin ? '修改我的信息' : '登陆'}</div>

                                    <div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            setIsMore(false)
                                            setOpenTools(!openTools)
                                        }}> {openTools ? "关闭" : "打开"}工具栏</div>

                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="nav-right">
                            {isLogin && <div className="nav-right-button" onClick={() => {
                                window.location = "/fun"
                                setIsFunMode(true)
                            }}> 吃喝玩乐</div>}
                            <div className="nav-right-button" onClick={() => {
                                if (isLogin) {
                                    if (userPosition[0] !== 0 && userPosition[0] !== 0) {
                                        window.location = "/gam"
                                        setIsGamMode(true)
                                    } else {
                                        window.location = "/position"
                                    }
                                } else {
                                    window.location = "/register"
                                }
                            }}>{isLogin ? '我的社交' : '注册'}</div>
                            <div className="nav-right-button"
                                onClick={() => {
                                    if (isLogin) {
                                        window.location = "/position"
                                        setIsPositionMode(true)

                                    } else {
                                        window.location = "/login"
                                    }
                                }}
                            >{isLogin ? '修改信息' : '登陆'}</div>
                            <div className="nav-right-button" onClick={() => {
                                setOpenTools(!openTools)
                            }}> {openTools ? "关闭" : "打开"}工具栏</div>
                            {isLogin && <div className="nav-right-button" onClick={() => {
                                handleLogout()
                            }}> 退出登陆</div>}

                        </div>
                    )
                    }
                </>
            }
        </div >
    );
}

export default NavBar;
