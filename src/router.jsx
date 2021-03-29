import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import Map from './Map/Map';
import Register from './Register/Register';
import Login from './Login/Login';
import NavBar from './NavBar/NavBar';
import Footer from './Footer/Footer';
import { BrowserRouter as Router, Route, Switch, Link, NavLink } from 'react-router-dom';


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

    return (
        <Router>
            <div style={{ width: "100%", height: 80 }} />
            <NavBar
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
            />
            {/* <NavLink to="/login">登陆</NavLink> */}
            <Switch>
                <Route path='/register' component={Register} />
                <Route path='/login' component={Login} />
                {/* <Route path='/app' component={SideBar} /> */}
                <Route path='/' render={() =>
                    <Map
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
            <Footer />
        </Router>
    );
}

export default router;
