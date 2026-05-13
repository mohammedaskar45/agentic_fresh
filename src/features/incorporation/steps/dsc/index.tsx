import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Fingerprint, 
  User, 
  IdCard, 
  Mail, 
  Phone, 
  UploadCloud, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'

export default function DSCStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    father_name: '',
    nationality: 'Indian',
    pan: '',
    aadhaar: ''
  })

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getDsc()
        if (response && response.dsc_data) {
          setFormData(response.dsc_data)
        }
      } catch (error) {
        console.error('Failed to fetch DSC data:', error)
      }
    }
    fetchData()
  }, [])

  const handleOcrSimulate = () => {
    setIsAiProcessing(true)
    setTimeout(() => {
      setIsAiProcessing(false)
      toast.success('AI successfully extracted details from PAN card!')
    }, 2000)
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      // Real API Call to Backend
      await incorporationService.saveDsc(formData)
      
      workflow.completeStep(1)
      toast.success('Step 1: DSC Application Completed Successfully!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      console.error('DSC Save Error:', error)
      toast.error('Failed to save DSC data.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-primary/10 rounded-2xl'>
            <Fingerprint className='h-8 w-8 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 1: Digital Signature Acquisition</h1>
            <p className='text-sm text-muted-foreground'>Collect and verify director credentials for Class 3 DSC.</p>
          </div>
        </div>
        <div className='flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full border border-green-500/20'>
          <ShieldCheck className='h-4 w-4' />
          <span className='text-xs font-bold uppercase'>MCA Compliant</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left: Form Sections */}
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-lg overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50' />
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <User className='h-5 w-5 text-primary' />
                Director Personal Details
              </CardTitle>
              <CardDescription>Enter details exactly as they appear on the PAN card.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName'>Full Name</Label>
                  <Input 
                    id='fullName' 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dob'>Date of Birth</Label>
                  <Input 
                    id='dob' 
                    type='date' 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='fatherName'>Father's Name</Label>
                  <Input 
                    id='fatherName' 
                    value={formData.father_name}
                    onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='nationality'>Nationality</Label>
                  <Input 
                    id='nationality' 
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  />
                </div>
              </div>

              <Separator className='my-6' />

              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-semibold flex items-center gap-2'>
                  <IdCard className='h-4 w-4 text-primary' />
                  Identity & Proofs
                </h3>
                <Button 
                  variant='outline' 
                  size='sm' 
                  className='text-xs gap-2 border-primary/20 hover:bg-primary/5'
                  onClick={handleOcrSimulate}
                >
                  <Bot className='h-3 w-3' />
                  Auto-fill with AI OCR
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='pan'>PAN Number</Label>
                  <Input 
                    id='pan' 
                    value={formData.pan}
                    className='uppercase' 
                    maxLength={10} 
                    onChange={(e) => setFormData({...formData, pan: e.target.value})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='aadhaar'>Aadhaar Number</Label>
                  <Input 
                    id='aadhaar' 
                    value={formData.aadhaar}
                    maxLength={12} 
                    onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center space-y-2 hover:border-primary/50 transition-colors cursor-pointer group'>
                  <div className='p-2 bg-muted group-hover:bg-primary/10 rounded-full transition-colors'>
                    <UploadCloud className='h-6 w-6 text-muted-foreground group-hover:text-primary' />
                  </div>
                  <span className='text-xs font-medium'>Upload PAN Card</span>
                </div>
                <div className='border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center space-y-2 hover:border-primary/50 transition-colors cursor-pointer group'>
                  <div className='p-2 bg-muted group-hover:bg-primary/10 rounded-full transition-colors'>
                    <UploadCloud className='h-6 w-6 text-muted-foreground group-hover:text-primary' />
                  </div>
                  <span className='text-xs font-medium'>Upload Aadhaar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end gap-3'>
            <Button variant='outline'>Save as Draft</Button>
            <Button 
              className='px-8'
              onClick={handleComplete}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Validate & Continue'}
            </Button>
          </div>
        </div>

        {/* Right Columns... */}
        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-primary/10 bg-primary/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-md flex items-center gap-2'>
                <Bot className='h-5 w-5 text-primary' />
                Agentic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-start gap-3 p-3 bg-background rounded-lg border border-primary/10'>
                <CheckCircle2 className='h-4 w-4 text-green-500 mt-1' />
                <p className='text-xs leading-relaxed'>
                  AI is ready to validate your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
