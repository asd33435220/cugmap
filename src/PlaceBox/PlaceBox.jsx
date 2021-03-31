import React, { Component, useState, useEffect } from 'react';
import './PlaceBox.scss'

function PlaceBox(props) {
    const {
        placePosition = [0, 0],
        isPhone,
        showToast,
        setPreviewPlaceMessage,
        studentId,
    } = props

    const [isClose, setIsClose] = useState(false)
    const [placeName, setPlaceName] = useState('')
    const [address, setAddress] = useState('')
    const [comment, setcomment] = useState('')
    const [selected, setSelected] = useState(1)
    const [score, setScore] = useState(3)
    const [page, setPage] = useState(1)
    const [image1Url, setImage1Url] = useState('')
    const [image2Url, setImage2Url] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')

    useEffect(() => {
        console.log('placePosition', placePosition);
    }, [placePosition])

    const previewPlace = () => {
        if (placeName.trim() === '') {
            showToast('请先填写地物名称')
            setPage(1)
            return
        }
        if (placeName.length > 25) {
            showToast('地物名称过长')
            setPage(1)
            return
        }
        if (address.trim() === '') {
            showToast('请先填写地物详细地址')
            setPage(1)
            return
        }
        if (address.length > 100) {
            showToast('地址过长')
            setPage(1)
            return
        }
        if (placePosition.length === 0 || placePosition[0] === 0 && placePosition[1] === 0) {
            showToast('请先在地图上选择地物坐标')
            setPage(1)
            return
        }
        if (comment.trim() === '') {
            showToast('请先推荐语')
            return
        }
        if (comment.length > 100) {
            showToast('推荐语过长')
            return
        }
        if (phoneNumber.trim() === '') {
            showToast('请先填写联系电话')
            return
        }
        if (phoneNumber.length > 15) {
            showToast('电话过长')
            return
        }
        if (image1Url.length > 3000) {
            showToast('图片1地址过长')
            return
        }
        if (image1Url.length > 3000) {
            showToast('图片2地址过长')
            return
        }

        setPreviewPlaceMessage({
            placeName,
            address,
            comment,
            placePosition,
            type: selected,
            score,
            phoneNumber,
            image1Url,
            image2Url,
        })

    }
    const commitPlace = async () => {
        if (placeName.trim() === '') {
            showToast('请先填写地物名称')
            setPage(1)
            return
        }
        if (placeName.length > 20) {
            showToast('地物名称过长')
            setPage(1)
            return
        }
        if (address.trim() === '') {
            showToast('请先填写地物详细地址')
            setPage(1)
            return
        }
        if (address.length > 50) {
            showToast('地址过长')
            setPage(1)
            return
        }
        if (placePosition.length === 0 || placePosition[0] === 0 && placePosition[1] === 0) {
            showToast('请先在地图上选择地物坐标')
            setPage(1)
            return
        }
        if (comment.trim() === '') {
            showToast('请先推荐语')
            return
        }
        if (comment.length > 50) {
            showToast('推荐语过长')
            return
        }
        if (phoneNumber.trim() === '') {
            showToast('请先填写联系电话')
            return
        }
        if (phoneNumber.length > 15) {
            showToast('电话过长')
            return
        }
        if (image1Url.length > 3000) {
            showToast('图片1地址过长')
            return
        }
        if (image1Url.length > 3000) {
            showToast('图片2地址过长')
            return
        }
        const form = {
            Name: placeName,
            Address: address,
            Lng:placePosition[0],
            Lat:placePosition[1],
            Image1Url:image1Url,
            Image2Url:image2Url,
            Type:selected,
            Score:score,
            Number:phoneNumber,
            Comment:comment
        }
        const data = React.$qs.stringify(form)
        const res = await React.$http.post("/place/add", data)
        console.log("res",res);
        showToast(res.data.message,2000,"/fun")
    }
    return (
        <>
            {isClose && <div className="place-close" onClick={() => {
                setIsClose(false)
            }}></div>}

            <div className={!isClose ? "place-box place-open-animation" : "place-box place-close-animation"}>
                <div className={"place-right-button"} onClick={() => {
                    setIsClose(true)
                }}></div>
                <div className="place-title">
                    新增地物点
            </div>
                <div className="place-line"></div>
                {page === 1 ? <>
                    <div className="place-subtitle">请填写该地物名称</div>
                    <input type="text" placeholder="最多20字喔" className="place-input" value={placeName} onChange={e => {
                        setPlaceName(e.target.value)
                    }} />
                    <div className="place-line"></div>
                    <div className="place-subtitle">请填写该地物详细地址</div>
                    <input type="text" placeholder="最多50字喔" className="place-input" value={address} onChange={e => {
                        setAddress(e.target.value)
                    }} />
                    <div className="place-line"></div>
                    <div className="place-subtitle">请点击地图选择地物点坐标</div>
                    <div className="place-position">地物点经度:<span style={{ fontWeight: 700, fontSize: 18 }}>{placePosition[0]}</span></div>
                    <div className="place-position">地物点纬度:<span style={{ fontWeight: 700, fontSize: 18 }}>{placePosition[1]}</span></div>
                    <div className="place-line"></div>
                    <div className="place-subtitle">请选择地物类型</div>
                    <div className="place-radio-group">

                        <div className={selected === 1 ? "place-radio-selected" : "place-radio"}
                            onClick={() => { setSelected(1) }}>
                            <div className="place-radio-button">
                                <div className="place-radio-button-inside"></div>
                            </div>
                            <div className="place-radio-text">美食</div>
                            <div className="place-radio-img-food"></div>
                        </div>
                        <div className={selected === 2 ? "place-radio-selected" : "place-radio"}
                            onClick={() => { setSelected(2) }}>
                            <div className="place-radio-button">
                                <div className="place-radio-button-inside"></div>
                            </div>
                            <div className="place-radio-text">娱乐</div>
                            <div className="place-radio-img-fun"></div>
                        </div>
                        <div className={selected === 3 ? "place-radio-selected" : "place-radio"}
                            onClick={() => { setSelected(3) }}>
                            <div className="place-radio-button">
                                <div className="place-radio-button-inside"></div>
                            </div>
                            <div className="place-radio-text">基础设施</div>
                            <div className="place-radio-img-infra"></div>
                        </div>
                    </div>
                    <div className="place-line"></div>
                    <div className="place-subtitle">请给该地物打分</div>
                    <div className="place-star-box">
                        <div className={score >= 1 ? "place-star-score" : "place-star"} onClick={() => { setScore(1) }}></div>
                        <div className={score >= 2 ? "place-star-score" : "place-star"} onClick={() => { setScore(2) }}></div>
                        <div className={score >= 3 ? "place-star-score" : "place-star"} onClick={() => { setScore(3) }}></div>
                        <div className={score >= 4 ? "place-star-score" : "place-star"} onClick={() => { setScore(4) }}></div>
                        <div className={score >= 5 ? "place-star-score" : "place-star"} onClick={() => { setScore(5) }}></div>
                    </div>
                    <div className="place-line"></div>
                    <div className="place-next-page" onClick={() => {
                        setPage(2)
                    }}>
                        下一页
                    <div className="place-next-page-img" />
                    </div>
                </>
                    :
                    <>
                        <div className="place-subtitle">请写下推荐语</div>
                        <textarea cols="20" className="place-comment" rows="5" value={comment} onChange={e => {
                            setcomment(e.target.value)
                        }}></textarea>

                        <div className="place-line"></div>
                        <div className="place-subtitle">请填写联系电话</div>
                        <input type={isPhone ? "tel" : "number"} className="place-input" placeholder="暂时仅支持大陆地区号码喔"
                            value={phoneNumber} onChange={e => {
                                setPhoneNumber(e.target.value)
                            }} />
                        <div className="place-line"></div>
                        <div className="place-subtitle">图片1在线地址或base64编码 (可选)</div>
                        <input type="text" className="place-input" placeholder="长度不能超过3000喔"
                            value={image1Url} onChange={e => {
                                setImage1Url(e.target.value)
                            }} />

                        <div className="place-line"></div>
                        <div className="place-subtitle">图片2在线地址或base64编码 (可选)</div>
                        <input type="text" className="place-input" placeholder="长度不能超过3000喔"
                            value={image2Url} onChange={e => {
                                setImage2Url(e.target.value)
                            }} />


                        <div className="place-line"></div>
                        <div className="place-bottom">
                            <div className="place-preview" onClick={() => {
                                previewPlace()
                            }}>预览信息</div>
                            <div className="place-commit" onClick={() => {
                                commitPlace()
                            }}>
                                提交信息
                            </div>
                            <div className="place-prev-page" onClick={() => {
                                setPage(1)
                            }}>
                                上一页
                                <div className="place-prev-page-img" />
                            </div>
                        </div>
                    </>}

            </div>
        </>
    )
}
export default PlaceBox
