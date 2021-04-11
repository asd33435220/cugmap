import React, { Component, useState, useEffect } from 'react';
import './CommentBox.scss'

function CommentBox(props) {
    const {
        CommentMode,
        showToast,
        studentName,
        studentId,
        setReceiverInfo,
        changeGamMode,
    } = props

    const [isClose, setIsClose] = useState(false)
    const [myComment, setMyComment] = useState('')
    const [commentList, setCommentList] = useState([])
    const [myScore, setMyScore] = useState(3)
    const getComment = async CommentMode => {
        const res = await React.$http.get("/comment/all", {
            params: {
                placeCode: CommentMode
            }
        })
        console.log('commentRes', res);
        if (res.data.code !== 1) {
            showToast(res.data.message, 2000)
        }
        setCommentList(res.data.comment_list.reverse())

    }
    useEffect(() => {
        getComment(CommentMode)
    }, [CommentMode])
    const submitComment = async () => {
        if (myComment.trim() === '') {
            setMyComment('')
            showToast('你还没有评论喔')
            return
        }
        const date = new Date()
        const CommentTimeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
        const newCommentList = [...commentList]
        newCommentList.unshift({ CommentTimeStr, Commentator: studentId, CommentatorInfo: { username: studentName }, Score: myScore, CommentMessage: myComment })
        setCommentList(newCommentList)
        const form = {
            placeCode: CommentMode,
            commentMessage: myComment,
            score: myScore,
        }
        const data = React.$qs.stringify(form)
        const res = await React.$http.post("/comment/add", data)
        console.log('res', res);
        setMyComment('')
    }
    const getScore = score => {
        const arr = []
        for (let i = 1; i < 6; i++) {
            if (i <= score) {
                arr.push(1)
            } else {
                arr.push(0)
            }
        }
        return (
            <>
                {
                    arr.map((item, index) => {
                        return (
                            <div key={index} className={item === 1 ? "comment-star" : "comment-dark"} />
                        )
                    })
                }
            </>
        )
    }


    return (
        <>
            {isClose && <div className="comment-close" onClick={() => {
                setIsClose(false)
            }}></div>}

            <div className={!isClose ? "comment-message-box comment-open-animation" : "comment-message-box comment-close-animation"}>
                <div className={"comment-right-button"} onClick={() => {
                    setIsClose(true)
                }}></div>
                <div className="comment-title">
                    {commentList.length > 0 ? '评论列表' : '暂时还没有评论'}
                </div>
                <div className="comment-line"></div>

                <div className="comment-other">
                    {commentList.length > 0 ? <>

                        {commentList.map(item => {
                            return (
                                <div key={item.CommentTime}>
                                    <div className="comment-item">
                                        <div className="comment-item-avatar"></div>
                                        <div className="comment-item-right">
                                            <div className="comment-commentator">{item.CommentatorInfo.username}
                                                {item.Commentator !== studentId &&
                                                    <span className="comment-chat" onClick={() => {
                                                        changeGamMode({ id: item.Commentator, name: item.CommentatorInfo.username })
                                                    }}>和他聊聊</span>}
                                            </div>
                                            <div className="comment-score">
                                                {getScore(item.Score)}
                                            </div>
                                            <div className="comment-message">{item.CommentMessage}</div>
                                            <div className="comment-time">{item.CommentTimeStr}</div>


                                        </div>
                                    </div>
                                    <div className="comment-item-line"></div>
                                </ div>
                            )
                        })}
                    </> :
                        <div className="comment-empty">评论区空空如也....</div>}
                </div>
                <div className="comment-line"></div>
                <div className="comment-my">
                    <div className="comment-subtitle">
                        我的评论
                    </div>
                    <textarea onKeyDown={e => {
                        if (e.key === "Enter") {
                            submitComment()
                        }
                    }} placeholder="最多200字噢" cols="20" className="comment-comment" rows="5" value={myComment} onChange={e => {
                        setMyComment(e.target.value)
                    }}></textarea>
                    <div className="comment-my-bottom">
                        <div className="comment-star-box">
                            <div className={myScore >= 1 ? "comment-star-score" : "comment-star"} onClick={() => { setMyScore(1) }}></div>
                            <div className={myScore >= 2 ? "comment-star-score" : "comment-star"} onClick={() => { setMyScore(2) }}></div>
                            <div className={myScore >= 3 ? "comment-star-score" : "comment-star"} onClick={() => { setMyScore(3) }}></div>
                            <div className={myScore >= 4 ? "comment-star-score" : "comment-star"} onClick={() => { setMyScore(4) }}></div>
                            <div className={myScore >= 5 ? "comment-star-score" : "comment-star"} onClick={() => { setMyScore(5) }}></div>
                        </div>
                        <div className="comment-submit" onClick={() => { submitComment() }}>提交评论</div>
                    </div>
                </div>

            </div>

        </>
    )
}
export default CommentBox
