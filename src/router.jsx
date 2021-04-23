import React, { Component, useState, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';
import Footer from './Footer/Footer';
import { BrowserRouter as Router, Route, Switch, Link, NavLink } from 'react-router-dom';
const Login = lazy(() => import(/*webpackChunkName: 'Login'*/'./Login/Login'))
const Register = lazy(() => import(/*webpackChunkName: 'Register'*/'./Register/Register'))
const renderLoader = () => { return (<p></p>) };


function router() {
    const [openTools, setOpenTools] = useState(true)
    const [isPositionMode, setIsPositionMode] = useState(false)
    const [isGamMode, setIsGamMode] = useState(false)
    const [myMarkerPosition, setMyMarkerPosition] = useState([0, 0])
    const [nearbyUserList, setNearbyUserList] = useState([])
    const [userPosition, setUserPosition] = useState([0, 0])
    const [studentId, setStudentId] = useState("")
    const [studentName, setStudentName] = useState("")
    const [signature, setSignature] = useState("")
    const [myMapObj, setMyMapObj] = useState(null)
    const [receiverInfo, setReceiverInfo] = useState({})
    const [isPhone, setIsPhone] = useState(false)
    const [isFunMode, setIsFunMode] = useState(false)
    const [isAddPlaceMode, setIsAddPlaceMode] = useState(false)
    const [placePosition, setPlacePosition] = useState([])
    const [previewPlaceMessage, setPreviewPlaceMessage] = useState({})
    const [placeInfoList, setPlaceInfoList] = useState([])
    const [CommentMode, setCommentMode] = useState(0)
    const [chatPlaceInfo, setChatPlaceInfo] = useState({})
    const [isMessageBoxShow, setIsMessageBoxShow] = useState(false)

    return (
        <Router>
            <div style={{ width: "100%", height: 80 }} />
            <NavBar
                isGamMode={isGamMode}
                setIsMessageBoxShow={setIsMessageBoxShow}
                isMessageBoxShow={isMessageBoxShow}
                setChatPlaceInfo={setChatPlaceInfo}
                setPlaceInfoList={setPlaceInfoList}
                placeInfoList={placeInfoList}
                previewPlaceMessage={previewPlaceMessage}
                setPreviewPlaceMessage={setPreviewPlaceMessage}
                isPhone={isPhone}
                setIsPhone={setIsPhone}
                openTools={openTools}
                setOpenTools={setOpenTools}
                isPositionMode={isPositionMode}
                isGamMode={isGamMode}
                isFunMode={isFunMode}
                isAddPlaceMode={isAddPlaceMode}
                setIsAddPlaceMode={setIsAddPlaceMode}
                setIsPositionMode={setIsPositionMode}
                setIsGamMode={setIsGamMode}
                setIsFunMode={setIsFunMode}
                myMarkerPosition={myMarkerPosition}
                setUserPosition={setUserPosition}
                studentId={studentId}
                setStudentId={setStudentId}
                studentName={studentName}
                setStudentName={setStudentName}
                signature={signature}
                setSignature={setSignature}
                userPosition={userPosition}
                setNearbyUserList={setNearbyUserList}
                nearbyUserList={nearbyUserList}
                myMapObj={myMapObj}
                receiverInfo={receiverInfo}
                setReceiverInfo={setReceiverInfo}
                placePosition={placePosition}
                CommentMode={CommentMode}
            />
            {/* <NavLink to="/login">登陆</NavLink> */}
            <Suspense fallback={<></>}>
                <Switch>
                    <Route path='/register' component={Register} />
                    <Route path='/login' component={Login} />
                    {/* <Route path='/app' component={SideBar} /> */}
                    <Route path='/' render={() =>
                        <Map
                            setIsMessageBoxShow={setIsMessageBoxShow}
                            chatPlaceInfo={chatPlaceInfo}
                            setCommentMode={setCommentMode}
                            placeInfoList={placeInfoList}
                            previewPlaceMessage={previewPlaceMessage}
                            setPreviewPlaceMessage={setPreviewPlaceMessage}
                            placePosition={placePosition}
                            setPlacePosition={setPlacePosition}
                            isPhone={isPhone}
                            openTools={openTools}
                            setOpenTools={setOpenTools}
                            isPositionMode={isPositionMode}
                            isGamMode={isGamMode}
                            setIsGamMode={setIsGamMode}
                            setIsPositionMode={setIsPositionMode}
                            setIsFunMode={setIsFunMode}
                            isAddPlaceMode={isAddPlaceMode}
                            setIsAddPlaceMode={setIsAddPlaceMode}
                            isFunMode={isFunMode}
                            myMarkerPosition={myMarkerPosition}
                            setMyMarkerPosition={setMyMarkerPosition}
                            nearbyUserList={nearbyUserList}
                            userPosition={userPosition}
                            studentId={studentId}
                            studentName={studentName}
                            setSignature={setSignature}
                            signature={signature}
                            myMapObj={myMapObj}
                            setMyMapObj={setMyMapObj}
                            receiverInfo={receiverInfo}
                            setReceiverInfo={setReceiverInfo}
                        />} />
                </Switch>
            </Suspense>
            <Footer />
        </Router>
    );
}

export default router;
