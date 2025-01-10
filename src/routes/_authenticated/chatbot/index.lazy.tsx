import ChatBot from '@/features/chatbot'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/chatbot/')({
  component: ChatBot,
})

