'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { PageScrollCue } from '@/components/ui/page-scroll-cue'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const TABLE_ASPECT_RATIO = 1637 / 1280
const LEFT_ASPECT_RATIO = 2826 / 1144
const RIGHT_ASPECT_RATIO = 2819 / 1148

const POEM_LINES = [
  { text: '屏前同岁月', className: 'scene-poem__lead' },
  { text: '寻常伏案识知己', className: 'scene-poem__middle' },
  { text: '前路慢慢行', className: 'scene-poem__closing' },
] as const

type SceneSize = {
  height: number
  width: number
}

function FirstPagePoem({
  play,
  reduceMotion,
}: {
  play: boolean
  reduceMotion: boolean | null
}) {
  return (
    <div
      aria-label="屏前同岁月，寻常伏案识知己，前路慢慢行"
      className="scene-poem scene-poem--first"
    >
      <div aria-hidden="true" className="scene-poem__overlay" />
      {POEM_LINES.map(({ className, text }, index) => (
        <motion.p
          className={className}
          initial={{ opacity: 0, x: 0, y: 42 }}
          animate={
            play
              ? { opacity: 1, x: 0, y: 0 }
              : { opacity: 0, x: 0, y: 42 }
          }
          key={text}
          transition={{
            delay: reduceMotion ? 0 : 0.22 + index * 0.66,
            duration: reduceMotion ? 0.01 : 1.35,
            ease: EASE_OUT,
          }}
        >
          {text}
        </motion.p>
      ))}
    </div>
  )
}

const FIRST_PAGE_PHOTOS = [
  { id: 'graduation-two', src: '/assets/毕业合照2.jpg', alt: '毕业合照二' },
  { id: 'graduation-one', src: '/assets/毕业合照1.jpg', alt: '毕业合照一' },
  { id: 'graduation-three', src: '/assets/合照.jpg', alt: '毕业合照三' },
] as const

function FirstPagePhotos({
  active,
  reduceMotion,
}: {
  active: boolean
  reduceMotion: boolean | null
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<
    (typeof FIRST_PAGE_PHOTOS)[number] | null
  >(null)
  const [photosEntered, setPhotosEntered] = useState(false)

  useEffect(() => {
    if (!active) {
      setPhotosEntered(false)
      return
    }

    const timer = window.setTimeout(
      () => setPhotosEntered(true),
      reduceMotion ? 0 : 3_000,
    )
    return () => window.clearTimeout(timer)
  }, [active, reduceMotion])

  const openPhoto = (photo: (typeof FIRST_PAGE_PHOTOS)[number]) => {
    setPhotosEntered(true)
    setSelectedPhoto(photo)
  }

  return (
    <>
      <div aria-label="毕业合照" className="scene-first-photos">
        {FIRST_PAGE_PHOTOS.map((photo, index) => (
          <motion.button
            aria-label={`查看${photo.alt}`}
            className="scene-photo-marker scene-first-photo"
            initial={{ opacity: 0, y: 20, scale: 0.78 }}
            animate={{
              opacity: active && selectedPhoto?.id !== photo.id ? 1 : 0,
              y: 0,
              scale: 1,
            }}
            layoutId={`first-page-photo-${photo.id}`}
            key={photo.id}
            transition={{
              delay: photosEntered ? 0 : 2.25 + index * 0.18,
              duration: reduceMotion ? 0.01 : 0.7,
              ease: EASE_OUT,
              layout: {
                duration: reduceMotion ? 0.01 : 0.38,
                ease: EASE_OUT,
              },
            }}
            type="button"
            onClick={() => openPhoto(photo)}
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
              layoutId={`first-page-photo-${selectedPhoto.id}`}
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

function useSceneSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<SceneSize>({ height: 0, width: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      setSize({
        height: Math.round(element.clientHeight),
        width: Math.round(element.clientWidth),
      })
    }
    const observer = new ResizeObserver(update)

    update()
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}

export function FirstPageContent({ active }: { active: boolean }) {
  const stageRef = useRef<HTMLElement>(null)
  const size = useSceneSize(stageRef)
  const reduceMotion = useReducedMotion()

  const sideWidth = size.width / 2
  const sideHeight = Math.round(sideWidth * LEFT_ASPECT_RATIO)
  const rightHeight = Math.round(sideWidth * RIGHT_ASPECT_RATIO)
  const tableHeight = Math.round(size.width * TABLE_ASPECT_RATIO)
  const tableHiddenOffset = tableHeight + 48
  const sideHiddenOffset = sideWidth + 24
  const pigOneSize = Math.round(size.width * 0.164)
  const pigTwoWidth = Math.round(size.width * 0.164)
  const pigTwoHeight = Math.round(size.width * 0.134)

  return (
    <section
      ref={stageRef}
      aria-label="第一章节场景"
      className="relative h-dvh w-full overflow-hidden bg-[#8a6a4f]"
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full select-none object-cover"
        draggable={false}
        loading="eager"
        src="/assets/同桌背景.jpg"
        style={{ zIndex: 0 }}
      />
      <FirstPagePoem play={active} reduceMotion={reduceMotion} />
      <FirstPagePhotos active={active} reduceMotion={reduceMotion} />
      {size.width > 0 && (
        <>
          <motion.img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 block w-full select-none"
            draggable={false}
            initial={{ opacity: 0, y: tableHiddenOffset, x: '-50%' }}
            animate={
              active
                ? { opacity: 1, y: 0, x: '-50%' }
                : { opacity: 0, y: tableHiddenOffset, x: '-50%' }
            }
            src="/assets/同桌桌子.jpg"
            style={{
              filter:
                'drop-shadow(0 -8px 9px rgba(42, 24, 16, 0.2)) drop-shadow(0 14px 18px rgba(42, 24, 16, 0.4))',
              height: `${tableHeight}px`,
              zIndex: 1,
            }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.95,
              ease: EASE_OUT,
            }}
          />

          <motion.img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 block select-none"
            draggable={false}
            initial={{ opacity: 0, x: -sideHiddenOffset, scaleX: -1 }}
            animate={
              active
                ? { opacity: 0.65, x: 0, scaleX: -1 }
                : { opacity: 0, x: -sideHiddenOffset, scaleX: -1 }
            }
            src="/assets/猪2.png"
            style={{
              filter: 'drop-shadow(3px 6px 5px rgba(39, 24, 18, 0.25))',
              height: `${pigTwoHeight}px`,
              left: '17%',
              width: `${pigTwoWidth}px`,
              zIndex: 5,
            }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.78,
              delay: reduceMotion ? 0 : 0.95,
              ease: EASE_OUT,
            }}
          />

          <motion.img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 block select-none"
            draggable={false}
            initial={{ opacity: 0, x: sideHiddenOffset }}
            animate={
              active
                ? { opacity: 0.65, x: 0 }
                : { opacity: 0, x: sideHiddenOffset }
            }
            src="/assets/猪1.png"
            style={{
              filter: 'drop-shadow(3px 6px 5px rgba(39, 24, 18, 0.25))',
              height: `${pigOneSize}px`,
              right: '17%',
              width: `${pigOneSize}px`,
              zIndex: 5,
            }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.78,
              delay: reduceMotion ? 0 : 0.95,
              ease: EASE_OUT,
            }}
          />

          <motion.img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-0 block w-1/2 select-none"
            draggable={false}
            initial={{ opacity: 0, x: -sideHiddenOffset }}
            animate={
              active
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -sideHiddenOffset }
            }
            src="/assets/左.png"
            style={{
              filter:
                'drop-shadow(0 -10px 10px rgba(42, 24, 16, 0.24)) drop-shadow(0 8px 12px rgba(42, 24, 16, 0.32))',
              height: `${sideHeight}px`,
              zIndex: 10,
            }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.78,
              delay: reduceMotion ? 0 : 0.95,
              ease: EASE_OUT,
            }}
          />

          <motion.img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-0 block w-1/2 select-none"
            draggable={false}
            initial={{ opacity: 0, x: sideHiddenOffset }}
            animate={
              active
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: sideHiddenOffset }
            }
            src="/assets/右.png"
            style={{
              filter:
                'drop-shadow(0 -10px 10px rgba(42, 24, 16, 0.24)) drop-shadow(0 8px 12px rgba(42, 24, 16, 0.32))',
              height: `${rightHeight}px`,
              zIndex: 10,
            }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.78,
              delay: reduceMotion ? 0 : 0.95,
              ease: EASE_OUT,
            }}
          />
        </>
      )}
      <PageScrollCue active={active} />
    </section>
  )
}
