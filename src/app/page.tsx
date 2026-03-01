'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [userName, setUserName] = useState('');

  const createRoom = async () => {
    // if (!userName.trim()) {
    //   console.error('Please enter your name');
    //   return;
    // }

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8080/api/room/create', {
        method: 'POST'
      });
      const { roomId } = await response.json();
      
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Failed to create room');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = () => {
    // if (!userName.trim()) {
    //   console.error('Please enter your name');
    //   return;
    // }

    if (!joinRoomId.trim()) {
      console.error('Please enter room ID');
      return;
    }

    router.push(`/room/${joinRoomId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Video Conference</h1>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={styles.input}
            placeholder="Enter your name"
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Create New Room</h2>
          <button
            onClick={createRoom}
            disabled={isCreating}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>Or</span>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Join Existing Room</h2>
          <div className={styles.joinForm}>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className={styles.input}
              placeholder="Room ID"
            />
            <button
              onClick={joinRoom}
              className={`${styles.button} ${styles.buttonSuccess}`}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}