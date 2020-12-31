import React from 'react';
import PropTypes from 'prop-types';

import style from './InputText.module.scss';

const InputText = ({type, placeholder, value, onChange}) => {

    return <input type={type} value={value} placeholder={placeholder} onChange={onChange} className={style.inputText}/>
}

InputText.propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default InputText;