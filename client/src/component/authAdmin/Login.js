import React, { Component } from 'react'
import logo from '../../img/logo-title-italic.png'

class Login extends Component {
    render() {
        return (
            <div className="form-login">
                <img src={logo} alt="logo GAT" width="400"/>
                <div className="container-form-login">
                    <h2>LOGIN</h2>
                    <form>
                        <input type="text" placeholder="Email"/>
                        <input type="password" placeholder="Password"/>
                        <center>
                            <button type="submit">LOGIN</button>
                        </center>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;