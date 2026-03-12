// app/room/[roomId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VideoCall } from '@/components/VideoCall';
import styles from './styles.module.scss';

export default function RoomPage() {
  const params = useParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем roomId из params - ключ должен совпадать с именем папки!
    if (params && params.roomId) {
      const id = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
      console.log('🔥 Room ID from URL:', id);
      setRoomId(id);
    } else {
      console.error('❌ No room ID in params:', params);
    }
  }, [params]);

  useEffect(() => {
    // Создаем пользователя
    const initUser = () => {
      let savedUser = localStorage.getItem('webrtc_user');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const newUser = {
          uuid: crypto.randomUUID(),
          username: `User_${Math.floor(Math.random() * 1000)}`
        };
        localStorage.setItem('webrtc_user', JSON.stringify(newUser));
        setUser(newUser);
      }
      
      setLoading(false);
    };

    initUser();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!roomId) return <div className={styles.error}>Room ID not found</div>;
  if (!user) return <div className={styles.error}>Error creating user</div>;

  return (
    <div className={styles.container}>
      <VideoCall user={user} roomId={roomId} />
    </div>
  );
}