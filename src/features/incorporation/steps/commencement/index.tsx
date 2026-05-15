import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  ArrowLeft, 
  ChevronLeft, 
  Rocket, 
  CheckCircle2, 
  AlertCircle,
  Banknote,
  FileText,
  Upload,
  Download,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { UploadGate } from '../../components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function CommencementStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isBankStatementVerified, setIsBankStatementVerified] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  const [bankData, setBankData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      const bd = await incorporationService.getBank()
      setBankData(bd?.bank_data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleDownloadDraft = () => {
    if (!masterData || !masterData.company) {
      return (
        <div className='p-20 text-center space-y-4'>
          <Rocket className='h-12 w-12 text-indigo-400 mx-auto' />
          <h2 className='text-xl font-bold'>Step 0 Data Missing</h2>
          <p className='text-sm text-muted-foreground'>Macha, Step 0 details illama Commencement filing panna mudiyaathu.</p>
          <Button onClick={() => navigate({ to: '/admin/compliance/incorporation/master-data' })}>Go to Step 0</Button>
        </div>
      )
    }
    const content = `DECLARATION FOR COMMENCEMENT OF BUSINESS\n(Form INC-20A)\n\nI, ${masterData.stakeholders[0]?.full_name}, Director of ${masterData.company.proposed_name}, hereby declare that every subscriber to the memorandum has paid the value of the shares agreed to be taken by him...\n\nThe bank statement showing such payment is attached herewith.\n\nSignature: ________________`
    pdfService.generateStatutoryPDF('INC-20A Declaration', content, masterData.company.proposed_name)
  }

  const handleComplete = async () => {
    setIsProcessing(true)
    try {
      await incorporationService.saveCommencement({ status: 'filed' })
      workflow.completeStep(12)
      toast.success('Congratulations! Your company is now fully compliant and ready for business.')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Failed to finalize incorporation.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!masterData || !masterData.company) {
    return (
      <div className='p-20 text-center space-y-4'>
        <Rocket className='h-12 w-12 text-indigo-400 mx-auto' />
        <h2 className='text-xl font-bold'>Master Data Missing</h2>
        <p className='text-sm text-muted-foreground'>Company details are required to proceed with the Commencement of Business filing.</p>
        <Button onClick={() => navigate({ to: '/admin/compliance/incorporation/master-data' })}>Complete Step 0</Button>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-indigo-600/10 rounded-2xl'>
            <Rocket className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 12: Commencement of Business (INC-20A)</h1>
            <p className='text-sm text-muted-foreground'>Final statutory filing to officially start business operations.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-indigo-100 bg-indigo-50/30'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Banknote className='h-4 w-4 text-indigo-600' />
                Subscription Money Proof
              </CardTitle>
              <CardDescription>
                {bankData ? `Verify payment receipt in ${bankData.bank_name} (A/c: ...${bankData.account_number?.slice(-4)})` : 'Upload the bank statement showing receipt of subscription money.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={12} 
                    docTitle='Bank Statement (Subscription Proof)' 
                    onVerified={() => setIsBankStatementVerified(true)} 
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-indigo-600' />
                    Form INC-20A Declaration
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='flex items-center justify-between p-4 bg-slate-50 border rounded-xl'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-white rounded-lg shadow-sm'>
                            <FileText className='h-5 w-5 text-indigo-600' />
                        </div>
                        <div>
                            <p className='text-sm font-medium'>INC-20A Statutory Draft</p>
                            <p className='text-[10px] text-slate-400'>Pre-filled based on Master Data</p>
                        </div>
                    </div>
                    <Button variant='outline' size='sm' className='gap-2' onClick={handleDownloadDraft}>
                        <Download className='h-3 w-3' /> Download Draft
                    </Button>
                </div>

                <UploadGate 
                    stepId={13} // Virtual ID for declaration
                    docTitle='Signed INC-20A Declaration' 
                    onVerified={() => setIsVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                disabled={!isVerified || !isBankStatementVerified || isProcessing}
                onClick={handleComplete}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Complete Final Filing (INC-20A)'}
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-indigo-600/10 bg-indigo-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-indigo-800'>
                <ShieldCheck className='h-4 w-4' />
                Compliance Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-indigo-900/80 leading-relaxed'>
              <p>
                Section 10A of the Companies Act requires this filing within 180 days. 
                <br /><br />
                <b>Warning:</b> Business operations cannot legally start and you cannot borrow money until this form is approved.
              </p>
              <div className='pt-2 flex items-center gap-2 font-bold text-indigo-700'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                <span>Everything is ready for liftoff!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
