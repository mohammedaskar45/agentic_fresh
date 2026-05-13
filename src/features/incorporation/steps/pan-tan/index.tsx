import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  CreditCard, 
  Hash, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  Download,
  ShieldCheck,
  CheckCircle2,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function PanTanStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    pan_number: '',
    tan_number: '',
    ao_code: 'CHN W 123 1',
    allotment_date: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getPanTan()
        if (response && response.pan_tan_data) {
          setFormData(response.pan_tan_data)
        }
      } catch (error) {
        console.error('Failed to fetch PAN/TAN data:', error)
      }
    }
    fetchData()
  }, [])

  const handleGenerateAI = () => {
    // Simulation of Income Tax Dept allotment
    setFormData({
      ...formData,
      pan_number: 'AAAC' + Math.random().toString(36).substring(2, 7).toUpperCase() + 'A',
      tan_number: 'CHNP' + Math.random().toString(36).substring(2, 7).toUpperCase() + 'T',
      allotment_date: new Date().toISOString().split('T')[0]
    })
    toast.success('Tax Identity (PAN/TAN) successfully allotted!')
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.savePanTan(formData)
      toast.success('Tax data saved!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.pan_number || !formData.tan_number) {
      toast.error('Please ensure PAN and TAN numbers are generated.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.savePanTan(formData)
      workflow.completeStep(6)
      toast.success('Step 6: PAN & TAN Allotment Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button 
            variant='ghost' 
            size='icon' 
            onClick={() => navigate({ to: '/admin/compliance/incorporation' })}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-indigo-500/10 rounded-2xl'>
            <CreditCard className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 6: PAN & TAN Allotment</h1>
            <p className='text-sm text-muted-foreground'>Automatic allotment of Permanent Account Number & Tax Deduction Account Number.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='border-none shadow-lg overflow-hidden'>
              <div className='h-1.5 bg-indigo-500' />
              <CardHeader className='pb-2'>
                <CardTitle className='text-md flex items-center gap-2'>
                    <Hash className='h-4 w-4 text-indigo-500' />
                    Permanent Account Number (PAN)
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Allotted PAN</Label>
                  <Input 
                    placeholder='Fetching from NSDL...' 
                    value={formData.pan_number}
                    readOnly
                    className='bg-muted/30 font-mono text-lg tracking-widest uppercase'
                  />
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-lg overflow-hidden'>
              <div className='h-1.5 bg-indigo-500' />
              <CardHeader className='pb-2'>
                <CardTitle className='text-md flex items-center gap-2'>
                    <Hash className='h-4 w-4 text-indigo-500' />
                    Tax Deduction Account Number (TAN)
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Allotted TAN</Label>
                  <Input 
                    placeholder='Fetching from IT Dept...' 
                    value={formData.tan_number}
                    readOnly
                    className='bg-muted/30 font-mono text-lg tracking-widest uppercase'
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className='border-none shadow-lg'>
            <CardHeader>
              <CardTitle className='text-sm font-bold'>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-4'>
               <div className='space-y-2'>
                 <Label>AO Code</Label>
                 <Input value={formData.ao_code} readOnly className='bg-muted/30' />
               </div>
               <div className='space-y-2'>
                 <Label>Allotment Date</Label>
                 <Input type='date' value={formData.allotment_date} readOnly className='bg-muted/30' />
               </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button 
              variant='outline' 
              className='gap-2'
              onClick={() => navigate({ to: '/admin/compliance/incorporation/spice' })}
            >
              <ChevronLeft className='h-4 w-4' /> Back to Step 5 (SPICe+)
            </Button>
            <div className='flex gap-3'>
              <Button 
                variant='outline' 
                className='gap-2'
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                <Save className='h-4 w-4' /> Save
              </Button>
              <Button 
                className='px-8 gap-2'
                onClick={handleGenerateAI}
              >
                <Bot className='h-4 w-4' /> Simulate IT Dept Allotment
              </Button>
              <Button 
                className='px-8'
                onClick={handleComplete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Finalizing...' : 'Finalize Step 6'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-indigo-500/10 bg-indigo-500/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-md flex items-center gap-2 text-indigo-700'>
                <Bot className='h-5 w-5' />
                Tax Compliance AI
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-start gap-3 p-3 bg-background rounded-lg border border-indigo-500/10'>
                  <CheckCircle2 className='h-4 w-4 text-green-500 mt-1' />
                  <p className='text-xs leading-relaxed'>
                    PAN/TAN are linked with the COI application.
                  </p>
                </div>
                <div className='flex items-start gap-3 p-3 bg-background rounded-lg border border-indigo-500/10'>
                  <ShieldCheck className='h-4 w-4 text-indigo-500 mt-1' />
                  <p className='text-xs leading-relaxed'>
                    E-PAN will be delivered within 24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
