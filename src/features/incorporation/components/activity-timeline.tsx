import { useState, useEffect } from 'react'
import { 
  History, 
  CheckCircle2, 
  UploadCloud, 
  ShieldCheck, 
  PlusCircle,
  Clock,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { incorporationService } from '@/services/incorporation.service'
import { formatDistanceToNow } from 'date-fns'

interface LogEntry {
  id: string
  event_type: string
  description: string
  created_at: string
  metadata?: any
}

export function ActivityTimeline() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const data = await incorporationService.getLogs()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'RECORD_CREATED': return <PlusCircle className='h-4 w-4 text-blue-500' />
      case 'STEP_COMPLETED': return <CheckCircle2 className='h-4 w-4 text-green-500' />
      case 'DOC_UPLOADED': return <UploadCloud className='h-4 w-4 text-purple-500' />
      case 'DOC_VERIFIED': return <ShieldCheck className='h-4 w-4 text-amber-500' />
      default: return <Clock className='h-4 w-4 text-slate-400' />
    }
  }

  if (isLoading) return <div className='p-8 text-center text-sm text-muted-foreground'>Loading history...</div>

  return (
    <Card className='border-none shadow-none bg-transparent'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <History className='h-4 w-4 text-slate-400' />
          Audit Trail & Governance
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        <div className='relative space-y-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100'>
          {logs.map((log) => (
            <div key={log.id} className='relative pl-8 group'>
              <div className='absolute left-0 top-1 p-1 bg-white border rounded-full z-10 group-hover:scale-110 transition-transform'>
                {getEventIcon(log.event_type)}
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-semibold text-slate-800 leading-tight'>{log.description}</p>
                <div className='flex items-center gap-2 text-[10px] text-slate-400'>
                   <span>{formatDistanceToNow(new Date(log.created_at))} ago</span>
                   {log.metadata?.filename && (
                     <>
                        <ChevronRight className='h-2.5 w-2.5' />
                        <span className='font-mono bg-slate-50 px-1 rounded border'>{log.metadata.filename}</span>
                     </>
                   )}
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className='pl-8 text-xs text-slate-400'>No activity recorded yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
