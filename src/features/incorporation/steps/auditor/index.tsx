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
  Building2,
  AlertCircle,
  FileSearch
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { UploadGate } from '../../components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function AuditorStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isADT1Verified, setIsADT1Verified] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  const [formData, setFormData] = useState({
    auditor_name: '',
    auditor_frn: '',
    auditor_email: '',
    auditor_address: '',
    membership_no: '',
    appointment_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      if (md?.professionals) {
          const prof = md.professionals
          setFormData(prev => ({
              ...prev,
              auditor_name: prof.auditor_name || '',
              auditor_frn: prof.auditor_frn || '',
              auditor_email: prof.auditor_email || '',
              auditor_address: prof.auditor_address || '',
              membership_no: prof.membership_no || ''
          }))
      }
    } catch (error) {
      console.error('Failed to fetch master data for auditor:', error)
    }
  }

  const handleDownloadDoc = (type: 'consent' | 'resolution' | 'appointment') => {
    const companyName = masterData?.company?.proposed_name || 'THE COMPANY'
    const cin = masterData?.company?.cin || masterData?.coi_data?.cin || 'UXXXXXXXXXXXXXX'
    const regAddress = masterData?.company?.registered_address || 'As per records'
    const email = masterData?.company?.official_email || 'test@agentictech.com'
    
    // Professional Letterhead String
    const letterhead = `${companyName}\nCIN: ${cin}\nRegistered Office: ${regAddress}\nEmail: ${email}\n----------------------------------------------------------------------------------------------------\n\n`

    let title = ''
    let content = ''

    // Create Professional Compact Vertical Signature Blocks
    const signatureBlocks = masterData?.stakeholders?.map((d: any) => `\n(Signature)\n__________________________\n(${d.full_name.toUpperCase()})\nDirector\nDIN: ${d.existing_din || 'Applied For'}`).join('\n') || ''

    switch(type) {
      case 'consent':
        title = 'Auditor Consent Letter'
        content = `To,\nThe Board of Directors,\n${companyName}\n\n` +
          `Subject: Consent and Certificate for appointment as Statutory Auditors under Section 139 of the Companies Act, 2013.\n\n` +
          `Dear Sirs,\n\n` +
          `I/We, ${formData.auditor_name}, Chartered Accountants (FRN: ${formData.auditor_frn}), hereby provide our consent for appointment as the first statutory auditors of ${companyName}.\n\n` +
          `I/We further certify that:\n` +
          `1. I/We are eligible for appointment and am/are not disqualified for appointment under section 141 of the Act.\n` +
          `2. The proposed appointment is as per the term provided under the Act.\n` +
          `3. The proposed appointment is within the limits laid down by or under the authority of the Act.\n\n` +
          `Yours faithfully,\n\n\n\n` +
          `For ${formData.auditor_name}\n` +
          `Chartered Accountants\n` +
          `(Signature & Stamp)`
        break

      case 'resolution':
        title = 'Board Resolution - Auditor Appointment'
        content = letterhead +
          `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE FIRST MEETING OF THE BOARD OF DIRECTORS OF ${companyName} HELD ON ${formData.appointment_date} AT THE REGISTERED OFFICE.\n\n` +
          `"RESOLVED THAT pursuant to the provisions of Section 139(6) of the Companies Act, 2013, M/s ${formData.auditor_name}, Chartered Accountants (FRN: ${formData.auditor_frn}), be and are hereby appointed as the first auditors of the Company to hold office until the conclusion of the first Annual General Meeting of the Company.\n\n` +
          `RESOLVED FURTHER THAT the Board of Directors of the Company be and is hereby authorized to fix their remuneration as may be agreed upon between the auditors and the Board of Directors."\n\n` +
          `Certified True Copy,\n` +
          `For ${companyName}` +
          signatureBlocks +
          `\n\nPlace: ${masterData?.company?.state || 'Chennai'}\nDate: ${new Date().toLocaleDateString()}`
        break

      case 'appointment':
        title = 'Auditor Appointment Letter'
        content = letterhead +
          `Date: ${new Date().toLocaleDateString()}\n\n` +
          `To,\n${formData.auditor_name}\n${formData.auditor_address}\n\n` +
          `Subject: Appointment as First Statutory Auditors of the Company.\n\n` +
          `Dear Sir,\n\n` +
          `We are pleased to inform you that the Board of Directors of ${companyName} at their meeting held on ${formData.appointment_date} have appointed your firm as the first statutory auditors of the Company.\n\n` +
          `You are requested to hold office until the conclusion of the first Annual General Meeting of the Company.\n\n` +
          `Kindly acknowledge the receipt of this letter.\n\n` +
          `For ${companyName}` +
          signatureBlocks +
          `\n\nPlace: ${masterData?.company?.state || 'Chennai'}\nDate: ${new Date().toLocaleDateString()}`
        break
    }

    pdfService.generateStatutoryPDF(title, content, companyName)
  }

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      await incorporationService.saveAuditor(formData)
      workflow.completeStep(8)
      toast.success('Step 8: Auditor Appointment Finalized!')
      navigate({ to: '/admin/compliance/incorporation/commencement' })
    } catch (error) {
      toast.error('Failed to finalize auditor appointment.')
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
            <h1 className='text-2xl font-bold'>Step 8: First Auditor Appointment</h1>
            <p className='text-sm text-muted-foreground'>Statutory appointment within 30 days of Incorporation (Section 139).</p>
          </div>
        </div>
        <Badge variant='outline' className='px-4 py-1 text-amber-700 bg-amber-50 border-amber-200 gap-2'>
           <AlertCircle className='h-3 w-3' /> 30-Day Statutory Clock Active
        </Badge>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          {/* Section 8.1: Auditor Profiling */}
          <Card className='border-none shadow-xl shadow-slate-200/50'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <Building2 className='h-5 w-5 text-amber-600' />
                    Section 8.1: Auditor Firm Verification
                </CardTitle>
                <Badge className='bg-slate-100 text-slate-600 hover:bg-slate-100'>Patched from Master Data</Badge>
              </div>
              <CardDescription>Verify the auditor details captured during Step 0.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                    <Label className='text-xs uppercase tracking-wider text-slate-500'>Auditor Name / Firm Name</Label>
                    <div className='p-3 bg-slate-50 rounded-lg border font-medium text-slate-900'>
                        {formData.auditor_name || 'Not Specified'}
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label className='text-xs uppercase tracking-wider text-slate-500'>Firm Reg. No (FRN)</Label>
                    <div className='p-3 bg-slate-50 rounded-lg border font-medium text-slate-900'>
                        {formData.auditor_frn || 'Not Specified'}
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label className='text-xs uppercase tracking-wider text-slate-500'>Official Email</Label>
                    <div className='p-3 bg-slate-50 rounded-lg border font-medium text-slate-900 italic'>
                        {formData.auditor_email || 'Not Specified'}
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label className='text-xs uppercase tracking-wider text-slate-500'>Appointment Date (Board Meeting)</Label>
                    <Input 
                      type='date'
                      value={formData.appointment_date}
                      onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                      className='bg-white'
                    />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statutory Drafting Hub */}
          <Card className='border-none shadow-xl shadow-slate-200/50'>
            <CardHeader className='bg-slate-50/50'>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <FileSearch className='h-5 w-5 text-indigo-600' />
                    Statutory Drafting Hub
                </CardTitle>
                <CardDescription>Generate the mandatory documents for the auditor's legal appointment.</CardDescription>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
                {[
                    { id: 'consent', label: 'Auditor Consent & Certificate', desc: 'Required from Auditor under Sec 139' },
                    { id: 'resolution', label: 'Board Resolution (CTC)', desc: 'Certified copy for ADT-1 filing' },
                    { id: 'appointment', label: 'Formal Appointment Letter', desc: 'Intimation letter to the Auditor' }
                ].map((doc) => (
                    <div key={doc.id} className='flex items-center justify-between p-4 bg-white border rounded-2xl hover:border-indigo-200 transition-all'>
                        <div className='flex items-center gap-4'>
                            <div className='p-2 bg-indigo-50 rounded-lg'>
                                <FileText className='h-5 w-5 text-indigo-600' />
                            </div>
                            <div>
                                <h4 className='text-sm font-bold text-slate-900'>{doc.label}</h4>
                                <p className='text-[10px] text-slate-500'>{doc.desc}</p>
                            </div>
                        </div>
                        <Button variant='outline' size='sm' className='rounded-xl gap-2' onClick={() => handleDownloadDoc(doc.id as any)}>
                            <Download className='h-3.5 w-3.5' /> Download Draft
                        </Button>
                    </div>
                ))}
            </CardContent>
          </Card>

          {/* MCA Compliance: ADT-1 Filing */}
          <Card className='border-indigo-100 bg-indigo-50/20'>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <ShieldCheck className='h-5 w-5 text-indigo-600' />
                    MCA Compliance: Form ADT-1
                </CardTitle>
                <CardDescription>ADT-1 must be filed on MCA21 within 15 days of the Board Meeting.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='p-4 bg-white border border-indigo-100 rounded-2xl'>
                    <h5 className='text-xs font-bold text-slate-400 uppercase mb-3'>Upload ADT-1 ROC Acknowledgment</h5>
                    <UploadGate 
                        stepId={8} 
                        docTitle='ADT-1 ROC Acknowledgment' 
                        onVerified={() => setIsADT1Verified(true)} 
                    />
                </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='ghost' className='gap-2 rounded-xl' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
              <ChevronLeft className='h-4 w-4' /> Back to Dashboard
            </Button>
            <Button 
                className='px-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg h-12 gap-2'
                disabled={!isADT1Verified || isProcessing}
                onClick={handleSave}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Finalize Step 8'} <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-amber-600/10 bg-amber-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-amber-800'>
                <AlertCircle className='h-4 w-4' />
                Legal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-amber-900/80 leading-relaxed'>
              <div className='p-3 bg-white/50 rounded-xl border border-amber-100 space-y-2'>
                <div className='flex items-center justify-between font-bold text-amber-900'>
                    <span>Board Meeting</span>
                    <span className='text-amber-600'>Within 30 Days</span>
                </div>
                <p>The First Auditor must be appointed in the first Board Meeting held after incorporation.</p>
              </div>
              <div className='p-3 bg-white/50 rounded-xl border border-amber-100 space-y-2'>
                <div className='flex items-center justify-between font-bold text-amber-900'>
                    <span>ADT-1 Filing</span>
                    <span className='text-amber-600'>Within 15 Days</span>
                </div>
                <p>Form ADT-1 must be filed with the ROC within 15 days of the Board Meeting date.</p>
              </div>
              <div className='pt-2 flex items-center gap-2 font-bold text-amber-700'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                <span>Next: INC-20A Commencement (Step 9)</span>
              </div>
            </CardContent>
          </Card>

          <Card className='border-slate-100 shadow-none'>
             <CardHeader className='pb-2'>
                <CardTitle className='text-xs uppercase tracking-widest text-slate-400 font-bold'>Professional Insight</CardTitle>
             </CardHeader>
             <CardContent className='text-xs italic text-slate-500 leading-relaxed'>
                "The first auditors hold office until the first Annual General Meeting (AGM). Ensure the ADT-1 filing is done accurately to avoid hefty late fees (up to 12x of normal fee)."
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
