'use client'

import { SceneStage } from './components/scene-stage'

export default function SecondPage({ active }: { active: boolean }) {
  return <SceneStage active={active} />
}
