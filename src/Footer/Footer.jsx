import React, { Component } from 'react';
import './Footer.scss'

class Footer extends Component {
    render() {
        return (
            <div className="footer-container">
                <a href="https://beian.miit.gov.cn/" target="_blank" className="footer-main-text" >
                    粤ICP备20008700号
                </a>
            </div>
        );
    }
}

export default Footer;
