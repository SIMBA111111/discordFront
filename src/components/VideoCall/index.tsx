// app/components/VideoCall/index.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { RemoteVideo } from '../remoteVideo';
import styles from './styles.module.scss';

interface IVideoCall {
  user: any;
  roomId: string;
}

interface RemoteUser {
  peerId: string;
  username: string;
  stream: MediaStream;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoCall: React.FC<IVideoCall> = ({ user, roomId }) => {
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerId, setPeerId] = useState<string>('');

  const peerRef = useRef<Peer | null>(null);
  const selfVideo = useRef<HTMLVideoElement>(null);

  // 1. ИНИЦИАЛИЗАЦИЯ ЛОКАЛЬНОГО ВИДЕО - ПЕРВОЕ ДЕЛО!
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        console.log('🎥 Запрашиваю камеру...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        if (selfVideo.current) {
          selfVideo.current.srcObject = stream;
          await selfVideo.current.play();
        }

        setLocalStream(stream);
        console.log('✅ Локальное видео готово');
      } catch (error) {
        console.error('❌ Ошибка камеры:', error);
      }
    };

    initLocalStream();
  }, []);

  // 2. ИНИЦИАЛИЗАЦИЯ PEERJS (ТОЛЬКО ПОСЛЕ ТОГО КАК ЕСТЬ localStream)
  useEffect(() => {
    if (!localStream) return; // Ждем пока появится видео!

    const initPeer = async () => {
      console.log('🔌 Подключаюсь к PeerJS серверу...');
      
      // Регистрируемся в комнате
      await fetch(`http://localhost:8080/api/room/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          peerId: user.uuid,
          username: user.username 
        })
      });

      // Создаем Peer
      const peer = new Peer(user.uuid, {
        host: 'localhost',
        port: 8080,
        path: '/peerjs',
        debug: 3
      });

      peer.on('open', (id) => {
        console.log('✅ PeerJS подключен, ID:', id);
        setPeerId(id);
        
        // После подключения начинаем искать других
        setTimeout(() => connectToOthers(peer), 1000);
      });

      // Обработка входящих звонков
      peer.on('call', (call) => {
        console.log('📞 Входящий звонок от:', call.peer);
        
        // Отвечаем своим видео
        call.answer(localStream);
        
        call.on('stream', (remoteStream) => {
          console.log('📺 Получено видео от:', call.peer);
          
          // Получаем имя звонящего
          fetch(`http://localhost:8080/api/room/${roomId}/user/${call.peer}`)
            .then(res => res.json())
            .then(data => {
              const videoRef = React.createRef<HTMLVideoElement>();
              
              setRemoteUsers(prev => {
                const newMap = new Map(prev);
                newMap.set(call.peer, {
                  peerId: call.peer,
                  username: data.username,
                  stream: remoteStream,
                  videoRef
                });
                return newMap;
              });
            });
        });
      });

      peerRef.current = peer;
    };

    initPeer();

    return () => {
      peerRef.current?.destroy();
    };
  }, [localStream, roomId, user.uuid, user.username]);

  // 3. ФУНКЦИЯ ПОИСКА И ПОДКЛЮЧЕНИЯ К ДРУГИМ
  const connectToOthers = async (peer: Peer) => {
    try {
      console.log('🔍 Ищу других участников...');
      
      const response = await fetch(`http://localhost:8080/api/room/${roomId}`);
      const data = await response.json();
      
      console.log('👥 Участники комнаты:', data.participants);
      
      // Звоним всем, кроме себя
      for (const participantId of data.participants) {
        if (participantId !== user.uuid && !remoteUsers.has(participantId) && localStream) {
          console.log('📞 Звоню участнику:', participantId);
          
          const call = peer.call(participantId, localStream);
          
          call.on('stream', (remoteStream) => {
            console.log('📺 Получено видео от:', participantId);
            
            fetch(`http://localhost:8080/api/room/${roomId}/user/${participantId}`)
              .then(res => res.json())
              .then(data => {
                const videoRef = React.createRef<HTMLVideoElement>();
                
                setRemoteUsers(prev => {
                  const newMap = new Map(prev);
                  newMap.set(participantId, {
                    peerId: participantId,
                    username: data.username,
                    stream: remoteStream,
                    videoRef
                  });
                  return newMap;
                });
              });
          });
        }
      }
    } catch (error) {
      console.error('❌ Ошибка подключения:', error);
    }
  };

  // 4. Привязываем стримы к видео-элементам
  useEffect(() => {
    remoteUsers.forEach((remoteUser) => {
      if (remoteUser.videoRef.current && remoteUser.stream) {
        remoteUser.videoRef.current.srcObject = remoteUser.stream;
      }
    });
  }, [remoteUsers]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>Комната: {roomId}</div>
        <div>Участников: {remoteUsers.size + 1}</div>
        <div>Мой ID: {peerId.slice(0, 8)}...</div>
      </div>

      <div className={styles.videoGrid}>
        {/* Свое видео */}
        <div className={styles.videoContainer}>
          <video ref={selfVideo} autoPlay playsInline muted className={styles.video} />
          <div className={styles.videoLabel}>{user.username} (ты)</div>
        </div>

        {/* Видео других */}
        {Array.from(remoteUsers.values()).map((remoteUser) => (
          <RemoteVideo
            key={remoteUser.peerId}
            videoRef={remoteUser.videoRef}
            username={remoteUser.username}
          />
        ))}
      </div>
    </div>
  );
};