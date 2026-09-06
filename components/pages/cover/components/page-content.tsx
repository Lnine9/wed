'use client'

import { motion, useReducedMotion } from 'motion/react'
import { PageScrollCue } from '@/components/ui/page-scroll-cue'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const BRIDE_NAME = ['新', '娘', '•', '杨', '茹', '琰'] as const
const GROOM_NAME = ['新', '郎', '•', '刘', '昊', '南'] as const

export type CoverPageVariant = 'default' | 'cover2'

const COVER_CONTENT: Record<
  CoverPageVariant,
  {
    background: string
    divider: string
    title: string
    subtitle: string
    dateTop: string
    dateBottom: string
    locationTop: string
    locationBottom: string
  }
> = {
  default: {
    background: '/assets/主背景2.jpg',
    divider: '/assets/橄榄.png',
    title: '良辰已定\n静待相逢',
    subtitle: '诚邀您，见证我们的婚礼',
    dateTop: '05',
    dateBottom: '10月',
    locationTop: '济宁',
    locationBottom: '山东',
  },
  cover2: {
    background: '/assets/主背景.jpg',
    divider: '/assets/百合.png',
    title: '佳期已定\n出阁之喜',
    subtitle: '特设薄宴，恭请各位亲友共鉴此禧',
    dateTop: '26',
    dateBottom: '9月',
    locationTop: '潼南',
    locationBottom: '重庆',
  },
}

export function CoverPageContent({
  active,
  variant = 'default',
}: {
  active: boolean
  variant?: CoverPageVariant
}) {
  const reduceMotion = useReducedMotion()
  const content = COVER_CONTENT[variant]
  const transition = (delay: number) => ({
    delay: reduceMotion ? 0 : delay,
    duration: reduceMotion ? 0.01 : 1.05,
    ease: EASE_OUT,
  })

  return (
    <section aria-label="婚礼邀请封面" className="cover-page">
      <div className="cover-page__card">
        <img
          alt=""
          aria-hidden="true"
          className="cover-page__image"
          draggable={false}
          src={content.background}
        />
        <div aria-hidden="true" className="cover-page__shade" />
        <div aria-label="新人姓名" className="cover-page__names">
          <motion.span
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            aria-label="新娘杨茹琰"
            className="cover-page__name--bride"
            initial={{ opacity: 0, y: 28 }}
            transition={transition(1.28)}
          >
            {BRIDE_NAME.map((character) => (
              <span key={character}>{character}</span>
            ))}
          </motion.span>
          <motion.span
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            aria-label="新郎刘昊南"
            className="cover-page__name--groom"
            initial={{ opacity: 0, y: 28 }}
            transition={transition(1.5)}
          >
            {GROOM_NAME.map((character) => (
              <span key={character}>{character}</span>
            ))}
          </motion.span>
        </div>

        <div className="cover-page__heading">
          <motion.h1
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
            initial={{ opacity: 0, y: 34 }}
            transition={transition(0.22)}
          >
            {content.title.split('\n').map((line) => (
              <span className="cover-page__title-line" key={line}>
                {line}
              </span>
            ))}
          </motion.h1>
          <motion.span
            animate={active ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.5 }}
            aria-hidden="true"
            className="cover-page__heading-rule"
            initial={{ opacity: 0, scaleX: 0.5 }}
            transition={transition(0.78)}
          />
          <motion.p
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            initial={{ opacity: 0, y: 26 }}
            transition={transition(1.02)}
          >
            {content.subtitle}
          </motion.p>
        </div>

        <div className="cover-page__details">
          <img
            alt=""
            aria-hidden="true"
            className="cover-page__details-decoration"
            src={content.divider}
          />
          <div className="cover-page__detail">
            <strong>{content.dateTop}</strong>
            <span>{content.dateBottom}</span>
          </div>
          <div aria-hidden="true" className="cover-page__divider" />
          <div className="cover-page__detail">
            <strong>{content.locationTop}</strong>
            <span>{content.locationBottom}</span>
          </div>
        </div>
        <PageScrollCue active={active} tone="dark" />
      </div>
    </section>
  )
}
