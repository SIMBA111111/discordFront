import { Dispatch, RefObject, SetStateAction } from "react"
import { IVideoAudio } from "../VideoCall"

import styles from './styles.module.scss'


interface IControlPanel {
    peerConnectionRef: RefObject<RTCPeerConnection | null>
    selfVideoRef: RefObject<HTMLVideoElement | null>
    isVideoAudio: IVideoAudio
    setIsVideoAudio: Dispatch<SetStateAction<IVideoAudio>>
}

export const ControlPanel: React.FC<IControlPanel> = ({peerConnectionRef, selfVideoRef, isVideoAudio, setIsVideoAudio}) => {

        // Для включения/выключения камеры
    const handleVideoToggle = async () => {
        try {
            // Получаем текущий поток
            const currentStream = selfVideoRef.current?.srcObject as MediaStream;
            
            if (!currentStream) {
                // Если потока нет, создаем новый с камерой
                const newStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: isVideoAudio.audio 
                });
                
                if (selfVideoRef.current) {
                    selfVideoRef.current.srcObject = newStream;
                }
                
                // Добавляем треки в peerConnection
                if (peerConnectionRef.current) {
                    newStream.getTracks().forEach(track => {
                        peerConnectionRef.current?.addTrack(track, newStream);
                    });
                }
            } else {
                // Переключаем видео трек
                const videoTrack = currentStream.getVideoTracks()[0];
                
                if (videoTrack) {
                    // Если видео включено - выключаем
                    if (isVideoAudio.video) {
                        videoTrack.enabled = false;
                    } else {
                        // Если видео выключено - включаем
                        videoTrack.enabled = true;
                    }
                } else {
                    // Если видео трека нет - создаем новый
                    const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const newVideoTrack = newVideoStream.getVideoTracks()[0];
                    
                    // Добавляем новый видео трек в существующий поток
                    currentStream.addTrack(newVideoTrack);
                    
                    // Заменяем трек в peerConnection
                    const senders = peerConnectionRef.current?.getSenders() || [];
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    
                    if (videoSender) {
                        await videoSender.replaceTrack(newVideoTrack);
                    } else {
                        peerConnectionRef.current?.addTrack(newVideoTrack, currentStream);
                    }
                }
            }

            // Обновляем состояние
            setIsVideoAudio((prev: IVideoAudio) => ({
                ...prev,
                video: !prev.video,
            }))
        } catch (err) {
            console.error('Error toggling video:', err);
        }
    }

    // Для включения/выключения микрофона
    const handleAudioToggle = async () => {
        try {
            // Получаем текущий поток
            const currentStream = selfVideoRef.current?.srcObject as MediaStream;
            
            if (!currentStream) {
                // Если потока нет, создаем новый с микрофоном
                const newStream = await navigator.mediaDevices.getUserMedia({ 
                    video: isVideoAudio.video, 
                    audio: true 
                });
                
                if (selfVideoRef.current) {
                    selfVideoRef.current.srcObject = newStream;
                }
                
                // Добавляем треки в peerConnection
                if (peerConnectionRef.current) {
                    newStream.getTracks().forEach(track => {
                        peerConnectionRef.current?.addTrack(track, newStream);
                    });
                }
            } else {
                // Переключаем аудио трек
                const audioTrack = currentStream.getAudioTracks()[0];
                
                if (audioTrack) {
                    // Если аудио включено - выключаем
                    if (isVideoAudio.audio) {
                        audioTrack.enabled = false;
                    } else {
                        // Если аудио выключено - включаем
                        audioTrack.enabled = true;
                    }
                } else {
                    // Если аудио трека нет - создаем новый
                    const newAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const newAudioTrack = newAudioStream.getAudioTracks()[0];
                    
                    // Добавляем новый аудио трек в существующий поток
                    currentStream.addTrack(newAudioTrack);
                    
                    // Заменяем трек в peerConnection
                    const senders = peerConnectionRef.current?.getSenders() || [];
                    const audioSender = senders.find(s => s.track?.kind === 'audio');
                    
                    if (audioSender) {
                        await audioSender.replaceTrack(newAudioTrack);
                    } else {
                        peerConnectionRef.current?.addTrack(newAudioTrack, currentStream);
                    }
                }
            }

            // Обновляем состояние
            setIsVideoAudio((prev: IVideoAudio) => ({
                ...prev,
                audio: !prev.audio,
            }))
        } catch (err) {
            console.error('Error toggling audio:', err);
        }
    }

    return (
        <>
            <div onClick={() => handleVideoToggle()}>выключить видео</div>
            <div onClick={() => handleAudioToggle()}>выключить звук</div>
        </>
    )
}