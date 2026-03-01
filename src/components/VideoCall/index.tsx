'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.scss'

interface IVideoCall {
    user: any
    roomId: string
}

interface IUser {
    uuid: string
    username: string
    polite: string // "true" или "false"
}

export const VideoCall: React.FC<IVideoCall> = ({user, roomId}: IVideoCall) => {
    const [remoteUser, setRemoteUser] = useState<any>({})
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket>(null)
    const selfVideo = useRef<HTMLVideoElement>(null)
    const remoteVideo = useRef<HTMLVideoElement>(null)
    const peerConnection = useRef<RTCPeerConnection | null>(null)

    
    // Используем useRef для флагов, чтобы они сохранялись между рендерами
    const polite = useRef(true)
    const makingOffer = useRef(false)
    const ignoreOffer = useRef(false)
    const isSettingRemoteAnswerPending = useRef(false)

    // Инициализация WebSocket
    useEffect(() => {
        const connectWebSocket = () => {
            try {
                const wsUrl = `ws://localhost:8080/ws?roomId=${roomId}&userId=${user.uuid}&username=${user.username}`;
                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                    setError(null);
                    
                    wsRef.current?.send(JSON.stringify({
                        type: 'join',
                        payload: {
                            userId: user.uuid,
                            username: user.username,
                            roomId: roomId
                        }
                    }));
                };

                wsRef.current.onclose = () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                    setTimeout(connectWebSocket, 3000);
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('WebSocket connection error');
                };

                wsRef.current.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        await handleWebSocketMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
            } catch (error) {
                console.error('Error creating WebSocket:', error);
                setError('Failed to create WebSocket connection');
            }
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [roomId, user.uuid]);

    // Создание PeerConnection
    const createPeerConnection = async () => {
        try {
            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            };

            peerConnection.current = new RTCPeerConnection(configuration);

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    wsRef.current?.send(JSON.stringify({
                        type: 'ice-candidate',
                        payload: {
                            candidate: event.candidate,
                            roomId: roomId
                        }
                    }));
                }
            };

            peerConnection.current.onconnectionstatechange = () => {
                console.log('Connection state:', peerConnection.current?.connectionState);
            };

            peerConnection.current.ontrack = (event) => {
                if (remoteVideo.current && event.streams[0]) {
                    remoteVideo.current.srcObject = event.streams[0];
                }
            };

            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            
            if (selfVideo.current) {
                selfVideo.current.srcObject = stream;
            }

            stream.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, stream);
            });

        } catch (error) {
            console.error('Error creating peer connection:', error);
            setError('Failed to create peer connection');
        }
    };

    // Создание offer
    const createOffer = async (user: IUser) => {
        if (!peerConnection.current) {
            await createPeerConnection();
        }

        if (!peerConnection.current) return;

        try {
            makingOffer.current = true;
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            
            wsRef.current?.send(JSON.stringify({
                type: 'offer',
                payload: {
                    description: offer,
                    roomId: roomId,
                    user: user
                }
            }));
        } catch (error) {
            console.error('Error creating offer:', error);
        } finally {
            makingOffer.current = false;
        }
    };

    // Обработчик сообщений WebSocket с логикой коллизий
    const handleWebSocketMessage = useCallback(async (data: any) => {
        try {
            switch (data.type) {
                case 'joined':
                    console.log('Тут типа мне камбэкается инфа что я заджоинился и полит ставится. Если я первый в комнате, то вежливый, остальные -неевежливые:', data);
                    polite.current = (data.payload.polite);
                    console.log('data?.otherUsers?.[0] === ', data?.otherUsers?.[0]);
                    
                    setRemoteUser(data?.otherUsers?.[0])
                    break;

                case 'user-joined':
                    console.log('User joined:', data.payload);
                    setRemoteUser(data.payload);
                    if (data.payload.userId !== user.uuid && polite.current) {
                        await createOffer(user);
                    }
                    break;

                case 'user-left':
                    console.log('User left:', data.payload);
                    setRemoteUser({});
                    if (peerConnection.current) {
                        peerConnection.current.close();
                        peerConnection.current = null;
                    }
                    break;

                case 'offer': {
                    // Логика обработки коллизий для offer
                    if (!peerConnection.current) {
                        await createPeerConnection();
                    }

                    if (!peerConnection.current) return;

                    // Проверяем готовность к получению offer
                    const readyForOffer = !makingOffer.current && 
                        (peerConnection.current.signalingState === "stable" || isSettingRemoteAnswerPending.current);
                    
                    // Определяем коллизию offer
                    const offerCollision = !readyForOffer;

                    // Устанавливаем ignoreOffer в зависимости от вежливости и коллизии
                    ignoreOffer.current = !polite.current && offerCollision;
                    
                    if (ignoreOffer.current) {
                        console.log('Ignoring offer due to collision (impolite peer)');
                        return;
                    }

                    isSettingRemoteAnswerPending.current = true;
                    await peerConnection.current.setRemoteDescription(data.payload.description);
                    isSettingRemoteAnswerPending.current = false;

                    // Так как мы уже в блоке offer, то тут if не нужен
                    await peerConnection.current.setLocalDescription();

                    wsRef.current?.send(JSON.stringify({
                        type: 'answer',
                        payload: {
                            description: peerConnection.current.localDescription,
                            roomId: roomId
                        }
                    }));
                    
                    break;
                }

                case 'answer':
                    if (peerConnection.current && 
                        peerConnection.current.signalingState === 'have-local-offer') {
                        await peerConnection.current.setRemoteDescription(data.payload.description);
                    }
                    break;

                case 'ice-candidate':
                    try {
                        if (peerConnection.current) {
                            await peerConnection.current.addIceCandidate(data.payload.candidate);
                        }
                    } catch (err) {
                        // Игнорируем ошибки добавления кандидатов, если мы игнорируем offer
                        if (!ignoreOffer.current) {
                            throw err;
                        }
                    }
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }, [user.uuid, polite.current]);


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Video Conference</h1>
          <div className={styles.roomInfo}>
          </div>
        </div>
      </div>

        <div className={styles.videoGrid}>
          <div className={styles.videoContainer}>
            <video
              ref={selfVideo}
              autoPlay
              playsInline
              muted
              className={styles.video}
            />
            <div className={styles.videoLabel}>
              {user.username}
            </div>
          </div>

          <div className={styles.videoContainer}>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className={styles.video}
            />
            <div className={styles.videoLabel}>
              {remoteUser?.username}
            </div>
          </div>
        </div>
      </div>
  );
}