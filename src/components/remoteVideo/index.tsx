// app/components/remoteVideo/index.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';

interface IRemoteVideo {
  videoRef: React.RefObject<HTMLVideoElement>;
  username: string;
}

export const RemoteVideo: React.FC<IRemoteVideo> = ({ videoRef, username }) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div 
      className={styles.videoContainer}
      onMouseEnter={() => setIsVolumeVisible(true)}
      onMouseLeave={() => setIsVolumeVisible(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.video}
      />
      <div className={styles.videoLabel}>
        {username}
      </div>
      
      {isVolumeVisible && (
        <div className={styles.volumeControl}>
          <button onClick={toggleMute} className={styles.volumeButton}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
      )}
    </div>
  );
};