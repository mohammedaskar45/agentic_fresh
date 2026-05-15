import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Users, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
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

export default function RightsIssueListedAppointment() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAppointmentVerified, setIsAppointmentVerified] = useState(false)
  const [formData, setFormData] = useState({
    lead_manager_name: '',
    rta_name: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const status = await rightsIssueService.getStatus()
      if (status.master_data) {
        setFormData({
          lead_manager_name: status.master_data.lead_manager_name || '',
          rta_name: status.master_data.rta_name || '',
        })
      }
    } catch (error) {}
  }

  const handleProceed = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveMasterData(formData)
      await rightsIssueService.saveStep(3)
      riStore.completeStep(3)
      toast.success('Intermediaries appointed successfully!')
      navigate({ to: '/admin/compliance/rights-issue/listed-record-date' })
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
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/board-approval' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-amber-600/10 rounded-2xl'>
            <Users className='h-8 w-8 text-amber-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 3: Appointment of Lead Manager & RTA</h1>
            <p className='text-sm text-muted-foreground'>SEBI mandate: Appoint merchant bankers and registrar for the issue.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-amber-600' />
                Intermediary Details
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Lead Manager Name</Label>
                <Input 
                  placeholder='e.g. ICICI Securities' 
                  value={formData.lead_manager_name}
                  onChange={e => setFormData({...formData, lead_manager_name: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Registrar & Transfer Agent (RTA)</Label>
                <Input 
                  placeholder='e.g. Link Intime' 
                  value={formData.rta_name}
                  onChange={e => setFormData({...formData, rta_name: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className='border-amber-100 bg-amber-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-amber-600' />
                    Appointment Letters
                </CardTitle>
                <CardDescription>Upload the signed appointment letters for Lead Manager and RTA.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={301} 
                    docTitle='Appointment Letters (Consolidated)' 
                    onVerified={() => setIsAppointmentVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/board-approval' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-primary hover:bg-primary/90 text-white'
                disabled={!isAppointmentVerified || !formData.lead_manager_name || isProcessing}
                onClick={handleProceed}
            >
              Confirm Appointments <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-slate-900 text-white'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <ShieldCheck className='h-5 w-5 text-amber-400' />
                SEBI ICDR Reg 76
              </CardTitle>
            </CardHeader>
            <CardContent className='text-xs opacity-90 leading-relaxed'>
              <p>
                Every listed company making a rights issue shall appoint one or more merchant bankers as lead managers. 
                <br /><br />
                The lead manager shall independently verify the disclosures made in the Draft Letter of Offer (DLOF).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
