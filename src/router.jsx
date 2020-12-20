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

    return (
        <Router>
            <div style={{width:"100%",height:80}}/>
            <NavBar openTools={openTools} setOpenTools={setOpenTools} />
            {/* <NavLink to="/login">登陆</NavLink> */}
            <Switch>
                <Route path='/register' component={Register} />
                <Route path='/login' component={Login} />
                {/* <Route path='/app' component={SideBar} /> */}
                <Route path='/' render={() => <Map openTools={openTools} setOpenTools={setOpenTools} />} />
            </Switch>
            <Footer />
        </Router>
    );
}

export default router;
