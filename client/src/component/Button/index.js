import React from 'react'
import PropTypes from 'prop-types';

import style from './Button.module.scss'

const Button = ({children, type, width, color}) => {

    const styles = [style.button];
    if(color) {
        styles.push(style[`button__${color}`]);
    }

    return (
        <button type={type} className={styles.join(' ')} style={{width: `${width}`}}>
            {children}
        </button>
    )
}

Button.propTypes = {
    children: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['primary', 'success', 'danger'])
}

export default Button