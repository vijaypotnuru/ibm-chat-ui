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
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { TypeAnimation } from 'react-type-animation'
import remarkGfm from 'remark-gfm'
import { useToast } from '@/hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'

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
  const [sessionId, setSessionId] = useState<string>(uuidv4())
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
    <div className='flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white'>
      {messages.length === 0 && !isTyping ? (
        <div className='flex-1 flex flex-col items-center justify-center p-4'>
          <h1 className='text-3xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-center'>
            How can I assist you today?
          </h1>
          <div className='flex flex-wrap justify-center gap-3 max-w-3xl'>
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleExampleClick(prompt)}
                className='px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-white text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className='flex-1 overflow-auto px-4 py-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800'
          style={{ scrollBehavior: 'smooth' }}
        >
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
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-gradient-to-r from-green-400 to-blue-500'
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
                              onClick={() => copyToClipboard(String(children))}
                              className='absolute top-2 right-2 p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors'
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        ) : (
                          <code
                            className={`${className} bg-gray-800 rounded px-1 py-0.5`}
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      },
                    }}
                    className={`mb-2 p-4 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-gradient-to-r from-gray-800 to-gray-700'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500'
                    } inline-block shadow-lg`}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.role === 'assistant' && (
                    <div className='flex gap-2 text-gray-400 justify-start mt-2'>
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
                <div className='w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600'>
                  <Bot size={24} />
                </div>
                <div
                  className='flex-1 p-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg'
                >
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

      <div className='border-t border-gray-700 shadow-lg bg-gray-800'>
        <form onSubmit={handleSubmit} className='max-w-3xl mx-auto p-4'>
          <div className='relative'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Message ChatGPT...'
              className='w-full p-4 pr-32 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 shadow-inner'
            />
            <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
              <button
                type='button'
                className='p-2 hover:text-blue-500 transition-colors duration-200'
              >
                <Paperclip size={20} />
              </button>
              <button
                type='button'
                className='p-2 hover:text-blue-500 transition-colors duration-200'
              >
                <ImageIcon size={20} />
              </button>
              <button
                type='button'
                className='p-2 hover:text-blue-500 transition-colors duration-200'
              >
                <Globe size={20} />
              </button>
              <button
                type='button'
                className='p-2 hover:text-blue-500 transition-colors duration-200'
              >
                <Mic size={20} />
              </button>
              <button
                type='submit'
                className='p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors duration-200'
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
