'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiChatApi } from '@/http/api'
import {
  Bot,
  Paperclip,
  Hash,
  MessageCircleQuestionIcon as QuestionMarkCircle,
  Bell,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Send,
  ArrowRight,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { TypeAnimation } from 'react-type-animation'
import remarkGfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/hooks/use-toast'
import { SidebarTrigger } from '@/components/ui/sidebar'

// Types
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

interface SampleQuestion {
  title: string
  link: string
}

// Constants
const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    title: 'What are more efficient alternatives to a "for loop" in Python?',
    link: '#',
  },
  {
    title: 'What is the Transformers architecture?',
    link: '#',
  },
  {
    title: 'Create a chart of the top NLP use-cases for foundation models.',
    link: '#',
  },
  {
    title: 'Describe generative AI using emojis.',
    link: '#',
  },
]

// Components
const Header = () => (
  <header className='bg-[#161616] text-white'>
    <div className='flex items-center justify-between px-4 h-12'>
      <div className='flex items-center space-x-4'>
        <SidebarTrigger
          variant='outline'
          className='scale-125 sm:scale-100 bg-black'
        />
        <span className='font-semibold'>Ai Assistant</span>
      </div>
      <div className='flex items-center space-x-4'>
        <button className='p-2 text-gray-400 hover:text-white transition-colors'>
          <QuestionMarkCircle size={20} />
        </button>
        <button className='p-2 text-gray-400 hover:text-white transition-colors'>
          <Bell size={20} />
        </button>
        <button className='flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors'>
          <span>2953645 - itz-llama-3.3</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  </header>
)

const WelcomeScreen = ({
  onExampleClick,
}: {
  onExampleClick: (prompt: string) => void
}) => (
  <div className='flex-1 flex flex-col items-center justify-start p-8 max-w-5xl mx-auto w-full mb-11'>
    <div className='w-full space-y-8'>
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-gray-800'>
          Customize your chat
        </h2>
        <p className='text-gray-600'>
          Before you start chatting, you can update the current settings and
          ground the chat with documents. To upload documents or an image, click{' '}
          <Paperclip className='inline-block w-4 h-4' /> next to the input
          field.
        </p>
        <div className='w-full h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center'>
          <img
            src='/images/chatinterfacebanner.png'
            alt='Chat customization diagram'
            className='h-64 object-contain'
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-gray-800'>
          Sample questions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {SAMPLE_QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(question.title)}
              className='flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors text-left group'
            >
              <span className='text-gray-700'>{question.title}</span>
              <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-blue-400' />
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const MessageActions = ({
  onThumbsUp,
  onThumbsDown,
  onCopy,
  onRegenerate,
}: {
  onThumbsUp: () => void
  onThumbsDown: () => void
  onCopy: () => void
  onRegenerate: () => void
}) => (
  <div className='flex gap-2 text-gray-400 justify-start mt-2'>
    <button
      onClick={onThumbsUp}
      className='hover:text-purple-600 transition-colors duration-200'
      aria-label='Thumbs up'
    >
      <ThumbsUp size={16} />
    </button>
    <button
      onClick={onThumbsDown}
      className='hover:text-purple-600 transition-colors duration-200'
      aria-label='Thumbs down'
    >
      <ThumbsDown size={16} />
    </button>
    <button
      onClick={onCopy}
      className='hover:text-purple-600 transition-colors duration-200'
      aria-label='Copy message'
    >
      <Copy size={16} />
    </button>
    <button
      onClick={onRegenerate}
      className='hover:text-purple-600 transition-colors duration-200'
      aria-label='Regenerate response'
    >
      <RotateCcw size={16} />
    </button>
  </div>
)

const ChatMessage = ({
  message,
  onCopy,
  onRegenerate,
}: {
  message: Message
  onCopy: (text: string) => void
  onRegenerate: (messageId: string) => void
}) => (
  <div
    className={`max-w-3xl mx-auto mb-6 animate-fade-in ${
      message.role === 'user' ? 'flex justify-end' : ''
    }`}
  >
    <div
      className={`flex items-start gap-4 mb-11 ${
        message.role === 'user' ? 'flex-row-reverse' : ''
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          message.role === 'assistant'
            ? 'bg-purple-100 text-purple-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {message.role === 'assistant' ? (
          <Bot size={24} />
        ) : (
          <span className='text-lg font-semibold'>U</span>
        )}
      </div>
      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <div className='relative mt-2 rounded-lg overflow-hidden'>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag='div'
                    {...props}
                    className='!bg-gray-800 !p-4'
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => onCopy(String(children))}
                    className='absolute top-2 right-2 p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors'
                    aria-label='Copy code'
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ) : (
                <code
                  className={`${className} bg-gray-100 rounded px-1 py-0.5`}
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
          className={`prose max-w-none mb-2 p-4 rounded-lg ${
            message.role === 'assistant'
              ? 'bg-white border border-gray-200'
              : 'bg-purple-50'
          }`}
        >
          {message.content}
        </ReactMarkdown>
        {message.role === 'assistant' && (
          <MessageActions
            onThumbsUp={() => console.log('Thumbs up')}
            onThumbsDown={() => console.log('Thumbs down')}
            onCopy={() => onCopy(message.content)}
            onRegenerate={() => onRegenerate(message.id)}
          />
        )}
      </div>
    </div>
  </div>
)

const ChatInput = ({
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}) => (
  <div className='absolute bottom-0 left-0 right-0 bg-transparent'>
    <form onSubmit={onSubmit} className='max-w-3xl mx-auto p-4'>
      <div className='relative flex items-center'>
        <div className='absolute left-2 flex items-center gap-2'>
          <button
            type='button'
            className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
            aria-label='Attach file'
          >
            <Paperclip size={20} />
          </button>
          <button
            type='button'
            className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
            aria-label='Add hashtag'
          >
            <Hash size={20} />
          </button>
        </div>
        <input
          type='text'
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder='Message...'
          className='w-full pl-24 pr-16 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-400 text-gray-800 placeholder-gray-400'
          disabled={isLoading}
        />
        <div className='absolute right-2 flex items-center'>
          <button
            type='submit'
            disabled={!input.trim() || isLoading}
            className='p-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50'
            aria-label='Send message'
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </form>
  </div>
)

// Main Component
export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState<string>(uuidv4())
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const mutationAiChat = useMutation({
    mutationFn: (data: { prompt: string }) =>
      aiChatApi({ prompt: data.prompt, sessionId }),
    onSuccess: (response) => {
      const generatedText = response.data.message[0].generated_text
      const newMessage: Message = {
        id: Date.now().toString(),
        content: generatedText,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newMessage])
      setIsTyping(false)
    },
    onError: (error: any) => {
      console.error('AI Chat API error', error)
      toast({
        title: 'AI Chat Error',
        description: `${error?.response?.data?.message || 'An error occurred'}`,
        variant: 'destructive',
      })
      setIsTyping(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    mutationAiChat.mutate({ prompt: input })
  }

  const handleExampleClick = (prompt: string) => {
    setInput(prompt)
    handleSubmit(new Event('submit') as any)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'The content has been copied to your clipboard.',
      })
    })
  }

  const handleRegenerate = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    // Find the last user message before this assistant message
    let lastUserMessage: Message | undefined
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i]
        break
      }
    }

    if (lastUserMessage) {
      // Remove all messages after and including the regenerated message
      setMessages((prev) => prev.slice(0, messageIndex))
      setIsTyping(true)
      mutationAiChat.mutate({ prompt: lastUserMessage.content })
    }
  }

  return (
    <div className='flex flex-col h-screen'>
      <Header />

      <div className='flex-1 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]  to-[#E9DEFE] overflow-hidden relative'>
        {messages.length === 0 && !isTyping ? (
          <WelcomeScreen onExampleClick={handleExampleClick} />
        ) : (
          <div className='absolute inset-0 overflow-auto px-4 py-8'>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCopy={copyToClipboard}
                onRegenerate={handleRegenerate}
              />
            ))}
            {isTyping && (
              <div className='max-w-3xl mx-auto mb-6 animate-fade-in'>
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600'>
                    <Bot size={24} />
                  </div>
                  <div className='flex-1 p-4 rounded-lg bg-white border border-gray-200'>
                    <TypeAnimation
                      sequence={['Typing...', 1000, 'Thinking...', 1000]}
                      wrapper='span'
                      speed={50}
                      style={{ fontSize: '1em', display: 'inline-block' }}
                      repeat={Infinity}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isTyping}
        />
      </div>
    </div>
  )
}
