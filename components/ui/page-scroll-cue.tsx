'use client'

export function PageScrollCue({
  active,
  tone = 'light',
}: {
  active: boolean
  tone?: 'dark' | 'light'
}) {
  return (
    <button
      aria-label="下滑进入下一页"
      className={`page-scroll-cue page-scroll-cue--${tone} ${
        active ? 'is-active' : 'is-inactive'
      }`}
      data-deck-control
      data-deck-next
      type="button"
    >
      <svg className="page-scroll-cue__mark" fill="none" viewBox="0 0 24 24">
        <path className="page-scroll-cue__arrow page-scroll-cue__arrow--top" d="m3 4 9 9 9-9" />
        <path className="page-scroll-cue__arrow page-scroll-cue__arrow--bottom" d="m3 11 9 9 9-9" />
      </svg>
    </button>
  )
}
