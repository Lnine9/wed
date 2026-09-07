import { LetterPageContent } from './components/page-content'

export default function LetterPage({
  active = true,
  source,
}: {
  active?: boolean
  source: '婚礼' | '出阁'
}) {
  return <LetterPageContent active={active} source={source} />
}