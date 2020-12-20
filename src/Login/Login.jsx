import React, { Component, useState } from 'react';
import './Login.scss'

function Login() {
    const [studentId, setStudentId] = useState('')
    const [studentPassword, setStudentPassword] = useState('')
    const [isAfterLogin, setIsAfterLogin] = useState(false)
    const [loginMessage, setLoginMessage] = useState('')
    async function handleLogin() {
        const form = {
            student_id: studentId,
            password: studentPassword,
        }
        const data = React.$qs.stringify(form)
        const res = await React.$http.post("/user/login", data)
        setIsAfterLogin(true)
        console.log("res.data", res.data);
        if (res.data.code === 1) {
            setLoginMessage(res.data.message + "，即将跳转主页")
            setTimeout(() => {
                window.location = "/"
                // setIsAfterLogin(false)
                localStorage.setItem('token', res.data.token)
            }, 3000)
        } else {
            setLoginMessage(res.data.message + "，请重新登陆")
            setTimeout(() => {
                setIsAfterLogin(false)
            }, 3000)
        }
    }

    return (
        <div className="login-container">
            {isAfterLogin && <div className="register-panel">{loginMessage}</div>}
            <div className="login-form-box">
                <div className="login-form-input-box">
                    <div className="login-form-text">学号(账号)</div>
                    <input type="number" autoFocus
                        placeholder="请输入你的卡号"
                        className="login-form-input"
                        onChange={event => {
                            setStudentId(event.target.value)
                        }}
                    />

                </div>

                <div className="login-form-input-box">
                    <div className="login-form-text">密码</div>
                    <input type="password"
                        placeholder="请输入你的密码"
                        className="login-form-input"
                        onChange={event => {
                            setStudentPassword(event.target.value)
                        }}
                    />
                </div>
                <div className={`login-form-button ${studentPassword.length && studentId.length ? "login-form-button-allow" : "login-form-button-not-allow"}`}
                    onClick={() => {
                        studentPassword.length && studentId.length && handleLogin()
                    }}>{studentPassword.length && studentId.length ? "登陆" : "请先输入完成"}</div>
            </div>
        </div>
    );
}

export default Login;
