'use client'

import React, { useState } from "react"
import { handleRegisterFormData } from "../lib/handlers"
import { register } from "../api/register"
import styles from './styles.module.scss' // импорт стилей

export const RegisterForm = () => {
    const [registerData, setRegisterData] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        username: '',
        password: '',
    })


    return (
        <div className={styles.formContainer}>
            <div className={styles.title}>Регистрация</div>
            <form onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => register(e, registerData)}>
                <input
                    type="text"
                    placeholder="fullname"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'fullname', setRegisterData)}
                />
                <input
                    type="text"
                    placeholder="email"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'email', setRegisterData)}
                />
                <input
                    type="text"
                    placeholder="phoneNumber"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'phoneNumber', setRegisterData)}
                />
                <input
                    type="text"
                    placeholder="username"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'username', setRegisterData)}
                />
                <input
                    type="password"
                    placeholder="password"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'password', setRegisterData)}
                />
                <button className={styles.button} type="submit">Регистрация</button>
            </form>
        </div>
    )
}