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
    const [userPosition, setUserPosition] = useState([0,0])
    const [studentId, setStudentId] = useState("")
    const [studentName, setStudentName] = useState("")
    const [signature, setSignature] = useState("")
  const [myMapObj, setMyMapObj] = useState(null)


    return (
        <Router>
            <div style={{ width: "100%", height: 80 }} />
            <NavBar
                openTools={openTools}
                setOpenTools={setOpenTools}
                isPositionMode={isPositionMode}
                isGamMode={isGamMode}
                setIsPositionMode={setIsPositionMode}
                setIsGamMode={setIsGamMode}
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
            />
            {/* <NavLink to="/login">登陆</NavLink> */}
            <Switch>
                <Route path='/register' component={Register} />
                <Route path='/login' component={Login} />
                {/* <Route path='/app' component={SideBar} /> */}
                <Route path='/' render={() =>
                    <Map
                        openTools={openTools}
                        setOpenTools={setOpenTools}
                        isPositionMode={isPositionMode}
                        isGamMode={isGamMode}
                        setIsGamMode={setIsGamMode}
                        setIsPositionMode={setIsPositionMode}
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
                    />} />
            </Switch>
            <Footer />
        </Router>
    );
}

export default router;
