import React, { Component, useState, useEffect } from 'react';
import LOGO from './images/logo.jpeg';
import './NavBar.scss';

function NavBar(props) {
    const {
        openTools,
        isPositionMode,
        setIsPositionMode,
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
    }
        = props
    const isMap = window.location.pathname === "/"
    const [isPhone, setIsPhone] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isMore, setIsMore] = useState(false)
    const [isPanelShow, setIsPanelShow] = useState(false)
    const [panelMessage, setPanelMessage] = useState("")
    const [isMessageBoxShow, setIsMessageBoxShow] = useState(false)
    const [myMessageList, setMyMessageList] = useState([])

    async function getMyMessage() {
        const res = await React.$http.get("/message/mymessage")
        console.log("message", res);
        const messageList = res.data.message_list && res.data.message_list.reverse()
        setMyMessageList(messageList)
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
            setIsPanelShow(true)
            setPanelMessage(res.data.message)
            setTimeout(() => {
                setIsGamMode(false)
                setIsPositionMode(true)
                window.location = "/position"
            }, 2000)
        }
        setIsPanelShow(true)
        setPanelMessage("已经为你匹配附近的校友,快给他们留言吧!")
        setIsMessageBoxShow(true)
        getMyMessage()
        setUserPosition([res.data.user_lng, res.data.user_lat])
        setNearbyUserList(res.data.user_list);
        setTimeout(() => {
            setIsPanelShow(false)
        }, 2000)

    }
    useEffect(() => {
        const pathname = window.location.pathname
        if (pathname === "/position") {
            setIsPositionMode(true)
            setOpenTools(false)
            setNearbyUserList([])
            setIsMessageBoxShow(false)
        } else if (pathname === "/gam") {
            setIsGamMode(true)
            setOpenTools(false)
            getPosition()
            getMyMessage()
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
            setPanelMessage(res.data.message + ",即将跳转社交模式,快跟附近的校友聊天吧！")
            setTimeout(() => {
                window.location = "/gam"
                setIsMessageBoxShow(true)
                getMyMessage()
            }, 2000)
        } else {
            setPanelMessage(res.data.message + "，请重试")
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
            {isMessageBoxShow && <div className="nav-chat-message-box">
                <div className="nav-chat-message-title">{myMessageList ? "消息列表" : "还没有消息"}</div>
                {myMessageList && myMessageList.map((item, index) => {
                    return <div className="nav-chat-message-container" key={item.SendTime}>
                        <div className="nav-chat-list-name" onClick={() => {
                            getFriendInfo(item.SenderId)
                        }}>
                            <span className="nav-chat-list-username">{item.SenderName}</span>
                            给你留言:</div>
                        <div className="nav-chat-list-message">{item.Message}</div>
                        <div className="nav-chat-list-time">{item.SendTime}</div>

                    </div>
                })}
            </div>}
            {isPanelShow && <div className="nav-panel">{panelMessage}</div>}
            <img src={LOGO} className="nav-logo" style={{marginLeft:isPhone?5:40}} onClick={() => {
                window.open("https://www.cug.edu.cn/", '_blank')
            }} />
            {!(isPhone && isLogin) && <div className="nav-main-text">地大地图</div>}
            {isLogin && studentName !== "" &&
                <div className="nav-welcome" style={{marginLeft:isPhone?5:40}}>
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
                                        <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                window.location = "/"
                                                setIsMore(false)
                                            }}>回到地图</div>
                                        {isPositionMode && <div className="nav-right-phone-more-pannel-line"
                                            onClick={() => {
                                                handleChangePosition()
                                                setIsMore(false)
                                            }}>保存我的信息
                                        </div>}
                                        {/* <div className="nav-right-phone-more-pannel-line"></div> */}
                                        <div className="nav-right-phone-more-pannel-line"></div>
                                    </div>
                                )}
                            </div>

                        ) : (
                                <div className="nav-right-goback">
                                    <div className="nav-right-button" onClick={() => {
                                        window.location = "/"
                                    }}>回到地图
                                </div>
                                    {isPositionMode && <div className="nav-right-button" onClick={() => {
                                        handleChangePosition()
                                    }}>保存我的信息
                                </div>}
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
                                    {<div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            setIsMore(false)
                                            handleLogout()
                                        }}> {isLogin ? "退出登陆" : "尽情期待"}</div>}
                                </div>
                            )}
                        </div>
                    ) : (
                            <div className="nav-right">
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
