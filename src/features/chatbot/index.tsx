import React, { useState } from 'react'
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
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { TypeAnimation } from 'react-type-animation'
import remarkGfm from 'remark-gfm'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

const examplePrompts = [
  'What are the benefits of meditation?',
  'How do I start learning to code?',
  'Explain quantum computing in simple terms',
  'What are some easy recipes for beginners?',
  'How can I improve my public speaking skills?',
]

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { toast } = useToast()

  const mutationAiChat = useMutation({
    mutationFn: (data: any) =>
      aiChatApi({ prompt: data.prompt, sessionId: 'user123' }),
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
    mutationAiChat.mutate({ prompt: prompt, sessionId: 'user123' })
  }

  return (
    <div className='flex flex-col h-screen bg-[#121212] text-white'>
      {messages.length === 0 && !isTyping ? (
        <div className='flex-1 flex flex-col items-center justify-center'>
          <h1 className='text-4xl font-semibold mb-8 text-gray-200'>
            How can I assist you today?
          </h1>
          <div className='flex flex-wrap justify-center gap-3 max-w-3xl px-4'>
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleExampleClick(prompt)}
                className='px-4 py-2 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors duration-200 text-gray-200'
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex-1 overflow-auto px-4 py-8'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3xl mx-auto mb-6 animate-fade-in ${message.role === 'user' ? 'flex justify-end' : ''}`}
            >
              <div
                className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'assistant' ? 'bg-[#2A2A2A]' : 'bg-blue-500'}`}
                >
                  {message.role === 'assistant' ? <Bot size={20} /> : 'U'}
                </div>
                <div
                  className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className={`mb-2 p-3 rounded-lg ${message.role === 'assistant' ? 'bg-[#2A2A2A]' : 'bg-blue-600'} inline-block`}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.role === 'assistant' && (
                    <div className='flex gap-2 text-gray-400 justify-start'>
                      <button className='hover:text-white transition-colors duration-200'>
                        <Play size={16} />
                      </button>
                      <button className='hover:text-white transition-colors duration-200'>
                        <Volume2 size={16} />
                      </button>
                      <button className='hover:text-white transition-colors duration-200'>
                        <Copy size={16} />
                      </button>
                      <button className='hover:text-white transition-colors duration-200'>
                        <ThumbsUp size={16} />
                      </button>
                      <button className='hover:text-white transition-colors duration-200'>
                        <ThumbsDown size={16} />
                      </button>
                      <button className='hover:text-white transition-colors duration-200'>
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
                <div className='w-8 h-8 rounded-full flex items-center justify-center bg-[#2A2A2A]'>
                  <Bot size={20} />
                </div>
                <div className='flex-1'>
                  <TypeAnimation
                    sequence={['Typing...']}
                    wrapper='span'
                    speed={50}
                    style={{ display: 'inline-block' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='border-t border-gray-800 shadow-lg'>
        <form onSubmit={handleSubmit} className='max-w-3xl mx-auto p-4'>
          <div className='relative'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Message ChatGPT...'
              className='w-full p-4 pr-32 rounded-lg bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400'
            />
            <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
              <button type='button' className='p-2 hover:text-blue-500'>
                <Paperclip size={20} />
              </button>
              <button type='button' className='p-2 hover:text-blue-500'>
                <ImageIcon size={20} />
              </button>
              <button type='button' className='p-2 hover:text-blue-500'>
                <Globe size={20} />
              </button>
              <button type='button' className='p-2 hover:text-blue-500'>
                <Mic size={20} />
              </button>
              <button type='submit' className='p-2 hover:text-blue-500'>
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
