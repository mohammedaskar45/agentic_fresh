import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Rocket, 
  Flag, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Bot,
  PartyPopper,
  ShieldCheck,
  FileBadge
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CommencementStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    inc_20a_srn: '',
    declaration_date: '',
    status: 'pending' // pending, completed
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getCommencement()
        if (response && response.commencement_data) {
          setFormData(response.commencement_data)
        }
      } catch (error) {
        console.error('Failed to fetch Commencement data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSimulateCommencement = () => {
    setFormData({
      inc_20a_srn: 'COM-' + Math.random().toString(36).substring(7).toUpperCase(),
      declaration_date: new Date().toISOString().split('T')[0],
      status: 'completed'
    })
    toast.success('Commencement of Business (INC-20A) successfully filed!')
  }

  const handleComplete = async () => {
    if (!formData.inc_20a_srn) {
      toast.error('Please file the commencement declaration (INC-20A).')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveCommencement(formData)
      workflow.completeStep(11)
      toast.success('Full Incorporation Lifecycle Completed! Congratulations!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-red-500/10 rounded-2xl'>
            <Rocket className='h-8 w-8 text-red-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 11: Commencement of Business</h1>
            <p className='text-sm text-muted-foreground'>Final statutory filing (INC-20A) to begin business operations.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          {formData.status === 'completed' && (
            <Alert className='border-green-500/20 bg-green-500/5'>
                <PartyPopper className='h-4 w-4 text-green-600' />
                <AlertTitle className='text-green-700'>Mission Accomplished!</AlertTitle>
                <AlertDescription className='text-green-600/80 text-xs'>
                    Your company is now fully compliant and legally authorized to commence all business operations.
                </AlertDescription>
            </Alert>
          )}

          <Card className='border-none shadow-xl overflow-hidden'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Flag className='h-5 w-5 text-red-600' />
                INC-20A Filing Status
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label>Filing SRN</Label>
                    <Input value={formData.inc_20a_srn} readOnly className='bg-muted/30 font-mono uppercase' placeholder='Waiting for filing...' />
                  </div>
                  <div className='space-y-2'>
                    <Label>Date of Declaration</Label>
                    <Input value={formData.declaration_date} readOnly className='bg-muted/30' />
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/labor' })}>
              <ChevronLeft className='h-4 w-4' /> Back to Step 10
            </Button>
            <div className='flex gap-3'>
              <Button className='px-8 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20' onClick={handleSimulateCommencement}>
                <Bot className='mr-2 h-4 w-4' /> AI Final Filing
              </Button>
              <Button className='px-8' onClick={handleComplete} disabled={isProcessing || formData.status !== 'completed'}>
                {isProcessing ? 'Saving...' : 'Finish Journey'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4'>
           <Card className='bg-red-500/5 border-red-500/10 shadow-none h-full'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm flex items-center gap-2 text-red-700'>
                  <ShieldCheck className='h-4 w-4' />
                  Final Verdict
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                 <p className='text-[11px] leading-relaxed'>
                   Section 10A of the Companies Act requires every company to file a declaration of commencement within 180 days.
                 </p>
                 <div className='p-3 bg-white rounded-lg border border-red-100 flex items-center gap-3'>
                    <FileBadge className='h-6 w-6 text-red-600' />
                    <span className='text-[10px] font-bold'>INC-20A Statutory Compliance Ready</span>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
