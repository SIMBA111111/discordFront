// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './styles.module.scss';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/room/create', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      // Сохраняем имя пользователя если ввели
      if (username.trim()) {
        localStorage.setItem('webrtc_username', username.trim());
      }
      
      router.push(`/room/${data.roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Video Conference</h1>
        <p className={styles.subtitle}>Start a video call with friends and colleagues</p>
        
        {!showNameInput ? (
          <button 
            onClick={() => setShowNameInput(true)} 
            className={styles.createButton}
          >
            Create Room
          </button>
        ) : (
          <div className={styles.nameInputContainer}>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.nameInput}
              autoFocus
            />
            <button 
              onClick={createRoom} 
              disabled={loading}
              className={styles.createButton}
            >
              {loading ? 'Creating...' : 'Start Call'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}