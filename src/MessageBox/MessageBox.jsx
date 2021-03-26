import React, { Component, useState, useEffect } from 'react';
import './MessageBox.scss'

function MessageBox(props) {
    const {
        receiverInfo,
        setReceiverInfo,
        studentId,
        getFriendInfo,
    } = props
    const [userList, setUserList] = useState([])
    const [isClose, setIsClose] = useState(false)
    const [partnerInfo, setPartnerInfo] = useState({})
    const [inputMessage, setInputMessage] = useState('')
    const [receiverList, setReceiverList] = useState([])
    const [senderList, setSenderList] = useState([])
    const [totalNewMessage, setTotalNewMessage] = useState(0)

    async function getMyMessage() {
        const res = await React.$http.get("/message/mymessage")
        const ReceiverList = res.data.receiver_message_list
        const SenderList = res.data.sender_message_list
        setReceiverList(ReceiverList)
        setSenderList(SenderList)
    }

    useEffect(() => {
        getMyMessage()
    }, [])

    useEffect(() => {
        const { id, name } = receiverInfo
        if (!userList[id]) {
            userList[id] = {
                senderId: id,
                name,
                messageList: []
            }
        }
        setIsClose(false)
        setPartnerInfo(userList[id])
    }, [receiverInfo])

    useEffect(() => {
        const userObj = {}
        const newUserList = []
        let total = 0
        receiverList && receiverList.map(item => {
            const {
                SenderId,
                Message,
                SenderName,
                SendTime,
                SendTimeStr,
                IsRead }
                = item
            if (!userObj[SenderId]) {
                userObj[SenderId] = {
                    senderId: SenderId, name: SenderName,
                    ReceiverMessageList: [{ Message, SendTime, SendTimeStr, isRead: IsRead }],
                    SenderMessageList: []
                }
                if (!IsRead) {
                    userObj[SenderId].unReadMessageCount = 1
                    total++
                }
            } else {
                userObj[SenderId].ReceiverMessageList.push({ Message, SendTime, SendTimeStr, isRead: IsRead })
                if (!IsRead) {
                    total++
                    userObj[SenderId].unReadMessageCount ? userObj[SenderId].unReadMessageCount++ : userObj[SenderId].unReadMessageCount = 1
                }
            }
        })
        setTotalNewMessage(total)

        senderList && senderList.map(item => {
            const {
                ReceiverId,
                Message,
                SendTime,
                SendTimeStr,
                IsRead,
                ReceiverName }
                = item
            if (userObj[ReceiverId]) {
                userObj[ReceiverId].SenderMessageList.push({ Message, SendTime, SendTimeStr, isSendFromMe: true, isRead: IsRead })
            } else {
                userObj[ReceiverId] = {
                    senderId: ReceiverId, name: ReceiverName,
                    ReceiverMessageList: [],
                    SenderMessageList: [{ Message, SendTime, SendTimeStr, isRead: IsRead }],
                }
            }

        })
        for (let key in userObj) {
            newUserList.push(userObj[key])
        }
        mergeUserByTime(newUserList)
        newUserList.length >0 && quickSortUserList(newUserList)
        console.log('newUserList',newUserList);

        setUserList(newUserList)
    }, [receiverList, senderList])

    useEffect(() => {
        if (partnerInfo.name) {
            const Id = String(partnerInfo.messageList.length - 1)
            console.log(Id);
            const div = document.getElementById(Id)
            div && div.scrollIntoView()
        }
    }, [partnerInfo])

    const getMessageRead = async (userInfo) => {
        console.log("userInfo", userInfo);
        console.log('studentId', studentId);
        const res = await React.$http.get("/message/read", {
            params: {
                SenderId: userInfo.senderId,
                ReceiverId: studentId,
            }
        })
        console.log(res);
    }

    const updateMessage = async () => {
        if(inputMessage.trim()==""){
            alert('请输入内容')
            return
        }
        const newInfo = { ...partnerInfo }
        const date = new Date()
        const sendTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
        newInfo.messageList.push({ Message: inputMessage, isSendFromMe: true, SendTimeStr: sendTime, SendTime: date.getTime() })
        setPartnerInfo(newInfo)
        setInputMessage('')
        const form = {
            receiver_id: newInfo.senderId,
            message: inputMessage,
            sender_id: studentId,
        }
        const data = React.$qs.stringify(form)
        const res = await React.$http.post("/message/leave", data)
        console.log('res', res);
    }

    return (
        <>
            {isClose && <div className="chat-close" onClick={() => {
                setIsClose(false)
            }}></div>}

            <div className={!isClose ? "chat-message-box chat-open-animation" : "chat-message-box chat-close-animation"}>
                <div className={"chat-right-button"} onClick={() => {
                    setIsClose(true)
                }}></div>
                {totalNewMessage > 0 && <div className="chat-total-new-message">
                    {totalNewMessage}
                </div>}
                {!partnerInfo.name ? <>
                    <div className="chat-message-title">{receiverList ? "消息盒子" : "你暂时还没有消息"}</div>
                    <a href="http://www.zhuyuchen.cn/chat" className="chat-room" target="_blank">点我进入聊天室 邀请朋友一起参加群聊</a>
                    {userList.length > 0 && <div className="chat-user-list-container">
                        {userList.map(item => {
                            return (
                                <div className="chat-user-list" key={item.senderId} onClick={() => {
                                    setPartnerInfo(item)
                                    getMessageRead(item)
                                }}>
                                    <div className="user-image"></div>
                                    <div className="user-name" >
                                        {item.name}
                                        <span className="user-name-find" onClick={e => {
                                            e.stopPropagation()
                                            getFriendInfo(item.senderId)
                                        }}>在地图上显示他</span>
                                    </div>
                                    <div className="user-first-message">
                                        {item.unReadMessageCount &&
                                            <span className="user-unread-message-count">{`[${item.unReadMessageCount}条新消息]`}</span>}
                                        {item.messageList[item.messageList.length - 1].Message}
                                    </div>
                                </div>
                            )
                        })}</div>}
                </> :
                    <div className={isClose ? "chat-close-animtion chat-partner-box" : "chat-open-animtion chat-partner-box"}>
                        <div className="chat-partner-back" onClick={() => {
                            getMyMessage()
                            setPartnerInfo({})
                        }}></div>
                        <div className="chat-partner-name">{partnerInfo.name}</div>
                        <div className="chat-partner-message-box">
                            {partnerInfo.messageList && partnerInfo.messageList.map((item, index) => {
                                return (
                                    <div className="chat-partner-message-container" key={item.SendTime} id={index}>
                                        <div className={item.isSendFromMe ? "send-time" : "receive-time"}>
                                            {item.SendTimeStr}
                                        </div>
                                        {item.isSendFromMe ? <div className="send-box">
                                            <div className="send-image" />
                                            <div className="send-message-icon" />
                                            <div className="send-message">{item.Message}</div>
                                        </div>
                                            :
                                            <div className="receive-box">
                                                <div className="receive-image" />
                                                <div className="receive-message-icon" />
                                                <div className="receive-message">{item.Message}</div>
                                            </div>}

                                    </div>
                                )
                            })}
                        </div>
                        <input className="chat-input" type="text"
                            placeholder="一次最多输入50字喔"
                            onChange={event => {
                                setInputMessage(event.target.value)
                            }}
                            value={inputMessage}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    console.log('here');
                                    updateMessage()
                                }
                            }} />

                    </div>
                }

            </div>

        </>
    )
}
export default MessageBox
const mergeUserByTime = (userList) => {
    userList.map(item => {
        const messageList = []
        let leftIndex = 0, rightIndex = 0
        const leftArr = item.ReceiverMessageList, rightArr = item.SenderMessageList
        for (let index = 0; index < leftArr.length + rightArr.length; index++) {
            if (leftIndex >= leftArr.length) {
                messageList.push(rightArr[rightIndex++])
            } else if (rightIndex >= rightArr.length) {
                messageList.push(leftArr[leftIndex++])
            } else if (leftArr[leftIndex].SendTime > rightArr[rightIndex].SendTime) {
                messageList.push(rightArr[rightIndex++])
            } else {
                messageList.push(leftArr[leftIndex++])
            }
        }
        delete item.ReceiverMessageList
        delete item.SenderMessageList
        item.messageList = messageList
    })
}

const quickSortUserList = (userList) => {
    quickSort(userList, 0, userList.length - 1)
}

const quickSort = (userList, left, right) => {
    if (right <= left || userList.length <= 1) {
        return
    }
    const pivot = findPivot(userList, left, right)
    quickSort(userList, left, pivot - 1)
    quickSort(userList, pivot + 1, right)
}

const findPivot = (userList, left, right) => {
    let pivot = userList[left].messageList[userList[left].messageList.length-1].SendTime
    while(left<right){
        while(left<right && userList[right].messageList[userList[right].messageList.length-1].SendTime<=pivot){
            right--
        }
        swap(userList,left,right)
        while(left<right && userList[left].messageList[userList[left].messageList.length-1].SendTime>=pivot){
            left++
        }
        swap(userList,left,right)   
    }
    return left
}
const swap = (arr,left,right)=>{
    const tem = arr[left]
    arr[left] = arr[right]
    arr[right] = tem
}