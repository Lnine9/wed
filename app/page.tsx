import { SceneStage } from '@/components/scene/scene-stage'

export default function Page() {
  return (
    <main className="h-dvh w-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
      <section
        aria-label="第一页"
        className="h-dvh w-full snap-start snap-always bg-white"
      />

      <div
        aria-hidden="true"
        className="h-[16dvh] min-h-24 w-full bg-linear-to-b from-white to-[#404040]"
      />

      <section
        aria-label="第二页"
        className="relative h-dvh w-full snap-start snap-always"
      >
        <SceneStage />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-50 h-[16dvh] min-h-24 bg-linear-to-b from-[#404040] to-transparent"
        />
      </section>

      <div
        aria-hidden="true"
        className="h-[16dvh] min-h-24 w-full bg-linear-to-b from-[#404040] to-white"
      />

      <section
        aria-label="第三页（预留）"
        className="h-dvh w-full snap-start snap-always bg-white"
      />
    </main>
  )
}
