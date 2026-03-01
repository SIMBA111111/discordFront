'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"

import { handleLoginFormData } from "../lib/handlers"
import { login } from "../api/login"

import styles from './styles.module.scss'

export const LoginForm = () => {
    const [loginData, setLoginData] = useState(
        {
            username: '',
            password: '',
        }
    )
    
    const router = useRouter()

    return (
        <div className={styles.formContainer}>
            <div className={styles.title}>Войти в аккаунт</div>
            <form onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => login(e, loginData)}>
                <input
                    type="text"
                    placeholder="юз"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLoginFormData(e, 'username', setLoginData)}
                />
                <input
                    type="password"
                    placeholder="пароль"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLoginFormData(e, 'password', setLoginData)}
                />
                <button
                    type="submit"
                    className={styles.button}
                >
                    Войти
                </button>
            </form>
            <button className={styles.button} onClick={() => {router.push('/register') }}>Регистрация</button>
        </div>
    )
}