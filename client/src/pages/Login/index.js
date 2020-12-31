import React, { useState } from 'react'
import logo from '../../img/logo_v2.png'

import InputText from '../../component/Input'
import Button from '../../component/Button'
import style from './Login.module.scss'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        // login submit
    }

    return (
        <div className={style.container}>
            <img src={logo} alt="logo GAT" width="400"/>
            <div className={style.container_form}>
                <h2 className={style.title}>LOGIN</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '15px'}}>
                        <InputText type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} styles='marginBottom: 15px'/>
                    </div>
                    <div>
                        <InputText type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div style={{marginTop: '30px'}}>
                        <Button type='submit' width='200px'>LOGIN</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;