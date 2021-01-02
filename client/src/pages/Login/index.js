import React, { useState, useReducer, useEffect } from 'react';
import logo from '../../img/logo_v2.png';

import InputText from '../../component/Input';
import Button from '../../component/Button';
import style from './Login.module.scss';

import reducer from './reducer';

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    // masih belum
    const [err, dispatch] = useReducer(reducer, '')

    const handleSubmit = (event) => {
        event.preventDefault();

        if(!(form.email && form.password)){
            dispatch({type: 'BLANK'});
        } else {
            dispatch({type: 'SUCCESS'});
        }

        if(!err) {
            alert(JSON.stringify(form))
        }
    }

    

    return (
        <div className={style.container}>
            <img src={logo} alt="logo GAT" width="400"/>
            <div className={style.container_form}>
                <h2 className={style.title}>LOGIN</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '15px'}}>
                        <InputText type='email' placeholder='Email' value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}/>
                    </div>
                    <div>
                        <InputText type='password' placeholder='Password' value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}/>
                    </div>
                    <div style={{marginTop: '30px'}}>
                        {err && 
                            <p className={style.alert}>{err}</p>
                        }
                        <Button type='submit' width='200px'>LOGIN</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;