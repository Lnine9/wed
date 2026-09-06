'use client'

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import CoverPage from '@/components/pages/cover/page'
import Cover2Page from '@/components/pages/cover2/page'
import FirstPage from '@/components/pages/first/page'
import LetterPage from '@/components/pages/letter/page'
import SecondPage from '@/components/pages/second/page'
import ThirdPage from '@/components/pages/third/page'

const CARD_EASE = [0.22, 1, 0.36, 1] as const
const SWIPE_DISTANCE = 0.2
const SWIPE_VELOCITY = 520
const DIRECTION_LOCK_DISTANCE = 8
const PAGE_COUNT = 5
const CARD_SHADOW = '0 20px 44px rgba(20, 17, 14, 0.3)'
const NO_SHADOW = '0 0 0 rgba(20, 17, 14, 0)'

type Direction = 'next' | 'previous'

type PointerGesture = {
  direction: Direction | null
  lastTime: number
  lastVelocityY: number
  lastY: number
  pointerId: number
  startY: number
}

function PageContent({
  index,
  active,
  coverVariant,
}: {
  index: number
  active: boolean
  coverVariant: 'default' | 'cover2'
}) {
  if (index === 0) {
    return coverVariant === 'cover2' ? (
      <Cover2Page active={active} />
    ) : (
      <CoverPage active={active} />
    )
  }
  if (index === 1) return <FirstPage active={active} />
  if (index === 2) return <SecondPage active={active} />
  if (index === 3) return <ThirdPage active={active} />
  return <LetterPage source={coverVariant === 'cover2' ? '出阁' : '婚礼'} />
}

export function PageDeck() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [coverVariant, setCoverVariant] = useState<'default' | 'cover2'>('default')
  const [isSettling, setIsSettling] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(1)
  const forwardY = useMotionValue(0)
  const backwardY = useMotionValue(-1)
  const gestureRef = useRef<PointerGesture | null>(null)
  const reduceMotion = useReducedMotion()
  const nextIndex = activeIndex < PAGE_COUNT - 1 ? activeIndex + 1 : null
  const previousIndex = activeIndex > 0 ? activeIndex - 1 : null

  useEffect(() => {
    setCoverVariant(window.location.pathname === '/cover2' ? 'cover2' : 'default')
  }, [])

  useEffect(() => {
    const updateViewportHeight = () => {
      const nextHeight = window.innerHeight
      setViewportHeight(nextHeight)
      if (!gestureRef.current && !isSettling) {
        forwardY.set(0)
        backwardY.set(-nextHeight)
      }
    }

    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
    window.visualViewport?.addEventListener('resize', updateViewportHeight)
    return () => {
      window.removeEventListener('resize', updateViewportHeight)
      window.visualViewport?.removeEventListener('resize', updateViewportHeight)
    }
  }, [backwardY, forwardY, isSettling])

  const nextScale = useTransform(forwardY, [-viewportHeight, 0], [1, 0.965])
  const nextY = useTransform(forwardY, [-viewportHeight, 0], [0, 28])
  const forwardShadow = useTransform(
    forwardY,
    [-viewportHeight, -viewportHeight * 0.06, 0],
    [CARD_SHADOW, CARD_SHADOW, NO_SHADOW],
  )
  const backwardShadow = useTransform(
    backwardY,
    [-viewportHeight, -viewportHeight * 0.94, 0],
    [NO_SHADOW, CARD_SHADOW, CARD_SHADOW],
  )
  const forwardFrostedOpacity = useTransform(
    forwardY,
    [-viewportHeight, -viewportHeight * 0.5, 0],
    [0, 0.46, 0],
  )
  const backwardFrostedOpacity = useTransform(
    backwardY,
    [-viewportHeight, -viewportHeight * 0.5, 0],
    [0, 0.46, 0],
  )

  const resetTransition = () => {
    forwardY.set(0)
    backwardY.set(-viewportHeight)
  }

  const settlePage = async (direction: Direction) => {
    setIsSettling(true)

    if (direction === 'next') {
      await animate(forwardY, -viewportHeight, {
        duration: reduceMotion ? 0.01 : 0.58,
        ease: CARD_EASE,
      })
      setActiveIndex((current) => current + 1)
    } else {
      await animate(backwardY, 0, {
        duration: reduceMotion ? 0.01 : 0.58,
        ease: CARD_EASE,
      })
      setActiveIndex((current) => current - 1)
    }

    resetTransition()
    setIsSettling(false)
  }

  const cancelGesture = (direction: Direction | null) => {
    if (direction === 'next') {
      void animate(forwardY, 0, {
        duration: reduceMotion ? 0.01 : 0.32,
        ease: CARD_EASE,
      })
      return
    }

    if (direction === 'previous') {
      void animate(backwardY, -viewportHeight, {
        duration: reduceMotion ? 0.01 : 0.32,
        ease: CARD_EASE,
      })
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      isSettling ||
      (event.target as HTMLElement).closest('[data-pig-control], [data-deck-control]')
    ) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      direction: null,
      lastTime: event.timeStamp,
      lastVelocityY: 0,
      lastY: event.clientY,
      pointerId: event.pointerId,
      startY: event.clientY,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const distance = event.clientY - gesture.startY
    if (!gesture.direction && Math.abs(distance) >= DIRECTION_LOCK_DISTANCE) {
      if (distance < 0 && nextIndex !== null) gesture.direction = 'next'
      if (distance > 0 && previousIndex !== null) gesture.direction = 'previous'
    }

    const timeDelta = Math.max(event.timeStamp - gesture.lastTime, 1)
    gesture.lastVelocityY = ((event.clientY - gesture.lastY) / timeDelta) * 1000
    gesture.lastY = event.clientY
    gesture.lastTime = event.timeStamp

    if (gesture.direction === 'next') {
      forwardY.set(Math.max(-viewportHeight, Math.min(0, distance)))
      event.preventDefault()
    }

    if (gesture.direction === 'previous') {
      backwardY.set(
        Math.max(-viewportHeight, Math.min(0, -viewportHeight + distance)),
      )
      event.preventDefault()
    }
  }

  const finishPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const distance = event.clientY - gesture.startY
    const velocity = Math.abs(gesture.lastVelocityY)
    const crossedThreshold =
      Math.abs(distance) > viewportHeight * SWIPE_DISTANCE ||
      velocity > SWIPE_VELOCITY

    if (
      gesture.direction === 'next' &&
      crossedThreshold &&
      distance < 0 &&
      nextIndex !== null
    ) {
      void settlePage('next')
      return
    }

    if (
      gesture.direction === 'previous' &&
      crossedThreshold &&
      distance > 0 &&
      previousIndex !== null
    ) {
      void settlePage('previous')
      return
    }

    cancelGesture(gesture.direction)
  }

  const handleDeckClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (
      isSettling ||
      nextIndex === null ||
      !(event.target as HTMLElement).closest('[data-deck-next]')
    ) {
      return
    }

    void settlePage('next')
  }

  return (
    <main
      aria-label="分页卡片"
      className="relative h-dvh w-full touch-none overflow-hidden bg-[#404040]"
      onClick={handleDeckClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerGesture}
      onPointerCancel={finishPointerGesture}
    >
      {nextIndex !== null && (
        <motion.section
          aria-hidden="true"
          className="absolute inset-0 z-10 origin-center"
          style={{ scale: nextScale, y: nextY }}
        >
          <PageContent
            coverVariant={coverVariant}
            index={nextIndex}
            active={false}
          />
        </motion.section>
      )}

      <motion.section
        key={activeIndex}
        aria-label={`第 ${activeIndex + 1} 页`}
        className="absolute inset-0 z-20"
        style={{ boxShadow: forwardShadow, y: forwardY }}
      >
        <PageContent
          coverVariant={coverVariant}
          index={activeIndex}
          active={!isSettling}
        />
      </motion.section>

      {nextIndex !== null && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-15 bg-black/30"
          style={{ opacity: forwardFrostedOpacity }}
        />
      )}

      {previousIndex !== null && (
        <motion.section
          aria-hidden="true"
          className="absolute inset-0 z-30"
          style={{ boxShadow: backwardShadow, y: backwardY }}
        >
          <PageContent
            coverVariant={coverVariant}
            index={previousIndex}
            active={false}
          />
        </motion.section>
      )}

      {previousIndex !== null && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-25 bg-black/30"
          style={{ opacity: backwardFrostedOpacity }}
        />
      )}
    </main>
  )
}
