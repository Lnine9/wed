'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

type MountainProps = {
  alt: string
  className: string
  delay: number
  play: boolean
  reduceMotion: boolean | null
  src: string
}

function Mountain({
  alt,
  className,
  delay,
  play,
  reduceMotion,
  src,
}: MountainProps) {
  return (
    <motion.img
      alt={alt}
      aria-hidden="true"
      className={className}
      draggable={false}
      initial={{ opacity: 0, y: '105%' }}
      animate={play ? { opacity: 1, y: '0%' } : { opacity: 0, y: '105%' }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.72,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
      src={src}
    />
  )
}

type PigProps = {
  href: string
  play: boolean
  reduceMotion: boolean | null
  path: { x: number[]; y: number[] }
  size: { width: number; height: number }
}

function ClimbingPig({
  href,
  path,
  play,
  reduceMotion,
  size,
}: PigProps) {
  const startX = path.x[0]
  const startY = path.y[0]

  return (
    <motion.g
      initial={{ opacity: 0, x: startX, y: startY, rotate: 4 }}
      animate={
        play
          ? {
              opacity: [0, 1, 1],
              x: path.x,
              y: path.y,
              rotate: [4, -5, 3, -4, 0],
            }
          : { opacity: 0, x: startX, y: startY, rotate: 4 }
      }
      transition={{
        duration: reduceMotion ? 0.01 : 2.4,
        delay: reduceMotion ? 0 : 1.63,
        ease: EASE_OUT,
        times: [0, 0.12, 0.4, 0.7, 1],
      }}
    >
      <image
        aria-hidden="true"
        height={size.height}
        href={href}
        preserveAspectRatio="xMidYMid meet"
        width={size.width}
        x={-size.width / 2}
        y={-size.height / 2}
      />
    </motion.g>
  )
}

export function SceneStage() {
  const stageRef = useRef<HTMLElement>(null)
  const isInView = useInView(stageRef, { amount: 0.55, once: true })
  const reduceMotion = useReducedMotion()

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
        src="/assets/山背景.png"
      />

      <Mountain
          alt="登山主峰"
          className="absolute bottom-[-1%] left-1/2 z-10 h-[102%] max-w-none -translate-x-1/2 select-none object-contain"
          delay={0.85}
          play={isInView}
          reduceMotion={reduceMotion}
          src="/assets/山2.png"
      />

      <Mountain
        alt="远处山门"
        className="absolute bottom-[-2%] left-1/2 z-20 w-[118%] max-w-none -translate-x-1/2 select-none object-contain"
        delay={0.35}
        play={isInView}
        reduceMotion={reduceMotion}
        src="/assets/山1.png"
      />



      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 177"
      >
        <ClimbingPig
          href="/assets/猪1.png"
          path={{
            x: [74, 70, 58, 49, 45],
            y: [188, 148, 112, 76, 42],
          }}
          play={isInView}
          reduceMotion={reduceMotion}
          size={{ width: 16, height: 16 }}
        />
        <ClimbingPig
          href="/assets/猪2.png"
          path={{
            x: [86, 78, 67, 57, 51],
            y: [190, 157, 124, 89, 58],
          }}
          play={isInView}
          reduceMotion={reduceMotion}
          size={{ width: 21, height: 17.2 }}
        />
      </svg>
    </section>
  )
}
