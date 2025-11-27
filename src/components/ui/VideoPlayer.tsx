import React, { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  onClose?: () => void
  autoPlay?: boolean
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  onClose,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.orientation === 90 || window.orientation === -90) {
        setIsFullscreen(true)
        enterFullscreen()
      } else {
        setIsFullscreen(false)
        exitFullscreen()
      }
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    return () => window.removeEventListener('orientationchange', handleOrientationChange)
  }, [])
  
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
    }
  }
  
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50"
      onTouchStart={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
        >
          ✕
        </button>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        autoPlay={autoPlay}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {title && <h3 className="text-white font-bold mb-2">{title}</h3>}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center bg-netflix-red rounded-full text-white"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-12 h-12 flex items-center justify-center bg-netflix-darkGray rounded-full text-white"
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

