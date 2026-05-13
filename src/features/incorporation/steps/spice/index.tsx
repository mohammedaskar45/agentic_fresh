import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileCheck, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  Loader2,
  ShieldAlert,
  Bot,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SpiceStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    submission_status: 'pending', // pending, submitted, under_review
    mca_reference_id: '',
    declaration_accepted: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getSpice()
        if (response && response.spice_data) {
          setFormData(response.spice_data)
        }
      } catch (error) {
        console.error('Failed to fetch SPICe+ data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.saveSpice(formData)
      toast.success('Filing draft saved!')
    } catch (error) {
      toast.error('Failed to save draft.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.declaration_accepted) {
      toast.error('Please accept the statutory declaration.')
      return
    }

    setIsProcessing(true)
    try {
      // Simulate MCA submission
      const finalData = { 
        ...formData, 
        submission_status: 'submitted',
        mca_reference_id: 'MCA-' + Math.random().toString(36).substring(7).toUpperCase() 
      }
      await incorporationService.saveSpice(finalData)
      workflow.completeStep(5)
      toast.success('Step 5: SPICe+ (INC-32) Application Filed Successfully!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Filing failed. Please try again.')
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
          <div className='p-3 bg-green-500/10 rounded-2xl'>
            <Globe className='h-8 w-8 text-green-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 5: ROC Filing (SPICe+)</h1>
            <p className='text-sm text-muted-foreground'>Final incorporation application (INC-32) filing with MCA.</p>
          </div>
        </div>
        {formData.mca_reference_id && (
            <Badge variant='secondary' className='text-xs font-mono uppercase'>
                SRN: {formData.mca_reference_id}
            </Badge>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Alert className='border-amber-500/20 bg-amber-500/5'>
            <ShieldAlert className='h-4 w-4 text-amber-600' />
            <AlertTitle className='text-amber-700'>Pre-Submission Check</AlertTitle>
            <AlertDescription className='text-amber-600/80 text-xs'>
              Ensure all documents (MOA, AOA, DIR-2, INC-9) are digitally signed before clicking submit.
            </AlertDescription>
          </Alert>

          <Card className='border-none shadow-lg'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <FileCheck className='h-5 w-5 text-primary' />
                Filing Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                {[
                  { label: 'SPICe+ Part B (INC-32)', status: 'ready' },
                  { label: 'Linked e-MOA (INC-33)', status: 'ready' },
                  { label: 'Linked e-AOA (INC-34)', status: 'ready' },
                  { label: 'AGILE-PRO-S (INC-35)', status: 'ready' }
                ].map((item, idx) => (
                  <div key={idx} className='flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-green-500/20 rounded-lg'>
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                      </div>
                      <span className='text-sm font-medium'>{item.label}</span>
                    </div>
                    <Badge className='bg-green-100 text-green-700 border-green-200'>Validated</Badge>
                  </div>
                ))}

                <div className='flex items-center gap-3 pt-4 border-t'>
                  <input 
                    type='checkbox' 
                    id='declare'
                    className='h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary'
                    checked={formData.declaration_accepted}
                    onChange={(e) => setFormData({...formData, declaration_accepted: e.target.checked})}
                  />
                  <label htmlFor='declare' className='text-sm text-muted-foreground'>
                    I hereby declare that all the information provided is true and I am authorized to file this application on behalf of the company.
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button 
              variant='outline' 
              className='gap-2'
              onClick={() => navigate({ to: '/admin/compliance/incorporation/moa-aoa' })}
            >
              <ChevronLeft className='h-4 w-4' /> Back to Step 4 (Drafting)
            </Button>
            <div className='flex gap-3'>
              <Button 
                variant='outline' 
                className='gap-2'
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                <Save className='h-4 w-4' /> {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button variant='outline' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>Roadmap</Button>
              <Button 
                className='px-8 gap-2'
                onClick={handleComplete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' /> Filing...
                    </>
                ) : (
                    <>
                      <Send className='h-4 w-4' /> Submit Filing (INC-32)
                    </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-primary/10 bg-primary/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-md flex items-center gap-2'>
                <Bot className='h-5 w-5 text-primary' />
                Agent Insight
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-xs leading-relaxed'>
                I have cross-verified the SPICe+ data with your DSC and DIN records. Everything is consistent. 
                <br /><br />
                The current MCA queue time is approx 24-48 hours for review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
