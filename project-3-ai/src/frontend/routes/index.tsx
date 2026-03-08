import { createFileRoute } from '@tanstack/react-router'
import ChatComparison from '../components/ChatComparison'

export const Route = createFileRoute('/')({
  component: ChatComparison,
})
