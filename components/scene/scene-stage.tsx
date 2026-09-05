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
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const HOLD_DELAY = 280
const MOVE_TOLERANCE = 8
const HEART_LIFETIME = 1800

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
        duration: reduceMotion ? 0.01 : 2.4,
        delay: reduceMotion ? 0 : 1.63,
        ease: EASE_OUT,
        times: [0, 0.12, 0.4, 0.7, 1],
      }}
    >
      <motion.div
        ref={targetRef}
        aria-label={kind === 'pig-one' ? '猪一' : '猪二'}
        aria-pressed={kind === 'pig-one' ? growth > 0 : undefined}
        className="relative cursor-grab outline-none active:cursor-grabbing"
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
          animate={{ scale: kind === 'pig-one' ? 1 + growth * 0.1 : 1 }}
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

export function SceneStage() {
  const stageRef = useRef<HTMLElement>(null)
  const size = useSceneSize(stageRef)
  const isInView = useInView(stageRef, { amount: 0.55, once: true })
  const reduceMotion = useReducedMotion()

  const pigOne = {
    height: Math.round(size.width * 0.164),
    width: Math.round(size.width * 0.164),
  }
  const pigTwo = {
    height: Math.round(size.width * 0.134),
    width: Math.round(size.width * 0.164),
  }
  const point = (x: number, y: number): Point => ({ x, y })

  return (
    <section
      ref={stageRef}
      aria-label="群猪登山动画"
      className="relative h-dvh w-full overflow-hidden bg-[#d8c4b2]"
    >
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
            play={isInView}
            reduceMotion={reduceMotion}
            sceneHeight={size.height}
            src="/assets/山1.png"
          />
          <Mountain
            alt="登山主峰"
            delay={0.85}
            layer={10}
            play={isInView}
            reduceMotion={reduceMotion}
            sceneHeight={size.height}
            src="/assets/山.png"
          />
          <ClimbingPig
            kind="pig-one"
            path={[
              point(size.width * 0.77, size.height + pigOne.height),
              point(size.width * 0.71, size.height * 0.82),
              point(size.width * 0.58, size.height * 0.62),
              point(size.width * 0.48, size.height * 0.42),
            ]}
            play={isInView}
            reduceMotion={reduceMotion}
            size={pigOne}
            src="/assets/猪1.png"
          />
          <ClimbingPig
            kind="pig-two"
            path={[
              point(size.width * 0.9, size.height + pigTwo.height),
              point(size.width * 0.79, size.height * 0.86),
              point(size.width * 0.68, size.height * 0.69),
              point(size.width * 0.57, size.height * 0.5),
            ]}
            play={isInView}
            reduceMotion={reduceMotion}
            size={pigTwo}
            src="/assets/猪2.png"
          />
        </>
      )}
    </section>
  )
}
