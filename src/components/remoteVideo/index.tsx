'use client';

import { MouseEvent, RefObject, useEffect, useState } from 'react';
import soundOnIcon from '../../../public/images/png/sound.png'
import soundOffIcon from '../../../public/images/png/sound-off.png'

import styles from './styles.module.scss'

interface IRemoteVideo {
    remoteVideoRef: RefObject<HTMLVideoElement | null>
    remoteUserRef: any
}

export const RemoteVideo: React.FC<IRemoteVideo> = ({remoteVideoRef, remoteUserRef}) => {      
    const [isOpenVolumeBar, setIsOpenVolumeBar] = useState<boolean>(false)
    const [locationVolumeBar, setLocationVolumeBar] = useState<Record<string, number>>({left: 0, top: 0})

    const [isVisibleSoundBar, setIsVisibleSoundBar] = useState<boolean>(false)
    const [currentVolume, setCurrentVolume] = useState<number>(50)
    const [isDraggingVolume, setIsDraggingVolume] = useState<boolean>(false)

    useEffect(() => {
    
        const handleGlobalMouseUp = () => {
            if (isDraggingVolume) {
                setIsDraggingVolume(false)
            }
        }

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDraggingVolume && remoteVideoRef.current) {
                const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
                if (!soundVolumeBackgroundBar) return

                const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()
                
                let newCurrentVolume = ((e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width) * 100
                newCurrentVolume = Math.max(0, Math.min(100, newCurrentVolume))
                
                setCurrentVolume(newCurrentVolume)
                remoteVideoRef.current.volume = newCurrentVolume / 100
            }
        }

        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('mousemove', handleGlobalMouseMove)

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [isDraggingVolume, remoteUserRef])

    const handleMuteOnClick = () => {
        if (!remoteVideoRef.current) return

        if (remoteVideoRef.current.muted || remoteVideoRef.current.volume === 0) {
            remoteVideoRef.current.muted = false
            remoteVideoRef.current.volume = 0.5
            setCurrentVolume(50)
        } else {
            remoteVideoRef.current.muted = true
            setCurrentVolume(0)
        }
    }

    const handleMouseClickSoundBtn = (
        e: React.MouseEvent, 
    ) => {
        const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
        
        if (!soundVolumeBackgroundBar || !remoteVideoRef.current) return 

        const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()
        const positionOfNewVolume = (e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width
        const newVolume = Math.max(0, Math.min(1, positionOfNewVolume))
        console.log(newVolume);
        
        remoteVideoRef.current.volume = newVolume
        setCurrentVolume(newVolume * 100)
    }

    const handleMouseDownSoundBtn = (
        setIsDraggingVolume: (isDragging: boolean) => void
    ) => {
        setIsDraggingVolume(true)
    }

    const handleMouseUpSoundBtn = (
        setIsDraggingVolume: (isDragging: boolean) => void
    ) => {
        setIsDraggingVolume(false)
    }

    const handleOpenVolumeBar = async (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (isOpenVolumeBar) {
            setIsOpenVolumeBar(false)
        } else {
            console.log(e);
            console.log(e.clientX);
            console.log(e.clientY);
            
            const x = remoteVideoRef.current?.getBoundingClientRect()
            
            if (!x)
                return null 

            const leftShift = e.clientX - x.left
            const topShift = e.clientY - x.top

            setLocationVolumeBar((prev: any) => (
                {
                    left: leftShift,
                    top: topShift
                }
            ))
            setIsOpenVolumeBar(true)
        }
    } 

    return ( 
        <div className={styles.videoContainer} onContextMenu={(e: MouseEvent<HTMLDivElement>) => handleOpenVolumeBar(e)}>
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={styles.video}
            />
            <div className={styles.videoLabel}>
                {remoteUserRef?.username}
            </div>

            {isOpenVolumeBar &&
                <div 
                    className={styles.soundContainer} 
                    style={{left: locationVolumeBar.left, top: locationVolumeBar.top}}
                    onMouseEnter={() => setIsVisibleSoundBar(true)}
                    onMouseLeave={() => {
                        if (!isDraggingVolume) {
                            setIsVisibleSoundBar(false)
                        }
                    }}
                >
                    <button 
                        className={styles.soundBtn} 
                        onClick={() => handleMuteOnClick()}
                    >
                        {currentVolume ? <img src={soundOnIcon.src} alt="Sound" height={30}/> : <img src={soundOffIcon.src} alt="Sound off" height={30}/>}    
                    </button> 
                    
                    <div 
                        id='soundVolumeBackground' 
                        // className={isVisibleSoundBar ? styles.soundVolumeBackground : styles.soundVolumeBackground_hidden} 
                        className={styles.soundVolumeBackground} 
                        onClick={(e) => handleMouseClickSoundBtn(e)}
                        onMouseDown={(e) => handleMouseDownSoundBtn(setIsDraggingVolume)}
                    >
                        <div 
                            id='filledSoundBar' 
                            className={styles.soundVolumeFilled} 
                            style={{width: `${currentVolume}%`}}
                        >
                            <div 
                                // className={isVisibleSoundBar ? styles.pointer : styles.pointer_hidden}
                                className={styles.pointer}
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    handleMouseDownSoundBtn(setIsDraggingVolume)
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation()
                                    handleMouseUpSoundBtn(setIsDraggingVolume)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}