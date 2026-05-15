import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Calendar, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Send,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { UploadGate } from '@/features/incorporation/components/upload-gate'

export default function RightsIssueListedRecordDate() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isIntimationVerified, setIsIntimationVerified] = useState(false)
  const [recordDate, setRecordDate] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const status = await rightsIssueService.getStatus()
      if (status.master_data?.record_date) {
        setRecordDate(status.master_data.record_date)
      }
    } catch (error) {}
  }

  const handleProceed = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveMasterData({ record_date: recordDate })
      await rightsIssueService.saveStep(4)
      riStore.completeStep(4)
      toast.success('Record Date notified to Stock Exchanges!')
      navigate({ to: '/admin/compliance/rights-issue/listed-dlof' })
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
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/listed-appointment' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-blue-600/10 rounded-2xl'>
            <Calendar className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 4: Record Date & Exchange Intimation</h1>
            <p className='text-sm text-muted-foreground'>LODR Reg 42: Notify Stock Exchanges about the record date.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-blue-600' />
                Record Date Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 max-w-xs'>
                <Label>Statutory Record Date</Label>
                <Input 
                  type='date' 
                  value={recordDate}
                  onChange={e => setRecordDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className='border-blue-100 bg-blue-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <Send className='h-4 w-4 text-blue-600' />
                    Exchange Filing
                </CardTitle>
                <CardDescription>Upload the BSE/NSE acknowledgment for the record date intimation.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={401} 
                    docTitle='Exchange Acknowledgment' 
                    onVerified={() => setIsIntimationVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/listed-appointment' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-primary hover:bg-primary/90 text-white'
                disabled={!isIntimationVerified || !recordDate || isProcessing}
                onClick={handleProceed}
            >
              Filing Complete <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-blue-600/10 bg-blue-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-blue-800'>
                <ShieldCheck className='h-4 w-4' />
                LODR Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-blue-900/80 leading-relaxed'>
              <p>
                <b>Reg 42:</b> Notice of at least 3 working days (excluding date of notice and date of record date) to Stock Exchanges.
                <br /><br />
                The record date determines which shareholders are eligible for the rights entitlement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
