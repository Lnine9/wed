import { LetterPageContent } from './components/page-content'

export default function LetterPage({ source }: { source: '婚礼' | '出阁' }) {
  return <LetterPageContent source={source} />
}
