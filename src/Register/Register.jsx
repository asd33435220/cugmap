import React, { Component, useState } from 'react';
import './Register.scss'

function Register() {
    const [studentId, setStudentId] = useState('')
    const [studentName, setStudentName] = useState('')
    const [studentPassword, setStudentPassword] = useState('')
    const [studentPasswordRepeat, setStudentPasswordRepeat] = useState('')

    const [isIdChecked, setIsIdChecked] = useState(false)
    const [idMessage, setIdMessage] = useState("该学号可以使用👍")
    const [isIdMessageShow, setIsIdMessageShow] = useState(false)

    const [isPasswordChecked, setIsPasswordChecked] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState("你的密码很棒👍")
    const [isPasswordMessageShow, setIsPasswordMessageShow] = useState(false)
    const [isAfterRegister, setIsAfterRegister] = useState(false)
    const [registerMessage, setRegisterMessage] = useState('')
    async function handleRegister() {
        const form = {
            student_id: studentId,
            username: studentName,
            password: studentPassword,
        }
        const data = React.$qs.stringify(form)
        const res = await React.$http.post("/user/register", data)
        setRegisterMessage(res.data.message)
        if (res.data.code === 1) {
            setIsAfterRegister(true)
            setRegisterMessage(res.data.message + "，即将跳转登陆页面")
            setTimeout(() => {
                window.location = "/login"
            }, 1500)
        } else {
            setIsAfterRegister(true)
            setRegisterMessage(res.data.message + "，请重新注册")
            setTimeout(() => {
                setIsAfterRegister(false)
            }, 1500)
        }
    }
    async function checkStudentId() {
        const query = {
            student_id: studentId
        }
        const res = await React.$http.get("/user/check", {
            params: query
        })
        if (res.data.code === 1) {
            setIsIdChecked(true)
            setIdMessage("该学号可以使用👍")
        } else {
            setIsIdChecked(false)
            setIdMessage("❌" + res.data.message)
        }
    }
    function checkPassword(value) {
        if (value.length < 8 || value.length > 20) {
            setIsPasswordChecked(false)
            setPasswordMessage("你的密码长度不对❌")
        }
        else if (value === studentPasswordRepeat) {
            setIsPasswordChecked(true)
            setPasswordMessage("你的密码很棒👍")
        } else {
            setIsPasswordChecked(false)
            setPasswordMessage("两次密码不相同❌")
        }
    }
    function checkPasswordRepeat(value) {
        if (studentPassword === value) {
            setIsPasswordChecked(true)
            setPasswordMessage("你的密码很棒👍")
        } else {
            setIsPasswordChecked(false)
            setPasswordMessage("两次密码不相同❌")
        }
    }
    return (
        <div className="register-container">
            {isAfterRegister && <div className="register-panel">{registerMessage}</div>}
            <div className="register-form-box">
                <div className="register-form-input-box">
                    <div className="register-form-text">学生卡号(账号)</div>
                    <input type="number" autoFocus
                        placeholder="请输入你的卡号"
                        className="register-form-input"
                        onChange={event => {
                            setStudentId(event.target.value)
                        }}
                        onBlur={event => {
                            checkStudentId()
                            setIsIdMessageShow(true)
                        }} />
                    {isIdMessageShow && <div
                        className={isIdChecked ?
                            "register-id-message-checked" : "register-id-message"}>
                        {idMessage}</div>}
                </div>
                <div className="register-form-input-box">
                    <div className="register-form-text">姓名</div>
                    <input type="text"
                        placeholder="请输入你的姓名"
                        className="register-form-input"
                        onChange={event => {
                            setStudentName(event.target.value)
                        }} />
                </div>
                <div className="register-form-input-box">
                    <div className="register-form-text">密码</div>
                    <input type="password"
                        placeholder="请输入你的密码"
                        className="register-form-input"
                        onChange={event => {
                            setStudentPassword(event.target.value)
                            checkPassword(event.target.value)
                        }}
                    />

                </div>
                <div className="register-form-input-box">
                    <div className="register-form-text">请再次输入密码</div>
                    <input type="password"
                        placeholder="请输入你的密码"
                        className="register-form-input"
                        onChange={event => {
                            setStudentPasswordRepeat(event.target.value)
                            checkPasswordRepeat(event.target.value)
                            setIsPasswordMessageShow(true)
                        }} />
                    {isPasswordMessageShow && <div
                        className={isPasswordChecked ?
                            "register-id-message-checked" : "register-id-message"}>
                        {passwordMessage}
                    </div>}
                </div>
                <div className={`register-form-button ${studentPassword.length && studentId.length ? "register-form-button-allow" : "register-form-button-not-allow"}`}
                    onClick={() => {
                        isIdChecked && isPasswordChecked && handleRegister()
                    }}>{isIdChecked && isPasswordChecked ? "确认注册" : "请先输入"}</div>
            </div>
        </div>
    );
}

export default Register;
