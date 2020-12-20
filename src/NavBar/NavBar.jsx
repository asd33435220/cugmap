import React, { Component, useState, useEffect } from 'react';
import LOGO from './images/logo.jpeg';
import './NavBar.scss';

function NavBar(props) {
    const { openTools, setOpenTools } = props
    const isMap = window.location.pathname === "/"

    const [isPhone, setIsPhone] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isMore, setIsMore] = useState(false)
    useEffect(() => {
        React.$http.get('http://localhost:9999/token')
            .then(res => {
                console.log(res);
            })
        if (document.body.clientWidth < 600) {
            setIsPhone(true)
        }
    }, [])
    const getUserInfo = () => {
        // let info = document.cookie
        // console.log(info);
    }
    window.addEventListener('resize', event => {
        if (document.body.clientWidth < 600 && !isPhone) {
            setIsPhone(true)
        }
        if (document.body.clientWidth > 600 && isPhone) {
            setIsPhone(false)
        }
    })

    return (
        <div className="nav-container" >
            <img src={LOGO} className="nav-logo" onClick={() => {
                window.open("https://www.cug.edu.cn/", '_blank')
            }} />
            <div className="nav-main-text">地大地图</div>
            {!isMap && <div className="nav-right-goback">
                <div className="nav-right-button" onClick={() => {
                    window.location = "/"
                }}>回到地图
                </div>
            </div>}
            {isMap && <>
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
                                        } else {
                                            window.location = "/login"
                                        }
                                    }}
                                >{isLogin ? '修改我的位置' : '登陆'}</div>
                                <div className="nav-right-phone-more-pannel-line"
                                    onClick={() => {
                                        setOpenTools(!openTools)
                                    }}> {openTools ? "关闭" : "打开"}工具栏</div>
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
                                    } else {
                                        window.location = "/login"
                                    }
                                }}
                            >{isLogin ? '修改位置信息' : '登陆'}</div>
                            <div className="nav-right-button" onClick={() => {
                                setOpenTools(!openTools)
                            }}> {openTools ? "关闭" : "打开"}工具栏</div>
                        </div>
                    )
                }
            </>}
        </div >
    );
}

export default NavBar;
