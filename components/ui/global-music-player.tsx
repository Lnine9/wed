'use client'

import { useEffect, useRef, useState } from 'react'

const INITIAL_VOLUME = 0.22
const FADE_IN_MS = 1000
const FADE_OUT_MS = 600

type PlayerState = 'idle' | 'playing' | 'fading-out' | 'paused'

export function GlobalMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<number | null>(null)
  const fadeTokenRef = useRef(0)
  const stateRef = useRef<PlayerState>('idle')
  const [state, setState] = useState<PlayerState>('idle')

  const setPlayerState = (next: PlayerState) => {
    stateRef.current = next
    setState(next)
  }

  const cancelFade = () => {
    fadeTokenRef.current += 1
    if (fadeTimerRef.current !== null) {
      window.clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }

  const fadeVolume = (target: number, duration: number, done?: () => void) => {
    const audio = audioRef.current
    if (!audio) return

    cancelFade()
    const token = fadeTokenRef.current
    const start = audio.volume
    const startedAt = performance.now()
    const tick = () => {
      if (fadeTokenRef.current !== token) return
      const progress = Math.min((performance.now() - startedAt) / duration, 1)
      audio.volume = start + (target - start) * progress
      if (progress >= 1) {
        cancelFade()
        done?.()
      }
    }

    fadeTimerRef.current = window.setInterval(tick, 16)
    tick()
  }

  // Must remain synchronous with the click that grants media playback permission.
  const startFromUserGesture = () => {
    const audio = audioRef.current
    if (!audio) return

    cancelFade()
    audio.volume = 0
    audio.muted = true
    const playPromise = audio.play()

    // Do not await playPromise before unmuting: that would leave the user gesture.
    audio.muted = false
    setPlayerState('playing')
    fadeVolume(INITIAL_VOLUME, FADE_IN_MS)

    void playPromise.catch(() => {
      audio.pause()
      audio.muted = true
      audio.volume = 0
      setPlayerState('paused')
    })
  }

  const pauseWithFade = () => {
    const audio = audioRef.current
    if (!audio || stateRef.current !== 'playing') return

    setPlayerState('fading-out')
    fadeVolume(0, FADE_OUT_MS, () => {
      audio.pause()
      audio.muted = true
      setPlayerState('paused')
    })
  }

  const togglePlayback = () => {
    if (stateRef.current === 'playing') {
      pauseWithFade()
      return
    }
    startFromUserGesture()
  }

  useEffect(() => {
    const onEnter = () => startFromUserGesture()
    window.addEventListener('initial-loading-enter', onEnter)

    return () => {
      window.removeEventListener('initial-loading-enter', onEnter)
      cancelFade()
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const isPlaying = state === 'playing'

  return (
    <>
      <audio
        ref={audioRef}
        loop
        playsInline
        preload="auto"
        src="/audio/遇到-方雅贤.mp3"
      />
      <button
        aria-label={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        className={`global-music-player${isPlaying ? ' is-playing' : ''}`}
        data-deck-control
        onClick={(event) => {
          event.stopPropagation()
          togglePlayback()
        }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <svg aria-hidden="true" className="global-music-player__icon" viewBox="0 0 100 100">
          <circle className="global-music-player__disc" cx="50" cy="50" r="46" />
          <circle className="global-music-player__groove" cx="50" cy="50" r="31" />
          <circle className="global-music-player__label" cx="50" cy="50" r="13" />
          <circle className="global-music-player__hole" cx="50" cy="50" r="3" />
          <path className="global-music-player__shine" d="M22 34a33 33 0 0 1 21-15" />
        </svg>
      </button>
    </>
  )
}
