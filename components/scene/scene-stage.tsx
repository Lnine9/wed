'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

type SceneSize = {
  height: number
  width: number
}

type Point = {
  x: number
  y: number
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
  path: Point[]
  play: boolean
  reduceMotion: boolean | null
  size: { height: number; width: number }
  src: string
}

function ClimbingPig({
  path,
  play,
  reduceMotion,
  size,
  src,
}: PigProps) {
  const start = path[0]

  return (
    <motion.img
      alt=""
      aria-hidden="true"
      draggable={false}
      initial={{ opacity: 0, rotate: 4, x: start.x, y: start.y }}
      animate={
        play
          ? {
              opacity: [0, 1, 1],
              rotate: [4, -5, 3, -4, 0],
              x: path.map((point) => point.x),
              y: path.map((point) => point.y),
            }
          : { opacity: 0, rotate: 4, x: start.x, y: start.y }
      }
      src={src}
      style={{
        height: `${size.height}px`,
        left: `${-size.width / 2}px`,
        position: 'absolute',
        top: `${-size.height / 2}px`,
        width: `${size.width}px`,
        zIndex: 30,
      }}
      transition={{
        duration: reduceMotion ? 0.01 : 2.4,
        delay: reduceMotion ? 0 : 1.63,
        ease: EASE_OUT,
        times: [0, 0.12, 0.4, 0.7, 1],
      }}
    />
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
            path={[
              point(size.width * 0.77, size.height + pigOne.height),
              point(size.width * 0.71, size.height * 0.82),
              point(size.width * 0.58, size.height * 0.62),
              point(size.width * 0.48, size.height * 0.42),
              point(size.width * 0.45, size.height * 0.25),
            ]}
            play={isInView}
            reduceMotion={reduceMotion}
            size={pigOne}
            src="/assets/猪1.png"
          />
          <ClimbingPig
            path={[
              point(size.width * 0.9, size.height + pigTwo.height),
              point(size.width * 0.79, size.height * 0.86),
              point(size.width * 0.68, size.height * 0.69),
              point(size.width * 0.57, size.height * 0.5),
              point(size.width * 0.52, size.height * 0.33),
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
