import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router.jsx';
import './index.css'
import axios from 'axios';
import qs from 'qs';
React.$http = axios
React.$qs = qs
axios.defaults.baseURL = 'http://120.77.144.37:9999';
axios.interceptors.request.use(
  config => {
    if (localStorage.getItem('token')) { //判断token是否存在
      config.headers.Authorization = "Token " + localStorage.token;  //将token设置成请求头
    }
    return config;
  },
);
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
ReactDOM.render(
  <Router />, document.getElementById('root')
);


