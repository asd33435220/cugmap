import React, { Component, useState, useEffect } from 'react';
import LOGO from './images/logo.jpeg';
import './NavBar.scss';

function NavBar(props) {
    const { openTools, isPositionMode, setIsPositionMode, setOpenTools, myMarkerPosition } = props
    const isMap = window.location.pathname === "/"

    const [isPhone, setIsPhone] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isMore, setIsMore] = useState(false)
    const [studentId, setStudentId] = useState("")
    const [studentName, setStudentName] = useState("")
    function getToken() {
        React.$http.get('/token')
            .then(res => {
                console.log(res);
                if (res.data.with_token && !isLogin) {
                    setIsLogin(true);
                    setStudentId(res.data.student_id)
                    setStudentName(res.data.student_name)
                } else if (isLogin) {
                    setIsLogin(false);
                    setStudentId("")
                    setStudentName("")
                    const pathname = window.location.pathname
                    const isRedirect = pathname === "/position" || pathname === "/message"
                    console.log("isRedirect", isRedirect);
                    if (isRedirect) window.location = "/"
                } else {
                    const pathname = window.location.pathname
                    const isRedirect = pathname === "/position" || pathname === "/message"
                    console.log("isRedirect", isRedirect);
                    if (isRedirect) window.location = "/"
                }
            })
    }
    useEffect(() => {
        if (window.location.pathname === "/position") {
            console.log('here');
            setIsPositionMode(true)
            setOpenTools(false)
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
        const res = await React.$http.get('/user/update/position', {
            params: {
                longitude: myMarkerPosition[0],
                latitude: myMarkerPosition[1],
            }
        })
        console.log(res);
    }
    window.addEventListener('resize', event => {
        if (document.body.clientWidth < 1000 && !isPhone) {
            setIsPhone(true)
        }
        if (document.body.clientWidth > 1000 && isPhone) {
            setIsPhone(false)
        }
    })

    return (
        <div className="nav-container" >
            <img src={LOGO} className="nav-logo" onClick={() => {
                window.open("https://www.cug.edu.cn/", '_blank')
            }} />
            <div className="nav-main-text">地大地图</div>
            {isLogin && studentName !== "" &&
                <div className="nav-welcome"><span style={{ color: "red", fontSize: 20 }}>欢迎回来</span>{studentName}
                </div>
            }
            {
                !isMap && <div className="nav-right-goback">
                    <div className="nav-right-button" onClick={() => {
                        window.location = "/"
                    }}>回到地图
                </div>
                    {isPositionMode && <div className="nav-right-button" onClick={() => {
                        handleChangePosition()
                    }}>保存我的位置
                </div>}
                </div>
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
                                            if (isLogin) {
                                                window.location = "/message"
                                            } else {
                                                window.location = "/register"
                                            }
                                        }}>{isLogin ? '查看我的私信' : '注册'}</div>
                                    <div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            if (isLogin) {
                                                window.location = "/position"
                                                setIsPositionMode(true)
                                            } else {
                                                window.location = "/login"
                                            }
                                        }}
                                    >{isLogin ? '修改我的位置' : '登陆'}</div>

                                    <div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            setOpenTools(!openTools)
                                        }}> {openTools ? "关闭" : "打开"}工具栏</div>
                                    {<div className="nav-right-phone-more-pannel-line"
                                        onClick={() => {
                                            handleLogout()
                                        }}> {isLogin ? "退出登陆" : "尽情期待"}</div>}
                                </div>
                            )}
                        </div>
                    ) : (
                            <div className="nav-right">
                                <div className="nav-right-button" onClick={() => {
                                    if (isLogin) {
                                        window.location = "/message"
                                    } else {
                                        window.location = "/register"
                                    }
                                }}>{isLogin ? '查看私信' : '注册'}</div>
                                <div className="nav-right-button"
                                    onClick={() => {
                                        if (isLogin) {
                                            window.location = "/position"
                                            setIsPositionMode(true)

                                        } else {
                                            window.location = "/login"
                                        }
                                    }}
                                >{isLogin ? '修改位置' : '登陆'}</div>
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
