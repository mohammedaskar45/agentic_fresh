import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  History, 
  Upload, 
  Download, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  FileText,
  Bot,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Coins,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { UploadGate } from '../../components/upload-gate'
import { pdfService } from '@/lib/pdf-service'
import { cn } from '@/lib/utils'

export default function CommencementStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isBankStatementVerified, setIsBankStatementVerified] = useState(false)
  const [isINC20AVerified, setIsINC20AVerified] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  const [daysRemaining, setDaysRemaining] = useState(180)
  const [coiDate, setCoiDate] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      
      const coi = await incorporationService.getCoi()
      if (coi?.coi_data?.issued_date) {
        const issuedDate = new Date(coi.coi_data.issued_date)
        setCoiDate(issuedDate.toLocaleDateString())
        const deadlineDate = new Date(issuedDate)
        deadlineDate.setDate(issuedDate.getDate() + 180)
        
        const now = new Date()
        const diff = deadlineDate.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        setDaysRemaining(days > 0 ? days : 0)
      }
    } catch (error) {
      console.error('Failed to fetch data for Step 9:', error)
    }
  }

  const handleDownloadDoc = () => {
    const companyName = masterData?.company?.proposed_name || 'THE COMPANY'
    const cin = masterData?.company?.cin || masterData?.coi_data?.cin || 'UXXXXXXXXXXXXXX'
    const regAddress = masterData?.company?.registered_address || 'As per records'
    const email = masterData?.company?.official_email || 'test@agentictech.com'
    
    // Professional Letterhead String
    const letterhead = `${companyName}\nCIN: ${cin}\nRegistered Office: ${regAddress}\nEmail: ${email}\n----------------------------------------------------------------------------------------------------\n\n`

    const title = 'Board Resolution - Commencement of Business'
    const signatoryBlocks = masterData?.stakeholders?.map((d: any) => `\n(Signature)\n__________________________\n(${d.full_name.toUpperCase()})\nDirector\nDIN: ${d.existing_din || 'Applied For'}`).join('\n') || ''

    const content = letterhead +
      `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${companyName} HELD ON ${new Date().toLocaleDateString()} AT THE REGISTERED OFFICE.\n\n` +
      `"RESOLVED THAT pursuant to Section 10A of the Companies Act, 2013, the Company do file a declaration with the Registrar of Companies in Form INC-20A for the commencement of its business.\n\n` +
      `RESOLVED FURTHER THAT it be noted that each of the subscribers to the Memorandum of Association has paid the value of shares agreed to be taken by him as on date and the same has been deposited in the Company's Bank Account.\n\n` +
      `RESOLVED FURTHER THAT any one of the Directors of the Company be and is hereby authorized to sign the Form INC-20A and other necessary documents and to do all such acts as may be necessary to give effect to this resolution."\n\n` +
      `Certified True Copy,\n` +
      `For ${companyName}` +
      signatoryBlocks +
      `\n\nPlace: ${masterData?.company?.state || 'Chennai'}\nDate: ${new Date().toLocaleDateString()}`

    pdfService.generateStatutoryPDF(title, content, companyName)
  }

  const handleComplete = async () => {
    setIsProcessing(true)
    try {
      await incorporationService.saveCommencement({ status: 'completed' })
      workflow.completeStep(9)
      toast.success('CONGRATULATIONS! Statutory Incorporation Workflow Completed.')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed.')
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
          <div className='p-3 bg-indigo-600/10 rounded-2xl'>
            <History className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 9: Commencement of Business</h1>
            <p className='text-sm text-muted-foreground'>Statutory Declaration of business commencement (Form INC-20A).</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-1'>
            <Badge className='bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1 gap-2'>
                <ShieldCheck className='h-3 w-3' /> Final Compliance Milestone
            </Badge>
            <p className='text-[10px] text-slate-400 font-medium'>Section 10A of Companies Act, 2013</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          
          {/* Section 9.1: Capital Verification */}
          <Card className='border-none shadow-xl shadow-slate-200/50 overflow-hidden'>
             <div className='h-1.5 bg-indigo-600 w-full' />
             <CardHeader className='pb-2'>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <Coins className='h-5 w-5 text-indigo-600' />
                    Section 9.1: Share Capital Verification
                </CardTitle>
                <CardDescription>Confirm that all subscribers have paid the subscription money.</CardDescription>
             </CardHeader>
             <CardContent className='pt-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                    <div className='p-4 bg-slate-50 rounded-2xl border'>
                        <Label className='text-[10px] uppercase text-slate-500'>Authorised Capital</Label>
                        <p className='text-xl font-black text-slate-900'>₹ {masterData?.company?.authorised_capital?.toLocaleString() || '0'}</p>
                    </div>
                    <div className='p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100'>
                        <Label className='text-[10px] uppercase text-indigo-600'>Paid-up Capital</Label>
                        <p className='text-xl font-black text-indigo-900'>₹ {masterData?.company?.paid_up_capital?.toLocaleString() || '0'}</p>
                    </div>
                    <div className='p-4 bg-slate-50 rounded-2xl border'>
                        <Label className='text-[10px] uppercase text-slate-500'>Bank Account</Label>
                        <p className='text-sm font-bold text-slate-900 truncate'>{masterData?.company?.bank_name || 'Bank Not Linked'}</p>
                    </div>
                </div>

                <div className='p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3'>
                    <div className='flex items-center gap-2 text-amber-800 font-bold text-sm'>
                        <AlertTriangle className='h-4 w-4' /> Mandatory Evidence
                    </div>
                    <p className='text-xs text-amber-700 leading-relaxed'>
                        Before filing INC-20A, you must upload the <b>Bank Statement</b> showing clear credit entries for each subscriber's share value.
                    </p>
                    <UploadGate 
                        stepId={9} 
                        docTitle='Bank Statement (Capital Deposit)' 
                        onVerified={() => setIsBankStatementVerified(true)} 
                    />
                </div>
             </CardContent>
          </Card>

          {/* Statutory Documents */}
          <Card className='border-none shadow-xl shadow-slate-200/50'>
             <CardHeader className='bg-slate-50/50'>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-indigo-600' />
                    Drafting Hub: INC-20A
                </CardTitle>
                <CardDescription>Generate documents required for the ROC filing.</CardDescription>
             </CardHeader>
             <CardContent className='pt-6'>
                <div className='flex items-center justify-between p-5 bg-white border rounded-2xl hover:border-indigo-200 transition-all group'>
                    <div className='flex items-center gap-4'>
                        <div className='p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform'>
                            <FileText className='h-6 w-6' />
                        </div>
                        <div>
                            <h4 className='font-bold text-slate-900'>Board Resolution for INC-20A</h4>
                            <p className='text-xs text-slate-500'>Declaration of compliance per Section 10A</p>
                        </div>
                    </div>
                    <Button variant='outline' className='rounded-xl gap-2 shadow-sm' onClick={handleDownloadDoc}>
                        <Download className='h-4 w-4' /> Download Draft
                    </Button>
                </div>
             </CardContent>
          </Card>

          {/* Final Step: INC-20A Acknowledgment */}
          <Card className={cn(
              'border-2 transition-all duration-500',
              isBankStatementVerified ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/30 opacity-50'
          )}>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                    <ShieldCheck className={cn('h-5 w-5', isBankStatementVerified ? 'text-indigo-600' : 'text-slate-400')} />
                    Final Compliance: INC-20A ROC Acknowledgment
                </CardTitle>
                <CardDescription>Upload the signed acknowledgment received from MCA21 portal.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={9} 
                    docTitle='INC-20A ROC Acknowledgment' 
                    onVerified={() => setIsINC20AVerified(true)} 
                    disabled={!isBankStatementVerified}
                />
            </CardContent>
          </Card>

          <div className='flex justify-between items-center pt-6'>
            <Button variant='ghost' className='gap-2 rounded-xl text-slate-500' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
              <ChevronLeft className='h-4 w-4' /> Exit to Dashboard
            </Button>
            <Button 
                className='px-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-600/20 h-14 text-lg font-bold gap-3'
                disabled={!isINC20AVerified || isProcessing}
                onClick={handleComplete}
            >
              {isProcessing ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Complete Incorporation'} <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        </div>

        {/* Legal Sidebar */}
        <div className='lg:col-span-4 space-y-6'>
           <Card className='border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-900 text-white overflow-hidden relative'>
              <div className='absolute -right-4 -top-4 p-8 opacity-10 rotate-12'>
                <Clock className='h-32 w-32' />
              </div>
              <CardHeader className='pb-2'>
                <CardTitle className='text-indigo-200 text-[10px] uppercase tracking-widest font-black'>Statutory Timeline</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                 <div className='flex flex-col items-center py-4'>
                    <span className='text-7xl font-black tabular-nums tracking-tighter'>{daysRemaining}</span>
                    <span className='text-xs font-bold text-indigo-300 uppercase tracking-widest'>Days Remaining</span>
                 </div>
                 <div className='space-y-2'>
                    <Progress value={(daysRemaining / 180) * 100} className='h-2 bg-indigo-400/20' />
                    <p className='text-[10px] text-indigo-200 text-center italic'>
                        Countdown started on COI date: {coiDate || 'Fetching...'}
                    </p>
                 </div>
              </CardContent>
           </Card>

           <Card className='border-amber-100 bg-amber-50/50 shadow-none'>
             <CardHeader className='pb-2'>
                <CardTitle className='text-xs font-black uppercase text-amber-700 flex items-center gap-2'>
                    <AlertTriangle className='h-3 w-3' /> Non-Compliance Risk
                </CardTitle>
             </CardHeader>
             <CardContent className='text-[10px] text-amber-800 leading-relaxed space-y-3'>
                <p>
                    <b>Failure to file INC-20A</b> within 180 days results in:
                </p>
                <ul className='list-disc pl-4 space-y-1 font-medium'>
                    <li>Penalty of ₹ 50,000 on the Company.</li>
                    <li>Penalty of ₹ 1,000 per day on each Director.</li>
                    <li>Strike-off of the Company name from ROC register.</li>
                </ul>
             </CardContent>
           </Card>

           <Card className='border-slate-100 shadow-none'>
              <CardHeader className='pb-2'>
                 <CardTitle className='text-xs font-black uppercase text-slate-400'>Professional Advisory</CardTitle>
              </CardHeader>
              <CardContent className='text-[10px] text-slate-500 italic leading-relaxed'>
                 "Ensure the bank statement clearly shows the transaction remarks as 'Subscription Money' or 'Share Capital'. This avoids queries from the ROC during processing."
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
