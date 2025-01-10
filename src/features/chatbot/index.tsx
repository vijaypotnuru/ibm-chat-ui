'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiChatApi } from '@/http/api'
import {
  Bot,
  Paperclip,
  ImageIcon,
  Globe,
  Play,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Mic,
  Send,
  ArrowRight,
  Hash,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { TypeAnimation } from 'react-type-animation'
import remarkGfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

const sampleQuestions = [
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

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>(uuidv4())
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Existing logic remains the same
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
    if (!input.trim()) return

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

  const handleExampleClick = async (prompt: string) => {
    setInput(prompt)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    mutationAiChat.mutate({ prompt: prompt })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'The code has been copied to your clipboard.',
      })
    })
  }

  return (
    <div className='flex flex-col h-screen bg-[#fafafa]'>
      {messages.length === 0 && !isTyping ? (
        <div className='flex-1 flex flex-col items-center justify-start p-8 max-w-5xl mx-auto w-full'>
          <div className='w-full space-y-8'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold text-gray-800'>
                Customize your chat
              </h2>
              <p className='text-gray-600'>
                Before you start chatting, you can update the current settings
                and ground the chat with documents. To upload documents or an
                image, click <Paperclip className='inline-block w-4 h-4' /> next
                to the input field.
              </p>
              <div className='w-full h-48 bg-white rounded-lg border border-gray-200 flex items-center justify-center'>
                <img
                  src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LkIulQ183tUSDreK0rXMw2SOV1gibo.png'
                  alt='Chat customization diagram'
                  className='h-32 object-contain'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <h2 className='text-xl font-semibold text-gray-800'>
                Sample questions
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(question.title)}
                    className='flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-400 transition-colors text-left group'
                  >
                    <span className='text-gray-700'>{question.title}</span>
                    <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-purple-400' />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex-1 overflow-auto px-4 py-8'>
          {/* Messages section - existing message rendering logic remains the same */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3xl mx-auto mb-6 animate-fade-in ${
                message.role === 'user' ? 'flex justify-end' : ''
              }`}
            >
              <div
                className={`flex items-start gap-4 ${
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
                <div
                  className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
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
                              onClick={() => copyToClipboard(String(children))}
                              className='absolute top-2 right-2 p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors'
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
                    <div className='flex gap-2 text-gray-400 justify-start mt-2'>
                      <button className='hover:text-purple-600 transition-colors duration-200'>
                        <ThumbsUp size={16} />
                      </button>
                      <button className='hover:text-purple-600 transition-colors duration-200'>
                        <ThumbsDown size={16} />
                      </button>
                      <button className='hover:text-purple-600 transition-colors duration-200'>
                        <Copy size={16} />
                      </button>
                      <button className='hover:text-purple-600 transition-colors duration-200'>
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

      <div className='border-t border-gray-200 bg-white'>
        <form onSubmit={handleSubmit} className='max-w-3xl mx-auto p-4'>
          <div className='relative flex items-center'>
            <div className='absolute left-2 flex items-center gap-2'>
              <button
                type='button'
                className='p-2 text-gray-400 hover:text-purple-600 transition-colors'
              >
                <Paperclip size={20} />
              </button>
              <button
                type='button'
                className='p-2 text-gray-400 hover:text-purple-600 transition-colors'
              >
                <Hash size={20} />
              </button>
            </div>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Message...'
              className='w-full pl-24 pr-16 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-purple-400 text-gray-800 placeholder-gray-400'
            />
            <div className='absolute right-2 flex items-center'>
              <button
                type='submit'
                disabled={!input.trim()}
                className='p-2 text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50'
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
