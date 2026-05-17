import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import axiosInstance from '@/lib/axios'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Agentic AI Assistant. How can I help you with your incorporation process today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/v1/ai-chat/query', {
        message: userMsg
      })

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am facing some technical issues. Please try again.' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please make sure the backend is running.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you now?' }])
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className='fixed bottom-8 right-8 z-50'>
        <Button 
          size='icon' 
          className='h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-tr from-primary to-blue-600 border-4 border-white dark:border-slate-900'
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className='h-8 w-8 text-white animate-pulse' />
        </Button>
      </div>

      {/* Large ChatGPT-like Sidebar Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side='right' className='w-full sm:max-w-[500px] p-0 flex flex-col border-l-primary/10'>
          <SheetHeader className='p-6 border-b bg-gradient-to-r from-primary/5 to-transparent'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                  <Bot className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <SheetTitle className='text-xl font-bold tracking-tight'>Agentic AI Hub</SheetTitle>
                  <p className='text-xs text-muted-foreground'>Powered by Llama 3 • Live Data Access</p>
                </div>
              </div>
              <Button variant='ghost' size='icon' onClick={clearChat} title='Clear Chat'>
                <Trash2 className='h-4 w-4 text-muted-foreground' />
              </Button>
            </div>
          </SheetHeader>

          {/* Chat Area */}
          <div className='flex-1 overflow-hidden flex flex-col bg-slate-50/30 dark:bg-slate-900/10'>
            <ScrollArea className='flex-1 p-6' ref={scrollRef}>
              <div className='space-y-6 max-w-full overflow-hidden'>
                {messages.map((m, i) => (
                  <div key={i} className={cn(
                    'flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
                    m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                      m.role === 'user' ? 'bg-primary' : 'bg-secondary'
                    )}>
                      {m.role === 'user' ? <User className='h-4 w-4 text-white' /> : <Bot className='h-4 w-4 text-primary' />}
                    </div>
                    <div className={cn(
                      'relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-border rounded-tl-none'
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className='flex items-start gap-4'>
                    <div className='h-8 w-8 rounded-full bg-secondary flex items-center justify-center'>
                      <Bot className='h-4 w-4 text-primary' />
                    </div>
                    <div className='bg-white dark:bg-slate-800 border border-border rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin text-primary' />
                      <span className='text-muted-foreground italic font-medium'>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className='p-6 border-t bg-white dark:bg-slate-900'>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className='relative flex items-center'
            >
              <Input 
                placeholder='Ask about your incorporation, objects, or directors...' 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='pr-14 h-14 rounded-xl border-primary/20 focus-visible:ring-primary shadow-inner'
              />
              <Button 
                type='submit' 
                size='icon' 
                className='absolute right-2 h-10 w-10 rounded-lg shadow-lg' 
                disabled={isLoading || !input.trim()}
              >
                <Send className='h-5 w-5' />
              </Button>
            </form>
            <p className='text-[10px] text-center mt-3 text-muted-foreground'>
              AI may provide guidance; please verify critical statutory requirements with a CS.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
