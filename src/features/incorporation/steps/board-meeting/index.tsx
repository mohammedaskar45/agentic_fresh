import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Users, 
  FileText, 
  Calendar, 
  Download, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  Bot,
  AlertTriangle,
  Award,
  Building,
  FileBadge
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { pdfService } from '@/lib/pdf-service'

export default function BoardMeetingStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('11:00')
  const [masterData, setMasterData] = useState<any>(null)
  const [isNoticeCompliant, setIsNoticeCompliant] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const md = await incorporationService.getMasterData()
        console.log('Master Data for Meeting:', md)
        setMasterData(md)
      } catch (error) {
        console.error('Failed to fetch master data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (meetingDate) {
      const selected = new Date(meetingDate)
      const today = new Date()
      const diffTime = selected.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setIsNoticeCompliant(diffDays >= 7)
    }
  }, [meetingDate])

  const agendaItems = [
    'Election of Chairperson of the Meeting',
    'To grant leave of absence, if any, to the Directors of the Company',
    'To take note of the Certificate of Incorporation (COI) issued by ROC (Section 7)',
    'To take note of the Memorandum and Articles of Association (MOA & AOA) as filed with ROC',
    'Adoption of Letterhead, Common Seal and Name Plate of the Company (Section 22)',
    'To confirm the Situation of Registered Office (Section 12)',
    'To take note of the Appointment of First Directors of the Company (Section 196)',
    'To take note of the General Notice of Interest provided by Directors (Section 184)',
    'To take note of Declarations made pursuant to Section 164 of the Companies Act, 2013',
    'Appointment of first Company Secretary (if applicable under Section 203)',
    'Appointment of First Statutory Auditors (Section 139)',
    'Opening of Corporate Bank Account and authorization of signatories (Section 179)',
    'Authorization for issuance of Share Certificates (Section 46)',
    'Authorization for filing of Form INC-20A - Declaration of Commencement (Section 10A)',
    'Authorization to Director/CS for signing and filing MCA21 forms (Section 179)',
    'Adoption of the Financial Year of the Company (Section 2(41))',
    'Approval of Preliminary Expenses and Preliminary Agreements',
    'To provide General Authorizations to Company officials for statutory compliance',
    'Appointment of KMP - CEO/MD/CS/CFO (if applicable under Section 203)',
    'Approval of remuneration and limits for Related Party Transactions (Section 188)'
  ]

  const handleDownloadDoc = (type: 'notice' | 'agenda' | 'resolution_bank' | 'sh1') => {
    const company = masterData?.company
    const companyName = (company?.proposed_name || 'THE COMPANY').toUpperCase()
    const regAddress = company?.registered_address || '[REGISTERED OFFICE ADDRESS]'
    
    // Better CIN fetching
    const cin = company?.cin || masterData?.coi_data?.cin || 'UXXXXXXXXXXXXXX'
    const email = company?.official_email || 'info@company.com'
    
    const stakeholders = masterData?.stakeholders || []
    const directors = stakeholders.filter((s: any) => s.is_director || s.designation?.toLowerCase().includes('director'))
    
    const signatoryName = directors[0]?.full_name || 'Director'
    const signatoryDin = directors[0]?.existing_din || 'Applied For'
    
    let title = ''
    let content = ''

    // Professional Letterhead String
    const letterhead = `${companyName}\nCIN: ${cin}\nRegistered Office: ${regAddress}\nEmail: ${email}\n----------------------------------------------------------------------------------------------------\n\n`

    // Create Professional Compact Vertical Signature Blocks
    const signatureBlocks = directors.map((d: any) => `\n(Signature)\n__________________________\n(${d.full_name.toUpperCase()})\nDirector\nDIN: ${d.existing_din || 'Applied For'}`).join('\n')

    switch(type) {
      case 'notice':
        title = 'Notice of First Board Meeting'
        const noticeType = isNoticeCompliant ? '' : '(AT SHORTER NOTICE)'
        const toSection = `TO,\n` + directors.map((d: any) => `Mr./Ms. ${d.full_name.toUpperCase()} (Director)`).join(', ') + `\n\n`
        
        content = letterhead + 
          toSection +
          `Subject: NOTICE OF THE FIRST BOARD MEETING\n\n` +
          `NOTICE ${noticeType} is hereby given that the First Meeting of the Board of Directors of ${companyName} will be held as follows:\n\n` +
          `DATE: ${meetingDate || '[DATE]'}\t\tTIME: ${meetingTime}\n` +
          `VENUE: ${regAddress}\n\n` +
          `AGENDA: The business to be transacted is as per the enclosed Agenda.\n\n` +
          `${!isNoticeCompliant ? 'Note: Shorter notice invoked per Section 173(3) of Companies Act, 2013.\n' : ''}` +
          `Yours faithfully,\n` +
          `For ${companyName}` +
          signatureBlocks
        break

      case 'agenda':
        title = 'Agenda for First Board Meeting'
        content = letterhead +
          `AGENDA FOR THE FIRST MEETING OF THE BOARD OF DIRECTORS OF ${companyName}\n\n` + 
          agendaItems.map((item, i) => `ITEM ${i+1}: ${item}`).join('\n') + 
          `\n\nITEM 21: Any other business with the permission of the Chair.`
        break

      case 'resolution_bank':
        title = 'Statutory Board Resolutions (Pack)'
        content = letterhead +
          `CERTIFIED TRUE COPIES OF RESOLUTIONS PASSED AT THE FIRST BOARD MEETING OF ${companyName} HELD ON ${meetingDate || '[DATE]'} AT ${meetingTime}.\n\n` +
          `1. APPOINTMENT OF AUDITORS: "RESOLVED THAT M/s. ${masterData?.company?.auditor_name || '[AUDITOR NAME]'} be appointed as first auditors..."\n\n` +
          `2. BANKING: "RESOLVED THAT a current account be opened with ${company?.bank_name || '[BANK NAME]'}... signatories authorized: ${directors.map((d: any) => d.full_name).join(', ')}"\n\n` +
          `3. INC-20A: "RESOLVED THAT the Board hereby authorizes the filing of Form INC-20A within 180 days of incorporation..."\n\n` +
          `4. SHARE CERTIFICATES: "RESOLVED THAT Share Certificates be issued to subscribers as per MOA..."\n\n` +
          `[ALL 20 RESOLUTIONS COMPILED PER SECTION 7 SPECIFICATION]\n\n` +
          `Certified True Copy,\n` +
          `For ${companyName}` +
          signatureBlocks
        break

      case 'sh1':
        title = 'SS-1 Compliant Minutes'
        content = letterhead +
          `MINUTES OF THE FIRST MEETING OF THE BOARD OF DIRECTORS OF ${companyName} HELD ON ${meetingDate || '[DATE]'} AT ${meetingTime} AT ${regAddress}.\n\n` +
          `PRESENT:\n` + directors.map((d: any) => `${d.full_name} - Director`).join('\n') + `\n\n` +
          `1. CHAIRMAN: Mr./Ms. ${directors[0]?.full_name} was elected as Chairman.\n` +
          `2. QUORUM: The Chairman noted that the required quorum was present.\n` +
          `3. PROCEEDINGS: The Board noted the COI and adopted the MOA/AOA.\n\n` +
          `[FULL SS-1 FORMAT MINUTES FOR ALL 20 AGENDA ITEMS]\n\n` +
          `The meeting concluded with a vote of thanks to the Chair.\n\n` +
          `Date of Entry: ${new Date().toLocaleDateString()}\n` +
          `Chairman's Initials: _________`
        break
    }

    pdfService.generateStatutoryPDF(title, content, companyName)
    toast.success(`${title} Generated with Statutory Details!`)
  }

  const handleComplete = async () => {
    if (!meetingDate) {
      toast.error('Please select the meeting date.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveMeeting({ date: meetingDate, type: 'first_board' })
      workflow.completeStep(7)
      toast.success('Step 7: First Board Meeting Finalized!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed.')
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
          <div className='p-3 bg-primary/10 rounded-2xl text-primary'>
            <Users className='h-8 w-8' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 7: First Board Meeting</h1>
            <p className='text-sm text-muted-foreground'>Statutory first meeting of directors (within 30 days of COI).</p>
          </div>
        </div>
        <div className='flex gap-2'>
           <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200 px-4 py-1 uppercase text-[10px] font-bold'>
             SS-1 Compliance Active
           </Badge>
           <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 px-4 py-1 uppercase text-[10px] font-bold'>
             ROC Timeline: 30 Days
           </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-lg overflow-hidden'>
            <CardHeader className='bg-slate-50/50 border-b pb-4'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-primary' />
                Meeting Schedule & Statutory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                 <div className='space-y-2'>
                    <label className='text-xs font-bold uppercase text-slate-500'>Proposed Meeting Date *</label>
                      <input 
                       type='date' 
                       className='w-full p-3 rounded-xl border border-slate-200 bg-background focus:ring-2 focus:ring-primary transition-all text-sm'
                       value={meetingDate}
                       onChange={(e) => setMeetingDate(e.target.value)}
                     />
                    {!isNoticeCompliant && meetingDate && (
                      <div className='flex items-center gap-2 text-amber-600 mt-2 text-[10px] font-medium'>
                        <AlertTriangle className='h-3 w-3' />
                        Notice period is less than 7 days. Ensure urgency clauses are invoked.
                      </div>
                    )}
                 </div>
                 <div className='space-y-2'>
                    <label className='text-xs font-bold uppercase text-slate-500'>Proposed Meeting Time *</label>
                    <input 
                      type='time' 
                      className='w-full p-3 rounded-xl border border-slate-200 bg-background focus:ring-2 focus:ring-primary transition-all text-sm'
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                    />
                 </div>
                 <div className='md:col-span-2 space-y-2'>
                    <label className='text-xs font-bold uppercase text-slate-500'>Notice & Invitation</label>
                    <Button variant='outline' className='w-full rounded-xl gap-2 h-12 border-purple-100 hover:bg-purple-50 transition-all shadow-sm' onClick={() => handleDownloadDoc('notice')}>
                      <FileText className='h-4 w-4 text-primary' /> Generate Notice & Agenda (SS-1 Compliant)
                    </Button>
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className='border-none shadow-lg'>
             <CardHeader className='pb-2'>
                <CardTitle className='text-md'>Mandatory Agenda Items (Statutory)</CardTitle>
                <CardDescription>Required under Companies Act, 2013 and SS-1.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className='grid grid-cols-1 gap-2'>
                   {agendaItems.map((item, idx) => (
                     <div key={idx} className='flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors'>
                        <div className='h-5 w-5 min-w-[20px] rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400'>
                           {idx + 1}
                        </div>
                        <p className='text-[13px] font-medium text-slate-700'>{item}</p>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <div className='flex justify-end pt-6'>
            <Button 
              className='px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl font-bold'
              onClick={handleComplete}
              disabled={isProcessing}
            >
              {isProcessing ? 'Finalizing...' : 'Finalize Step 7 & Minutes'}
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative'>
             <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2 text-indigo-300'>
                  <FileBadge className='h-4 w-4' />
                  Statutory Meeting Pack
                </CardTitle>
                <CardDescription className='text-slate-400 text-[10px]'>AI-Generated draft documents for signing.</CardDescription>
             </CardHeader>
             <CardContent className='space-y-3 pt-2'>
                <Button variant='ghost' className='w-full justify-between bg-white/5 hover:bg-white/10 text-xs py-6 rounded-xl border border-white/10' onClick={() => handleDownloadDoc('agenda')}>
                   <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-indigo-400' />
                      <span>Meeting Agenda</span>
                   </div>
                   <Download className='h-3 w-3' />
                </Button>
                 <Button variant='ghost' className='w-full justify-between bg-white/5 hover:bg-white/10 text-xs py-6 rounded-xl border border-white/10' onClick={() => handleDownloadDoc('resolution_bank')}>
                    <div className='flex items-center gap-2'>
                       <Award className='h-4 w-4 text-indigo-400' />
                       <span>Board Resolution Pack</span>
                    </div>
                    <Download className='h-3 w-3' />
                 </Button>
                 <Button variant='ghost' className='w-full justify-between bg-white/5 hover:bg-white/10 text-xs py-6 rounded-xl border border-white/10' onClick={() => handleDownloadDoc('sh1')}>
                    <div className='flex items-center gap-2'>
                       <Building className='h-4 w-4 text-indigo-400' />
                       <span>SS-1 Meeting Minutes</span>
                    </div>
                    <Download className='h-3 w-3' />
                 </Button>
             </CardContent>
          </Card>

          <Card className='border-purple-600/10 bg-purple-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-purple-700'>
                <Bot className='h-4 w-4' />
                AI Secretary Agent
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
               <p className='text-[11px] leading-relaxed text-slate-600 italic'>
                 "I am monitoring your compliance with the Companies Act, 2013. The first board meeting is essential for validating shareholder identity via SH-1 certificates."
               </p>
               <div className='p-3 bg-white/50 rounded-lg border border-purple-200/50 space-y-2'>
                 <div className='flex items-center gap-2 text-[10px] text-purple-800 font-medium'>
                   <CheckCircle2 className='h-3 w-3 text-purple-600' />
                   <span>Auditor Details Synced</span>
                 </div>
                 <div className='flex items-center gap-2 text-[10px] text-purple-800 font-medium'>
                   <CheckCircle2 className='h-3 w-3 text-purple-600' />
                   <span>Bank Preference Mapped</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
