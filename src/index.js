import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router.jsx';
import './index.css'
import axios from 'axios';
import qs from 'qs';
React.$http = axios
React.$qs = qs
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
ReactDOM.render(
  <Router />, document.getElementById('root')
);


