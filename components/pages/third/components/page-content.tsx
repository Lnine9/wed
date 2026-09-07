 'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, useRef } from 'react'

const INTRO_VIDEO = '/assets/视频-裁剪.mp4'
const LOOP_VIDEO = '/assets/末尾循环-裁剪.mp4'
const INTRO_POSTER = '/assets/视频首帧.jpg'
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const POEM_LINES = ['时光辗转，尘埃落定', '我们许下约定', '自此，朝夕与共'] as const
const THIRD_PAGE_PHOTOS = [
  { id: '373071788235267', src: '/assets/373071788235267_.pic_web.webp', alt: '纪念照片一' },
  { id: '373081788235278', src: '/assets/373081788235278_.pic_web.webp', alt: '纪念照片二' },
  { id: '373191788235347', src: '/assets/373191788235347_.pic_web.webp', alt: '纪念照片五' },
  { id: '373171788235332', src: '/assets/373171788235332_.pic_web.webp', alt: '纪念照片四' },
  { id: '373091788235284', src: '/assets/373091788235284_.pic_web.webp', alt: '纪念照片三' },
] as const
const WED_ALBUM_PHOTOS = Array.from({ length: 12 }, (_, index) => ({
  id: `wed${index + 1}`,
  src: `/assets/wed${index + 1}.webp`,
  alt: `婚礼照片${index + 1}`,
}))
const THIRD_PAGE_ALBUM_PHOTOS = [...THIRD_PAGE_PHOTOS, ...WED_ALBUM_PHOTOS]

function ThirdPagePhotos({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion()
  const [selectedPhoto, setSelectedPhoto] = useState<
    (typeof THIRD_PAGE_PHOTOS)[number] | null
  >(null)

  useEffect(() => {
    if (!active) {
      setSelectedPhoto(null)
    }
  }, [active])

  return (
    <>
      <div aria-label="纪念照片" className="scene-third-photos">
        {THIRD_PAGE_PHOTOS.map((photo, index) => (
          <motion.button
            aria-label={`查看${photo.alt}`}
            animate={{
              opacity: active && selectedPhoto?.id !== photo.id ? 1 : 0,
              scale: 1,
              y: 0,
            }}
            className="scene-photo-marker scene-third-photo"
            initial={{ opacity: 0, scale: 0.78, y: 20 }}
            key={photo.id}
            layoutId={`third-page-photo-${photo.id}`}
            transition={{
              delay: reduceMotion ? 0 : 2.15 + index * 0.52,
              duration: reduceMotion ? 0.01 : 1.05,
              ease: EASE_OUT,
              layout: {
                duration: reduceMotion ? 0.01 : 0.38,
                ease: EASE_OUT,
              },
            }}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              alt=""
              aria-hidden="true"
              className="scene-photo-marker__frame"
              src="/assets/film-frame.png"
            />
            <img
              alt=""
              aria-hidden="true"
              className="scene-photo-marker__image"
              src={photo.src}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            aria-label={`${selectedPhoto.alt}预览`}
            aria-modal="true"
            className="scene-photo-preview"
            role="dialog"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              animate={{ opacity: 1 }}
              className="scene-photo-preview__backdrop"
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
            />
            <motion.div
              className="scene-photo-preview__content"
              layoutId={`third-page-photo-${selectedPhoto.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              <img alt={selectedPhoto.alt} src={selectedPhoto.src} />
              <button
                aria-label="关闭图片预览"
                className="scene-photo-preview__close"
                type="button"
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ThirdPageScrollCue({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="scene-third-scroll-cue">
      <motion.div
        aria-label="下滑，见证此刻"
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        className="scene-third-scroll-cue__content"
        initial={{ opacity: 0, y: 12 }}
        transition={{
          delay: 0,
          duration: reduceMotion ? 0.01 : 0.8,
          ease: EASE_OUT,
        }}
      >
        <svg
          aria-hidden="true"
          className="scene-third-scroll-cue__mark"
          fill="none"
          viewBox="0 0 40 68"
        >
          <path className="scene-third-scroll-cue__axis" d="M20 4v54" />
          <path className="scene-third-scroll-cue__arrow scene-third-scroll-cue__arrow--one" d="m12 12 8 8 8-8" />
          <path className="scene-third-scroll-cue__arrow scene-third-scroll-cue__arrow--two" d="m12 29 8 8 8-8" />
        </svg>
        <span>见证此刻</span>
      </motion.div>
    </div>
  )
}

function ThirdPageAlbum({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion()
  const thumbnailRailRef = useRef<HTMLDivElement>(null)
  const [albumOpen, setAlbumOpen] = useState(false)
  const [activeAlbumPhoto, setActiveAlbumPhoto] = useState(0)
  const [autoScrollPaused, setAutoScrollPaused] = useState(false)

  useEffect(() => {
    if (!active) {
      setAlbumOpen(false)
    }
  }, [active])

  useEffect(() => {
    if (!albumOpen || autoScrollPaused || THIRD_PAGE_ALBUM_PHOTOS.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveAlbumPhoto((current) => (current + 1) % THIRD_PAGE_ALBUM_PHOTOS.length)
    }, 2800)

    return () => window.clearInterval(timer)
  }, [albumOpen, autoScrollPaused])

  useEffect(() => {
    if (!albumOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAlbumOpen(false)
      } else if (event.key === 'ArrowLeft') {
        setAutoScrollPaused(true)
        setActiveAlbumPhoto((current) =>
          current === 0 ? THIRD_PAGE_ALBUM_PHOTOS.length - 1 : current - 1,
        )
      } else if (event.key === 'ArrowRight') {
        setAutoScrollPaused(true)
        setActiveAlbumPhoto((current) => (current + 1) % THIRD_PAGE_ALBUM_PHOTOS.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [albumOpen])

  useEffect(() => {
    const rail = thumbnailRailRef.current
    const thumbnail = rail?.children[activeAlbumPhoto] as HTMLElement | undefined
    if (albumOpen && thumbnail) {
      thumbnail.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activeAlbumPhoto, albumOpen, reduceMotion])

  const openAlbum = () => {
    setAutoScrollPaused(false)
    setAlbumOpen(true)
  }

  const selectPhoto = (index: number) => {
    setAutoScrollPaused(true)
    setActiveAlbumPhoto(index)
  }

  return (
    <>
      <button
        aria-label="打开相册"
        className="scene-third-album-trigger"
        data-deck-control
        type="button"
        onClick={openAlbum}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 7.5h3l1.25-2h7.5l1.25 2H20v11H4z" />
          <circle cx="12" cy="13" r="3.25" />
        </svg>
        <span>相册</span>
      </button>

      <AnimatePresence>
        {albumOpen && (
          <motion.div
            aria-label="相册"
            aria-modal="true"
            className="scene-album"
            role="dialog"
            onClick={() => setAlbumOpen(false)}
          >
            <motion.div
              animate={{ opacity: 1 }}
              className="scene-album__backdrop"
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
            />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="scene-album__panel"
              initial={{ opacity: 0, y: 18 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: EASE_OUT }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="scene-album__header">
                <span className="scene-album__eyebrow">OUR MOMENTS</span>
                <button
                  aria-label="关闭相册"
                  className="scene-album__close"
                  type="button"
                  onClick={() => setAlbumOpen(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="scene-album__hero">
                <img
                  alt={THIRD_PAGE_ALBUM_PHOTOS[activeAlbumPhoto].alt}
                  decoding="async"
                  loading="lazy"
                  src={THIRD_PAGE_ALBUM_PHOTOS[activeAlbumPhoto].src}
                />
                <span className="scene-album__counter">
                  {String(activeAlbumPhoto + 1).padStart(2, '0')} /{' '}
                  {String(THIRD_PAGE_ALBUM_PHOTOS.length).padStart(2, '0')}
                </span>
              </div>
              <div className="scene-album__rail-wrap">
                <div
                  aria-label="相册缩略图"
                  className="scene-album__rail"
                  ref={thumbnailRailRef}
                  onPointerDown={() => setAutoScrollPaused(true)}
                  onWheel={() => setAutoScrollPaused(true)}
                >
                  {THIRD_PAGE_ALBUM_PHOTOS.map((photo, index) => (
                    <button
                      aria-label={`查看${photo.alt}`}
                      aria-pressed={index === activeAlbumPhoto}
                      className={`scene-album__thumbnail ${
                        index === activeAlbumPhoto ? 'is-active' : ''
                      }`}
                      key={photo.id}
                      type="button"
                      onClick={() => selectPhoto(index)}
                    >
                      <img
                        alt=""
                        aria-hidden="true"
                        decoding="async"
                        height="96"
                        loading="lazy"
                        src={photo.src}
                        width="112"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function ThirdPageContent({ active }: { active: boolean }) {
  const introRef = useRef<HTMLVideoElement>(null)
  const loopRef = useRef<HTMLVideoElement>(null)
  const [showLoop, setShowLoop] = useState(false)
  const [loopPlaying, setLoopPlaying] = useState(false)

  useEffect(() => {
    const intro = introRef.current
    const loop = loopRef.current
    if (!intro || !loop) return

    if (!active) {
      intro.pause()
      loop.pause()
      intro.currentTime = 0
      loop.currentTime = 0
      setShowLoop(false)
      setLoopPlaying(false)
      return
    }

    setShowLoop(false)
    setLoopPlaying(false)
    intro.currentTime = 0
    loop.currentTime = 0

    const startIntro = () => {
      void intro.play()
    }

    intro.addEventListener('canplay', startIntro)
    if (intro.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startIntro()
    }

    return () => intro.removeEventListener('canplay', startIntro)
  }, [active])

  const handleIntroEnded = () => {
    const loop = loopRef.current
    if (loop) {
      loop.currentTime = 0
      setLoopPlaying(false)
      void loop.play().catch(() => setLoopPlaying(false))
    }
  }

  return (
    <section aria-label="第三页视频" className="scene-video-page">
      <video
        ref={introRef}
        aria-hidden={showLoop && loopPlaying}
        className={`scene-video-page__video ${
          showLoop && loopPlaying ? 'is-hidden' : 'is-visible'
        }`}
        muted
        playsInline
        poster={INTRO_POSTER}
        preload="auto"
        src={INTRO_VIDEO}
        onEnded={() => {
          setShowLoop(true)
          handleIntroEnded()
        }}
      />
      <video
        ref={loopRef}
        aria-hidden={!showLoop || !loopPlaying}
        className={`scene-video-page__video ${
          showLoop && loopPlaying ? 'is-visible' : 'is-hidden'
        }`}
        loop
        muted
        playsInline
        preload="auto"
        src={LOOP_VIDEO}
        onPlaying={() => setLoopPlaying(true)}
      />
      <div aria-hidden="true" className="scene-video-page__fade scene-video-page__fade--bottom" />
      <div aria-hidden="true" className="scene-video-page__poem-overlay" />
      <div
        aria-label="时光辗转，尘埃落定。我们许下约定。自此，朝夕与共"
        className="scene-video-poem"
      >
        {POEM_LINES.map((line, index) => (
          <motion.p
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 42 }}
            className={`scene-video-poem__line scene-video-poem__line--${index}`}
            initial={{ opacity: 0, y: 42 }}
            key={line}
            transition={{
              delay: 0.3 + index * 0.46,
              duration: 1.35,
              ease: EASE_OUT,
            }}
          >
            {line}
          </motion.p>
        ))}
      </div>
      <ThirdPagePhotos active={active} />
      <ThirdPageAlbum active={active} />
      <ThirdPageScrollCue active={active} />
      <button
        aria-label="进入下一页"
        className="scene-third-next-zone"
        data-deck-next
        type="button"
      />
    </section>
  )
}
