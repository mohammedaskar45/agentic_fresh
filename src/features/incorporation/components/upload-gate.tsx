import { useState, useEffect } from 'react'
import { 
  Upload, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { incorporationService } from '@/services/incorporation.service'

interface UploadGateProps {
  stepId: number
  docTitle: string
  onVerified: () => void
}

export function UploadGate({ stepId, docTitle, onVerified }: UploadGateProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'verifying' | 'verified'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)

  // Fetch status on mount for persistence
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const record = await incorporationService.getRecord()
        const uploads = record.step_uploads || {}
        if (uploads[stepId]) {
          setFileName(uploads[stepId].filename)
          setStatus(uploads[stepId].status || 'verified')
          if (uploads[stepId].status === 'verified') onVerified()
        }
      } catch (error) {
        console.error('Failed to fetch upload status:', error)
      }
    }
    fetchStatus()
  }, [stepId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')
    
    try {
      await incorporationService.uploadDocument(stepId, file)
      toast.success(`${docTitle} uploaded. AI Verification starting...`)
      
      // Simulate AI Verification
      setStatus('verifying')
      setTimeout(async () => {
        await incorporationService.verifyDocument(stepId)
        setStatus('verified')
        toast.success(`${docTitle} Verified Successfully!`)
        onVerified()
      }, 3000)
      
    } catch (error) {
      toast.error('Upload failed.')
      setStatus('idle')
    }
  }

  return (
    <Card className={`border-dashed border-2 transition-all duration-500 ${
      status === 'verified' ? 'bg-green-50 border-green-200' : 
      status === 'verifying' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
    }`}>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-4'>
            <div className={`p-3 rounded-2xl ${
              status === 'verified' ? 'bg-green-500 text-white' : 
              status === 'verifying' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {status === 'verified' ? <ShieldCheck className='h-6 w-6' /> : 
               status === 'verifying' ? <Loader2 className='h-6 w-6 animate-spin' /> : <FileText className='h-6 w-6' />}
            </div>
            <div>
              <h4 className='font-bold text-slate-800'>Step 11 Gateway: Statutory Upload</h4>
              <p className='text-xs text-muted-foreground'>Upload the signed {docTitle} to unlock the next phase.</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {status === 'idle' && (
              <div className='relative'>
                <input 
                  type='file' 
                  className='absolute inset-0 opacity-0 cursor-pointer' 
                  onChange={handleUpload}
                  accept='.pdf'
                />
                <Button variant='outline' className='gap-2 bg-white'>
                  <Upload className='h-4 w-4' /> Upload Signed PDF
                </Button>
              </div>
            )}

            {status === 'verifying' && (
              <Badge className='bg-blue-100 text-blue-700 border-blue-200 gap-1.5 px-3 py-1 animate-pulse'>
                <Clock className='h-3 w-3' /> AI Scanning...
              </Badge>
            )}

            {status === 'verified' && (
              <Badge className='bg-green-100 text-green-700 border-green-200 gap-1.5 px-3 py-1'>
                <CheckCircle2 className='h-3 w-3' /> Verified
              </Badge>
            )}
          </div>
        </div>

        {fileName && (
            <div className='mt-4 p-3 bg-white/50 rounded-lg border border-slate-100 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-slate-400' />
                    <span className='text-xs font-medium text-slate-600'>{fileName}</span>
                </div>
                {status === 'verified' && <span className='text-[10px] text-green-600 font-bold uppercase'>Vaulted</span>}
            </div>
        )}

        {status === 'idle' && (
            <div className='mt-4 flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded'>
                <AlertCircle className='h-3.5 w-3.5 shrink-0' />
                <p><b>Section 11 Compliance:</b> You must download the generated statutory draft, obtain the necessary signatures, and upload the signed PDF copy here for verification.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
