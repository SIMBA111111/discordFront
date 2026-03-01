
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {VideoCall} from '@/components/VideoCall';
import styles from './styles.module.scss';

async function validateRoom(roomId: string) {
  try {
    const response = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
      // Добавляем cache: 'no-store' чтобы всегда получать актуальные данные
      cache: 'no-store'
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to validate room:', err);
    return false;
  }
}

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get('userData')?.value;
  

  let user = {
    username: '',
    uuid: ''
  };
  
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie);
      
      if (userData.username) {
        user.username = userData.username;
        user.uuid = userData.id;
      }
    } catch (e) {
      console.error('Ошибка парсинга cookie:', e);
    }
  }

  // Валидируем комнату на сервере
  // const isValid = await validateRoom(roomId);

  // if (!isValid) {
  //   // Если комната невалидна, показываем страницу с ошибкой
  //   return (
  //     <div className={styles.errorContainer}>
  //       <div className={styles.errorCard}>
  //         <h1 className={styles.errorTitle}>Error</h1>
  //         <p className={styles.errorMessage}>Invalid room</p>
  //         <a href="/" className={styles.errorButton}>
  //           Go Home
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }

  // Если всё ок, рендерим VideoCall на клиенте
  return (
    <VideoCall
      roomId={roomId}
      user={user}
      // signalingUrl={`ws://localhost:8080?roomId=${roomId}`}
    />
  );
}