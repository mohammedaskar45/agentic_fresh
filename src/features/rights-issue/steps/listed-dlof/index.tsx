import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Download,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { UploadGate } from '@/features/incorporation/components/upload-gate'

export default function RightsIssueListedDLOF() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDlofVerified, setIsDlofVerified] = useState(false)

  const handleProceed = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveStep(5)
      riStore.completeStep(5)
      toast.success('DLOF filed with SEBI!')
      navigate({ to: '/admin/compliance/rights-issue/listed-sebi-review' })
    } catch (error) {
      toast.error('Failed to proceed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/listed-record-date' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-purple-600/10 rounded-2xl'>
            <FileText className='h-8 w-8 text-purple-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 5: Draft Letter of Offer (DLOF)</h1>
            <p className='text-sm text-muted-foreground'>Drafting and filing the disclosure document with SEBI.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Bot className='h-4 w-4 text-purple-600' />
                AI-Driven DLOF Drafting
              </CardTitle>
              <CardDescription>Our AI has compiled the DLOF based on SEBI ICDR Chapter III-A requirements.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-slate-50 border rounded-xl'>
                    <div className='flex items-center gap-3'>
                        <FileText className='h-5 w-5 text-purple-600' />
                        <div>
                            <p className='text-sm font-medium'>Draft Letter of Offer (DLOF)</p>
                            <p className='text-[10px] text-slate-400'>Comprehensive Disclosure Document</p>
                        </div>
                    </div>
                    <Button variant='outline' size='sm' className='gap-2'>
                        <Download className='h-3 w-3' /> Download Draft
                    </Button>
                </div>
            </CardContent>
          </Card>

          <Card className='border-purple-100 bg-purple-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <ShieldCheck className='h-4 w-4 text-purple-600' />
                    SEBI Filing Gate
                </CardTitle>
                <CardDescription>Upload the SEBI filing acknowledgment for the DLOF submission.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={501} 
                    docTitle='SEBI Filing Acknowledgment' 
                    onVerified={() => setIsDlofVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/listed-record-date' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20'
                disabled={!isDlofVerified || isProcessing}
                onClick={handleProceed}
            >
              Filing Confirmed <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-purple-600/10 bg-purple-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-purple-800'>
                <ShieldCheck className='h-4 w-4' />
                SEBI Fast Track
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-purple-900/80 leading-relaxed'>
              <p>
                <b>Reg 71:</b> Fast track rights issue does not require SEBI's formal observation if specific eligibility criteria are met.
                <br /><br />
                However, filing with SEBI and Stock Exchanges remains mandatory for public record and observations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
