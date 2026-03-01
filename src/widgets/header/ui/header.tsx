'use client'

import styles from './styles.module.scss';
import { useRouter } from 'next/navigation';

interface IHeader { 
    userData: any
}

export const Header: React.FC<IHeader> = ({userData}) => {

    // console.log('userData === ', userData);
    const router = useRouter()

    return (
        <header className={styles.headerWidget}>
        <div className={styles.container}>
            <h1 className={styles.logo}>Мой сайт</h1>
            <nav className={styles.navigation}>
            <a href="">Главная</a>
            <a href="/">Комнаты</a>
            <a href="/">Начать трансляцию</a>
            <a href="#">О нас</a>
            <a href="#">Услуги</a>
            <a href="#">Контакты</a>
            </nav>
            <div>
                {userData?.username ? userData?.username
                 : 
                <button onClick={() => router.push('/login')}>Войти</button>
                }
            </div>
        </div>
        </header>
    );
};