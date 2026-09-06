'use client'

import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { PageScrollCue } from '@/components/ui/page-scroll-cue'
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const HOLD_DELAY = 170
const MOVE_TOLERANCE = 8
const HEART_LIFETIME = 1_800
const MAIN_MOUNTAIN_WIDTH = 942
const MAIN_MOUNTAIN_HEIGHT = 1586
const PIG_ROUTE_DELAY = 1.63
const PIG_ROUTE_DURATION = 2.4
const PIG_ROUTE_TIMES = [0, 0.12, 0.4, 0.7, 1] as const
const PHOTO_ROUTE_TIMES = [0.12, 0.4, 0.7, 1] as const

type SceneSize = {
  height: number
  width: number
}

type Point = {
  x: number
  y: number
}

type Reaction = {
  id: number
  kind: 'carrot' | 'heart'
  drift: number
}

type PhotoMarker = {
  id: string
  src: string
  alt: string
  x: number
  y: number
}

const PHOTO_MARKERS: PhotoMarker[] = [
  { id: 'middle-left', src: '/assets/洗象池合照.jpg', alt: '干杯合照', x: 0.4, y: 0.582 },
  { id: 'middle-right', src: '/assets/干杯.jpg', alt: '山上爱心合照', x: 0.65, y: 0.458 },
  { id: 'upper', src: '/assets/山顶合照.jpg', alt: '山顶合照', x: 0.522, y: 0.147 },
  { id: 'summit', src: '/assets/山上爱心.jpg', alt: '山顶风景', x: 0.582, y: 0.06 },
]

const POEM_LINES = [
  { text: '同窗逢年少', className: 'scene-poem__lead' },
  { text: '云雾峨眉情字相邀', className: 'scene-poem__middle' },
  { text: '山海共良宵', className: 'scene-poem__closing' },
] as const

function ScenePoem({
  play,
  reduceMotion,
}: {
  play: boolean
  reduceMotion: boolean | null
}) {
  return (
    <div aria-label="同窗逢年少，云雾峨眉情字相邀，山海共良宵" className="scene-poem">
      <div aria-hidden="true" className="scene-poem__overlay" />
      {POEM_LINES.map(({ className, text }, index) => (
        <motion.p
          className={className}
          initial={{ opacity: 0, x: 0, y: 42 }}
          animate={play ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 0, y: 42 }}
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

type MountainProps = {
  alt: string
  delay: number
  layer: number
  play: boolean
  reduceMotion: boolean | null
  sceneHeight: number
  src: string
}

function Mountain({
  alt,
  delay,
  layer,
  play,
  reduceMotion,
  sceneHeight,
  src,
}: MountainProps) {
  const hiddenOffset = sceneHeight + 64

  return (
    <motion.img
      alt={alt}
      aria-hidden="true"
      className="absolute bottom-0 left-0 block h-auto w-full select-none"
      draggable={false}
      initial={{ opacity: 0, y: hiddenOffset }}
      animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenOffset }}
      src={src}
      style={{ zIndex: layer }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.72,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
    />
  )
}

type PigProps = {
  kind: 'pig-one' | 'pig-two'
  path: Point[]
  play: boolean
  reduceMotion: boolean | null
  size: { height: number; width: number }
  src: string
}

function ClimbingPig({
  kind,
  path,
  play,
  reduceMotion,
  size,
  src,
}: PigProps) {
  const start = path[0]
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const swingRotate = useMotionValue(0)
  const pigControls = useAnimationControls()
  const [growth, setGrowth] = useState(0)
  const [reaction, setReaction] = useState<Reaction | null>(null)
  const [dragging, setDragging] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const dragStart = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 })

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
      if (reactionTimer.current) clearTimeout(reactionTimer.current)
    }
  }, [])

  const clearHoldTimer = () => {
    if (!holdTimer.current) return
    clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  const showReaction = (kind: Reaction['kind']) => {
    setReaction(null)
    const nextReaction = {
      drift: kind === 'heart' ? Math.round(Math.random() * 64 - 32) : 0,
      id: Date.now(),
      kind,
    }
    window.requestAnimationFrame(() => setReaction(nextReaction))

    if (reactionTimer.current) clearTimeout(reactionTimer.current)
    reactionTimer.current = setTimeout(
      () => setReaction(null),
      kind === 'carrot' ? 520 : HEART_LIFETIME,
    )
  }

  const handleActivate = () => {
    if (kind === 'pig-one') {
      setGrowth((current) => current + 1)
      showReaction('carrot')
      return
    }

    showReaction('heart')
    void pigControls.start({
      scaleY: reduceMotion ? 1 : [1, 0.93, 1.05, 1],
      y: reduceMotion ? 0 : [0, -24, 0, -5, 0],
      transition: {
        duration: reduceMotion ? 0.01 : 0.72,
        ease: 'linear',
        times: [0, 0.34, 0.7, 0.84, 1],
      },
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' && event.button !== 0) return

    movedRef.current = false
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: dragX.get(),
      y: dragY.get(),
    }
    clearHoldTimer()
    holdTimer.current = setTimeout(() => {
      draggingRef.current = true
      setDragging(true)
      targetRef.current?.setPointerCapture(event.pointerId)
    }, HOLD_DELAY)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - dragStart.current.pointerX
    const deltaY = event.clientY - dragStart.current.pointerY

    if (!draggingRef.current) {
      if (Math.hypot(deltaX, deltaY) > MOVE_TOLERANCE) {
        movedRef.current = true
        clearHoldTimer()
      }
      return
    }

    event.preventDefault()
    dragX.set(dragStart.current.x + deltaX)
    dragY.set(dragStart.current.y + deltaY)
    // Pivot above the pig turns horizontal displacement into a pendulum swing.
    swingRotate.set(Math.max(-18, Math.min(18, deltaX / 6)))
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    clearHoldTimer()

    if (!draggingRef.current) {
      if (!movedRef.current) handleActivate()
      return
    }

    draggingRef.current = false
    setDragging(false)
    if (targetRef.current?.hasPointerCapture(event.pointerId)) {
      targetRef.current.releasePointerCapture(event.pointerId)
    }
    void animate(swingRotate, 0, {
      duration: reduceMotion ? 0.01 : 0.32,
      ease: EASE_OUT,
    })
  }

  const cancelDrag = () => {
    clearHoldTimer()
    if (!draggingRef.current) return

    draggingRef.current = false
    setDragging(false)
    void animate(swingRotate, 0, {
      duration: reduceMotion ? 0.01 : 0.32,
      ease: EASE_OUT,
    })
  }

  return (
    <motion.div
      initial={{ rotate: 4, x: start.x, y: start.y }}
      animate={
        play
          ? {
              rotate: [4, -5, 3, -4, 0],
              x: path.map((point) => point.x),
              y: path.map((point) => point.y),
            }
          : { rotate: 4, x: start.x, y: start.y }
      }
      style={{
        left: `${-size.width / 2}px`,
        position: 'absolute',
        top: `${-size.height / 2}px`,
        zIndex: 30,
      }}
      transition={{
        duration: reduceMotion ? 0.01 : PIG_ROUTE_DURATION,
        delay: reduceMotion ? 0 : PIG_ROUTE_DELAY,
        ease: EASE_OUT,
        times: [...PIG_ROUTE_TIMES],
      }}
    >
      <motion.div
        ref={targetRef}
        aria-label={kind === 'pig-one' ? '猪一' : '猪二'}
        aria-pressed={kind === 'pig-one' ? growth > 0 : undefined}
        className="relative cursor-grab outline-none active:cursor-grabbing"
        data-pig-control
        role="button"
        style={{
          height: `${size.height}px`,
          // The pig owns its touch surface so a held drag cannot become page scroll.
          touchAction: 'none',
          transformOrigin: '50% -90%',
          width: `${size.width}px`,
          x: dragX,
          y: dragY,
          rotate: swingRotate,
        }}
        tabIndex={0}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleActivate()
          }
        }}
        onPointerCancel={cancelDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
      >
        <motion.div
          animate={{
            scale:
              (kind === 'pig-one' ? 1 + growth * 0.1 : 1) +
              (dragging ? 0.04 : 0),
          }}
          style={{ transformOrigin: '50% 50%' }}
          transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: EASE_OUT }}
        >
          <motion.img
            alt=""
            aria-hidden="true"
            className="block h-full w-full select-none"
            draggable={false}
            animate={pigControls}
            src={src}
            style={{
              filter: dragging
                ? 'drop-shadow(5px 10px 10px rgba(39, 24, 18, 0.38))'
                : 'drop-shadow(3px 6px 5px rgba(39, 24, 18, 0.25))',
            }}
          />
        </motion.div>

        <AnimatePresence>
          {reaction && (
            <motion.span
              key={reaction.id}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 text-3xl"
              initial={{ opacity: 0, scale: 0.65, x: '-50%', y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale:
                  reaction.kind === 'heart' ? [0.65, 1.15, 1] : [0.8, 1, 0.92],
                x:
                  reaction.kind === 'heart'
                    ? ['-50%', `calc(-50% + ${reaction.drift}px)`]
                    : '-50%',
                y:
                  reaction.kind === 'heart'
                    ? [0, -30, -94]
                    : [0, -10, -30],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reaction.kind === 'heart' ? 1.8 : 0.5,
                ease: EASE_OUT,
              }}
            >
              {reaction.kind === 'heart' ? '❤️' : '🥕'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function MountainPhotoMarkers({
  mountainHeight,
  mountainTop,
  play,
  reduceMotion,
  size,
}: {
  mountainHeight: number
  mountainTop: number
  play: boolean
  reduceMotion: boolean | null
  size: SceneSize
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMarker | null>(null)
  const [markersEntered, setMarkersEntered] = useState(false)

  useEffect(() => {
    if (!play) {
      setMarkersEntered(false)
      return
    }

    const entryDuration =
      PIG_ROUTE_DELAY +
      PIG_ROUTE_DURATION * PHOTO_ROUTE_TIMES[PHOTO_ROUTE_TIMES.length - 1] +
      0.65
    const timer = window.setTimeout(
      () => setMarkersEntered(true),
      reduceMotion ? 0 : entryDuration * 1000,
    )
    return () => window.clearTimeout(timer)
  }, [play, reduceMotion])

  const openPhoto = (photo: PhotoMarker) => {
    setMarkersEntered(true)
    setSelectedPhoto(photo)
  }

  useEffect(() => {
    if (!selectedPhoto) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto])

  const getPosition = (photo: PhotoMarker) => ({
    left: size.width * (photo.x + 0.075),
    top: mountainTop + mountainHeight * photo.y - 40,
  })

  return (
    <>
      <div aria-label="山路照片" className="scene-photo-markers">
        {PHOTO_MARKERS.map((photo, index) => (
          <motion.button
            aria-label={`查看${photo.alt}`}
            className="scene-photo-marker"
            initial={{ opacity: 0, scale: 0.7, y: 18 }}
            animate={{
              opacity: play && selectedPhoto?.id !== photo.id ? 1 : 0,
              scale: 1,
              y: 0,
            }}
            layoutId={`mountain-photo-${photo.id}`}
            key={photo.id}
            style={getPosition(photo)}
            transition={{
              delay: markersEntered
                ? 0
                : PIG_ROUTE_DELAY + PIG_ROUTE_DURATION * PHOTO_ROUTE_TIMES[index],
              duration: reduceMotion ? 0.01 : 0.65,
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
            <img alt="" aria-hidden="true" className="scene-photo-marker__image" src={photo.src} />
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
              layoutId={`mountain-photo-${selectedPhoto.id}`}
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

export function SceneStage({ active }: { active?: boolean }) {
  const stageRef = useRef<HTMLElement>(null)
  const size = useSceneSize(stageRef)
  const isInView = useInView(stageRef, { amount: 0.55, once: true })
  const reduceMotion = useReducedMotion()
  const shouldPlay = active ?? isInView

  const pigOne = {
    height: Math.round(size.width * 0.164),
    width: Math.round(size.width * 0.164),
  }
  const pigTwo = {
    height: Math.round(size.width * 0.134),
    width: Math.round(size.width * 0.164),
  }
  const mainMountainHeight =
    size.width * (MAIN_MOUNTAIN_HEIGHT / MAIN_MOUNTAIN_WIDTH)
  const mainMountainTop = size.height - mainMountainHeight
  const percentPoint = (x: number, y: number): Point => ({
    x: size.width * x,
    y: mainMountainTop + mainMountainHeight * y,
  })
  // 按标注图的图片百分比取点，顺序为从山脚向山顶的四个折返点。
  const routePercentages = [
    { x: 0.5, y: 1.2},
    { x: 0.566, y: 0.882 },
    { x: 0.4, y: 0.582 },
    { x: 0.65, y: 0.368 },
    { x: 0.522, y: 0.187 },
  ] as const
  const climbingRoute = routePercentages.map(({ x, y }) =>
    percentPoint(x, y),
  )
  const secondClimbingRoute = routePercentages.map(({ x, y }, index) =>
    percentPoint(x + (index === 0 ? 0.12 : 0.075), y + 0.022),
  )

  return (
    <section
      ref={stageRef}
      aria-label="群猪登山动画"
      className="relative h-dvh w-full overflow-hidden bg-[#d8c4b2]"
    >
      <ScenePoem play={shouldPlay} reduceMotion={reduceMotion} />

      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
        src="/assets/背景2.png"
      />

      {size.height > 0 && (
        <>
          <Mountain
            alt="远处山门"
            delay={0.35}
            layer={20}
            play={shouldPlay}
            reduceMotion={reduceMotion}
            sceneHeight={size.height}
            src="/assets/山1.png"
          />
          <Mountain
            alt="登山主峰"
            delay={0.85}
            layer={10}
            play={shouldPlay}
            reduceMotion={reduceMotion}
            sceneHeight={size.height}
            src="/assets/山.png"
          />
          <MountainPhotoMarkers
            mountainHeight={mainMountainHeight}
            mountainTop={mainMountainTop}
            play={shouldPlay}
            reduceMotion={reduceMotion}
            size={size}
          />
          <ClimbingPig
            kind="pig-one"
            path={climbingRoute}
            play={shouldPlay}
            reduceMotion={reduceMotion}
            size={pigOne}
            src="/assets/猪1.png"
          />
          <ClimbingPig
            kind="pig-two"
            path={secondClimbingRoute}
            play={shouldPlay}
            reduceMotion={reduceMotion}
            size={pigTwo}
            src="/assets/猪2.png"
          />
        </>
      )}
      <PageScrollCue active={shouldPlay} />
    </section>
  )
}
