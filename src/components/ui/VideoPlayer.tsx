import React, { useState, useRef, useEffect } from 'react'
import { parseVideoUrl, VideoInfo } from '../../utils/videoUtils'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  caseId?: string
  onClose?: () => void
  autoPlay?: boolean
  onProgressUpdate?: (progress: number) => void
  initialProgress?: number
  subtitles?: Array<{ lang: string; label: string; src: string }>
  qualityOptions?: Array<{ label: string; src: string }>
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  caseId,
  onClose,
  autoPlay = false,
  onProgressUpdate,
  initialProgress = 0,
  subtitles = [],
  qualityOptions = [],
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(initialProgress)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [buffered, setBuffered] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeSliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Определяем тип видео
  const videoInfo: VideoInfo = parseVideoUrl(selectedQuality ? qualityOptions.find(q => q.label === selectedQuality)?.src || src : src)
  const isEmbedded = videoInfo.type === 'youtube' || videoInfo.type === 'vimeo'
  
  // Инициализация видео
  useEffect(() => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    video.volume = isMuted ? 0 : volume
    video.playbackRate = playbackRate
    
    // Восстанавливаем позицию просмотра
    if (initialProgress > 0 && video.duration) {
      video.currentTime = (initialProgress / 100) * video.duration
    }
  }, [initialProgress, volume, isMuted, playbackRate])
  
  // Обработка событий видео
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    let lastUpdateTime = 0

    const handleTimeUpdate = () => {
      if (video.duration) {
        const currentProgress = (video.currentTime / video.duration) * 100
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setProgress(currentProgress)
        
        // Обновляем прогресс на сервер каждую секунду
        const now = Date.now()
        if (onProgressUpdate && (now - lastUpdateTime > 1000 || Math.abs(currentProgress - progress) > 5)) {
          onProgressUpdate(currentProgress)
          lastUpdateTime = now
        }
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialProgress > 0 && video.duration) {
        video.currentTime = (initialProgress / 100) * video.duration
        setCurrentTime(video.currentTime)
        setProgress(initialProgress)
      }
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercent)
      }
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [onProgressUpdate, progress, initialProgress])

  // Обработка полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Автоскрытие контролов
  useEffect(() => {
    if (showControls && isPlaying && !showSettings && !showQualityMenu && !showSubtitlesMenu) {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
    }
  }, [showControls, isPlaying, showSettings, showQualityMenu, showSubtitlesMenu])

  // Автоскрытие слайдера громкости
  useEffect(() => {
    if (showVolumeSlider) {
      if (volumeSliderTimeout.current) {
        clearTimeout(volumeSliderTimeout.current)
      }
      volumeSliderTimeout.current = setTimeout(() => {
        setShowVolumeSlider(false)
      }, 2000)
    }
    return () => {
      if (volumeSliderTimeout.current) {
        clearTimeout(volumeSliderTimeout.current)
      }
    }
  }, [showVolumeSlider])

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
    } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
      (containerRef.current as any).webkitRequestFullscreen()
    } else if ((containerRef.current as any)?.mozRequestFullScreen) {
      (containerRef.current as any).mozRequestFullScreen()
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setShowControls(true)
    }
  }

  const seek = (seconds: number) => {
    if (videoRef.current && duration) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setProgress((newTime / duration) * 100)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    setProgress(percentage * 100)
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      videoRef.current.muted = newVolume === 0
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
      setShowVolumeSlider(true)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
      setShowVolumeSlider(true)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSettings(false)
    }
  }

  const changeQuality = (qualitySrc: string, label: string) => {
    if (videoRef.current) {
      videoRef.current.src = qualitySrc
      setSelectedQuality(label)
      setShowQualityMenu(false)
      videoRef.current.load()
      if (isPlaying) {
        videoRef.current.play()
      }
    }
  }

  const toggleSubtitle = (lang: string | null) => {
    setSelectedSubtitle(lang)
    setShowSubtitlesMenu(false)
    // Здесь можно добавить логику для переключения субтитров
    // если используется track элемент
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50"
      onTouchStart={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black/90 rounded-full text-white transition-all backdrop-blur-sm"
        >
          ✕
        </button>
      )}

      {/* Video Element or Embedded Player */}
      {isEmbedded ? (
        <iframe
          ref={iframeRef}
          src={videoInfo.url}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
        />
      ) : (
        <video
          ref={videoRef}
          src={videoInfo.url}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          autoPlay={autoPlay}
          playsInline
          preload="metadata"
        >
          {subtitles.map((subtitle) => (
            <track
              key={subtitle.lang}
              kind="subtitles"
              srcLang={subtitle.lang}
              label={subtitle.label}
              src={subtitle.src}
              default={selectedSubtitle === subtitle.lang}
            />
          ))}
        </video>
      )}

      {/* Buffering Indicator */}
      {isBuffering && !isEmbedded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-16 h-16 border-4 border-darkcase-crimson border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Volume Slider (Vertical) */}
      {showVolumeSlider && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center text-white hover:text-darkcase-crimson transition-colors"
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <div className="relative w-1 h-32 bg-darkcase-darkGray/50 rounded-full">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-darkcase-crimson to-darkcase-red rounded-full transition-all"
                style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ writingMode: 'vertical-lr' }}
              />
            </div>
            <span className="text-xs text-white/60">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Progress Bar (только для прямых видео, не для embedded) */}
      {!isEmbedded && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-darkcase-darkGray/50 cursor-pointer z-10"
          onClick={handleSeek}
          onMouseMove={(e) => {
            if (!duration) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = x / rect.width
            // Можно показать preview времени при наведении
          }}
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-white/20 transition-all"
            style={{ width: `${buffered}%` }}
          />
          {/* Current Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-darkcase-crimson to-darkcase-red transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6 z-10">
          {title && <h3 className="text-white font-bold mb-3 text-glow truncate">{title}</h3>}
          
          {/* Time Display (только для прямых видео) */}
          {!isEmbedded && (
            <div className="flex items-center justify-between mb-4 text-xs text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            {/* Rewind 10s (только для прямых видео) */}
            {!isEmbedded && (
              <button
                onClick={() => seek(-10)}
                className="w-10 h-10 flex items-center justify-center bg-darkcase-darkGray/80 hover:bg-darkcase-mediumGray rounded-full text-white transition-colors"
                title="Назад 10 сек"
              >
                ⏪
              </button>
            )}

            {/* Play/Pause (только для прямых видео) */}
            {!isEmbedded && (
              <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center bg-darkcase-crimson hover:bg-darkcase-red rounded-full text-white transition-colors shadow-blood"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            )}

            {/* Forward 10s (только для прямых видео) */}
            {!isEmbedded && (
              <button
                onClick={() => seek(10)}
                className="w-10 h-10 flex items-center justify-center bg-darkcase-darkGray/80 hover:bg-darkcase-mediumGray rounded-full text-white transition-colors"
                title="Вперед 10 сек"
              >
                ⏩
              </button>
            )}

            {/* Volume (только для прямых видео) */}
            {!isEmbedded && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowVolumeSlider(!showVolumeSlider)
                    if (!showVolumeSlider) {
                      setShowVolumeSlider(true)
                    }
                  }}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="w-10 h-10 flex items-center justify-center bg-darkcase-darkGray/80 hover:bg-darkcase-mediumGray rounded-full text-white transition-colors"
                  title="Громкость"
                >
                  {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </button>
              </div>
            )}

            {/* Settings Menu (только для прямых видео) */}
            {!isEmbedded && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings)
                    setShowQualityMenu(false)
                    setShowSubtitlesMenu(false)
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-darkcase-darkGray/80 hover:bg-darkcase-mediumGray rounded-full text-white transition-colors"
                  title="Настройки"
                >
                  ⚙️
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg p-2 min-w-[200px] border border-darkcase-mediumGray/50 z-30">
                    {/* Playback Speed */}
                    <div className="mb-2">
                      <div className="text-xs text-white/60 mb-1 px-2">Скорость</div>
                      <div className="flex flex-wrap gap-1">
                        {playbackRates.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`px-2 py-1 text-xs rounded ${
                              playbackRate === rate
                                ? 'bg-darkcase-crimson text-white'
                                : 'bg-darkcase-darkGray/50 text-white/80 hover:bg-darkcase-mediumGray'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    {qualityOptions.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            setShowQualityMenu(!showQualityMenu)
                            setShowSubtitlesMenu(false)
                          }}
                          className="w-full text-left px-2 py-1 text-xs text-white/80 hover:bg-darkcase-mediumGray rounded flex items-center justify-between"
                        >
                          <span>Качество</span>
                          <span>▶</span>
                        </button>
                        {showQualityMenu && (
                          <div className="mt-1 pl-2 border-l border-darkcase-mediumGray/30">
                            {qualityOptions.map((quality) => (
                              <button
                                key={quality.label}
                                onClick={() => changeQuality(quality.src, quality.label)}
                                className={`w-full text-left px-2 py-1 text-xs rounded ${
                                  selectedQuality === quality.label
                                    ? 'bg-darkcase-crimson text-white'
                                    : 'text-white/80 hover:bg-darkcase-mediumGray'
                                }`}
                              >
                                {quality.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subtitles */}
                    {subtitles.length > 0 && (
                      <div>
                        <button
                          onClick={() => {
                            setShowSubtitlesMenu(!showSubtitlesMenu)
                            setShowQualityMenu(false)
                          }}
                          className="w-full text-left px-2 py-1 text-xs text-white/80 hover:bg-darkcase-mediumGray rounded flex items-center justify-between"
                        >
                          <span>Субтитры</span>
                          <span>▶</span>
                        </button>
                        {showSubtitlesMenu && (
                          <div className="mt-1 pl-2 border-l border-darkcase-mediumGray/30">
                            <button
                              onClick={() => toggleSubtitle(null)}
                              className={`w-full text-left px-2 py-1 text-xs rounded ${
                                selectedSubtitle === null
                                  ? 'bg-darkcase-crimson text-white'
                                  : 'text-white/80 hover:bg-darkcase-mediumGray'
                              }`}
                            >
                              Выкл
                            </button>
                            {subtitles.map((subtitle) => (
                              <button
                                key={subtitle.lang}
                                onClick={() => toggleSubtitle(subtitle.lang)}
                                className={`w-full text-left px-2 py-1 text-xs rounded ${
                                  selectedSubtitle === subtitle.lang
                                    ? 'bg-darkcase-crimson text-white'
                                    : 'text-white/80 hover:bg-darkcase-mediumGray'
                                }`}
                              >
                                {subtitle.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center bg-darkcase-darkGray/80 hover:bg-darkcase-mediumGray rounded-full text-white transition-colors"
              title="Полноэкранный режим"
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showSettings || showQualityMenu || showSubtitlesMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowSettings(false)
            setShowQualityMenu(false)
            setShowSubtitlesMenu(false)
          }}
        />
      )}
    </div>
  )
}
