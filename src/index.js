import React from 'react';
import ReactDOM from 'react-dom';
import App from './Map/App';
import Login from './Login/Login';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <Switch>
      <Route path='/login' component={Login} />
      {/* <Route path='/app' component={SideBar} /> */}
      <Route path='/' component={App} />
    </Switch>
  </Router>
  ,
  document.getElementById('root')
);


