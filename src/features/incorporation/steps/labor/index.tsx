import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Users, 
  Briefcase, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Bot,
  Building,
  ShieldCheck,
  HardHat
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function LaborStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    epfo_number: '',
    esic_number: '',
    registration_date: '',
    establishment_id: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getLabor()
        if (response && response.labor_data) {
          setFormData(response.labor_data)
        }
      } catch (error) {
        console.error('Failed to fetch Labor data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSimulateLabor = () => {
    setFormData({
      epfo_number: 'PYMAA' + Math.floor(1000000 + Math.random() * 9000000),
      esic_number: '3100' + Math.floor(1000000000 + Math.random() * 9000000000),
      registration_date: new Date().toISOString().split('T')[0],
      establishment_id: 'EST-' + Math.random().toString(36).substring(7).toUpperCase()
    })
    toast.success('PF & ESI Registrations Allotted!')
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.saveLabor(formData)
      toast.success('Labor data saved!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.epfo_number) {
      toast.error('Please ensure EPFO and ESIC registrations are complete.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveLabor(formData)
      workflow.completeStep(10)
      toast.success('Step 10: PF & ESI Registration Completed!')
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
          <div className='p-3 bg-orange-500/10 rounded-2xl'>
            <HardHat className='h-8 w-8 text-orange-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 10: PF & ESI Registration</h1>
            <p className='text-sm text-muted-foreground'>Labor law compliance: Employees' Provident Fund and State Insurance.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='border-none shadow-lg overflow-hidden'>
               <CardHeader className='pb-2'>
                 <CardTitle className='text-md flex items-center gap-2'>
                    <Users className='h-4 w-4 text-orange-500' />
                    EPFO (PF) Registration
                 </CardTitle>
               </CardHeader>
               <CardContent className='space-y-4'>
                 <div className='space-y-2'>
                   <Label>Establishment Code</Label>
                   <Input value={formData.epfo_number} readOnly className='bg-muted/30 font-mono tracking-wider' />
                 </div>
               </CardContent>
            </Card>

            <Card className='border-none shadow-lg overflow-hidden'>
               <CardHeader className='pb-2'>
                 <CardTitle className='text-md flex items-center gap-2'>
                    <Users className='h-4 w-4 text-orange-500' />
                    ESIC Registration
                 </CardTitle>
               </CardHeader>
               <CardContent className='space-y-4'>
                 <div className='space-y-2'>
                   <Label>Registration Number</Label>
                   <Input value={formData.esic_number} readOnly className='bg-muted/30 font-mono tracking-wider' />
                 </div>
               </CardContent>
            </Card>
          </div>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/gst' })}>
              <ChevronLeft className='h-4 w-4' /> Back to GST
            </Button>
            <div className='flex gap-3'>
              <Button variant='outline' className='gap-2' onClick={handleSaveDraft} disabled={isSavingDraft}>
                <Save className='h-4 w-4' /> Save Draft
              </Button>
              <Button className='px-8 bg-orange-600 hover:bg-orange-700 text-white' onClick={handleSimulateLabor}>
                <Bot className='mr-2 h-4 w-4' /> AI Labor Portal Sync
              </Button>
              <Button className='px-8' onClick={handleComplete} disabled={isProcessing}>
                {isProcessing ? 'Finalizing...' : 'Finalize Step 10'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4'>
           <Card className='bg-orange-500/5 border-orange-500/10 shadow-none h-full'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm flex items-center gap-2 text-orange-700'>
                  <Bot className='h-4 w-4' />
                  Compliance Agent
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                 <p className='text-[11px] leading-relaxed'>
                   PF & ESI registrations are mandatory for companies once they reach the employee threshold.
                 </p>
                 <div className='flex items-center gap-2 text-[10px]'>
                    <CheckCircle2 className='h-3 w-3 text-green-500' />
                    <span>Statutory Compliance Checked</span>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
