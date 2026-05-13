import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Bot,
  MapPin,
  Building,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function GSTStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    gstin: '',
    state_jurisdiction: 'Tamil Nadu',
    taxpayer_type: 'Regular',
    registration_date: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getGst()
        if (response && response.gst_data) {
          setFormData(response.gst_data)
        }
      } catch (error) {
        console.error('Failed to fetch GST data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSimulateGst = () => {
    setFormData({
      ...formData,
      gstin: '33AAAC' + Math.random().toString(36).substring(2, 7).toUpperCase() + '1Z5',
      registration_date: new Date().toISOString().split('T')[0]
    })
    toast.success('GSTIN Allotted by Portal!')
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.saveGst(formData)
      toast.success('GST data saved!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.gstin) {
      toast.error('Please ensure GSTIN is allotted.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveGst(formData)
      workflow.completeStep(9)
      toast.success('Step 9: GST Registration Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-teal-500/10 rounded-2xl'>
            <Zap className='h-8 w-8 text-teal-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 9: GST Registration</h1>
            <p className='text-sm text-muted-foreground'>Application for Goods and Services Tax Identification Number.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-lg overflow-hidden'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <FileText className='h-5 w-5 text-teal-600' />
                GSTIN Allotment
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                 <div className='space-y-2'>
                   <Label>GST Identification Number (GSTIN)</Label>
                   <Input 
                     placeholder='Allotted GSTIN' 
                     value={formData.gstin}
                     readOnly
                     className='bg-muted/30 font-mono text-lg tracking-wider'
                   />
                 </div>
                 <div className='space-y-2'>
                    <Label>Taxpayer Type</Label>
                    <Input value={formData.taxpayer_type} readOnly className='bg-muted/30' />
                 </div>
                 <div className='space-y-2 flex items-center gap-2 pt-8'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Jurisdiction: {formData.state_jurisdiction}</span>
                 </div>
               </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/bank' })}>
              <ChevronLeft className='h-4 w-4' /> Back to Bank Setup
            </Button>
            <div className='flex gap-3'>
              <Button variant='outline' className='gap-2' onClick={handleSaveDraft} disabled={isSavingDraft}>
                <Save className='h-4 w-4' /> Save Draft
              </Button>
              <Button className='px-8 bg-teal-600 hover:bg-teal-700 text-white' onClick={handleSimulateGst}>
                <Bot className='mr-2 h-4 w-4' /> AI GST Portal Sync
              </Button>
              <Button className='px-8' onClick={handleComplete} disabled={isProcessing}>
                {isProcessing ? 'Finalizing...' : 'Finalize Step 9'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4'>
          <Card className='bg-teal-500/5 border-teal-500/10 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-teal-700'>
                <Bot className='h-4 w-4' />
                GST Compliance Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
               <p className='text-[11px] leading-relaxed'>
                 I am monitoring your GST portal status. Registration has been approved under the "Regular" category.
               </p>
               <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-[10px]'>
                    <CheckCircle2 className='h-3 w-3 text-green-500' />
                    <span>State Jurisdiction Tamil Nadu Verified</span>
                  </div>
                  <div className='flex items-center gap-2 text-[10px]'>
                    <ShieldCheck className='h-3 w-3 text-blue-500' />
                    <span>E-Certificate Available for Download</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
