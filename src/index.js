import React from 'react';
import ReactDOM from 'react-dom';
import Map from './Map/Map';
import Login from './Login/Login';
import { BrowserRouter as Router, Route, Switch, Link, NavLink } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <NavLink
      to="/login"
      activeClassName="selected"
    >FAQs</NavLink>
    <Switch>
      <Route path='/login' component={Login} />
      {/* <Route path='/app' component={SideBar} /> */}
      <Route path='/' component={Map} />
    </Switch>
  </Router>
  ,
  document.getElementById('root')
);


