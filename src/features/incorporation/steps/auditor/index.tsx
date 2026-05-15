import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  UserCheck, 
  CheckCircle2, 
  FileText,
  Upload,
  Download,
  Loader2,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { UploadGate } from '../../components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function AuditorStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConsentVerified, setIsConsentVerified] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  const [formData, setFormData] = useState({
    auditor_name: '',
    auditor_frn: '',
    auditor_email: '',
    auditor_address: '',
    appointment_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      if (md?.company?.auditor_name) {
          setFormData(prev => ({
              ...prev,
              auditor_name: md.company.auditor_name,
              auditor_frn: md.company.auditor_frn || ''
          }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleDownloadDraft = (type: 'consent' | 'resolution') => {
    const companyName = masterData?.company?.proposed_name || 'the Company'
    let title = ''
    let content = ''

    if (type === 'consent') {
      title = 'Auditor Consent Letter'
      content = `To,\nThe Board of Directors,\n${companyName}\n\nSubject: Consent to act as Statutory Auditors.\n\nWe hereby provide our consent for appointment as statutory auditors of ${companyName} and certify that we are eligible under Section 141 of the Companies Act, 2013.\n\nFor ${formData.auditor_name || 'Auditor Firm'},\nChartered Accountants\n(Signature)`
    } else {
      title = 'Board Resolution - Auditor'
      content = `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED BY THE BOARD OF DIRECTORS OF ${companyName}.\n\n"RESOLVED THAT M/s ${formData.auditor_name}, Chartered Accountants (FRN: ${formData.auditor_frn}), be and are hereby appointed as the first auditors of the Company to hold office until the conclusion of the first Annual General Meeting."`
    }

    pdfService.generateStatutoryPDF(title, content, companyName)
  }

  const handleSave = async () => {
    if (!formData.auditor_name || !formData.auditor_frn) {
        toast.error('Macha, Auditor Name and FRN are mandatory!')
        return
    }
    setIsProcessing(true)
    try {
      await incorporationService.saveAuditor(formData)
      workflow.completeStep(11) // Auditor is Step 11 in our 0-indexed store
      toast.success('Auditor details saved successfully!')
      navigate({ to: '/admin/compliance/incorporation/commencement' })
    } catch (error) {
      toast.error('Failed to save auditor details.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-amber-600/10 rounded-2xl'>
            <UserCheck className='h-8 w-8 text-amber-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 10: First Auditor Appointment</h1>
            <p className='text-sm text-muted-foreground'>Appointment of statutory auditors within 30 days of incorporation.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Building2 className='h-4 w-4 text-amber-600' />
                Auditor Firm Details
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Auditor/Firm Name</Label>
                <Input 
                  placeholder='M/s. ABC & Co.' 
                  value={formData.auditor_name}
                  onChange={e => setFormData({...formData, auditor_name: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Firm Registration No. (FRN)</Label>
                <Input 
                  placeholder='123456W' 
                  value={formData.auditor_frn}
                  onChange={e => setFormData({...formData, auditor_frn: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Email Address</Label>
                <Input 
                  type='email'
                  placeholder='auditor@example.com' 
                  value={formData.auditor_email}
                  onChange={e => setFormData({...formData, auditor_email: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Appointment Date</Label>
                <Input 
                  type='date'
                  value={formData.appointment_date}
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className='border-amber-100 bg-amber-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-amber-600' />
                    Required Documents
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center justify-between p-3 bg-white border rounded-xl'>
                    <div className='flex items-center gap-3'>
                        <FileText className='h-5 w-5 text-amber-600' />
                        <span className='text-sm font-medium'>Auditor Consent & Certificate</span>
                    </div>
                    <Button variant='outline' size='sm' onClick={() => handleDownloadDraft('consent')}>
                        <Download className='h-3 w-3 mr-2' /> Draft
                    </Button>
                </div>
                <UploadGate 
                    stepId={11} 
                    docTitle='Signed Consent Letter' 
                    onVerified={() => setIsConsentVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-indigo-600 hover:bg-indigo-700 text-white'
                disabled={!isConsentVerified || isProcessing}
                onClick={handleSave}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Save & Continue'} <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-amber-600/10 bg-amber-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-amber-800'>
                <ShieldCheck className='h-4 w-4' />
                Statutory Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-amber-900/80 leading-relaxed'>
              <p>
                <b>Section 139(6):</b> The first auditor must be appointed by the Board within 30 days of registration.
                <br /><br />
                Failure to appoint may lead to penalties and requires an EGM.
              </p>
              <div className='pt-2 flex items-center gap-2 font-bold text-amber-700'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                <span>ADT-1 filing will follow this step.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
