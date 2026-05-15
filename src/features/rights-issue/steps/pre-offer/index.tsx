import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
  Mail,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { UploadGate } from '@/features/incorporation/components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function RightsIssuePreOffer() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOfferVerified, setIsOfferVerified] = useState(false)
  const [isDispatchVerified, setIsDispatchVerified] = useState(false)
  const [drafts, setDrafts] = useState<any[]>([])
  const [masterData, setMasterData] = useState<any>(null)

  useEffect(() => {
      fetchDrafts()
      fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
      try {
          const status = await rightsIssueService.getStatus()
          setMasterData(status.master_data)
      } catch (error) {}
  }

  const fetchDrafts = async () => {
      try {
          const data = await rightsIssueService.generateDrafts(3) // Step 3: PAS-4
          setDrafts(data)
      } catch (error) {}
  }

  const handleDownloadDraft = (draft: any) => {
      const companyName = masterData?.company_name || 'The Company'
      pdfService.generateStatutoryPDF(draft.title, draft.content, companyName)
      toast.success(`${draft.title} downloaded!`)
  }

  const handleProceed = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveStep(3)
      riStore.completeStep(3)
      toast.success('Offer documents dispatched successfully!')
      navigate({ to: '/admin/compliance/rights-issue/offer-period' })
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
          <div className='p-3 bg-blue-600/10 rounded-2xl'>
            <Mail className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 3: Offer Letter & Dispatch</h1>
            <p className='text-sm text-muted-foreground'>Draft the Letter of Offer and manage shareholder dispatch.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <FileText className='h-4 w-4 text-blue-600' />
                Letter of Offer (Form PAS-4)
              </CardTitle>
              <CardDescription>Section 62(1)(a) requires a formal offer letter to be dispatched to all shareholders.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                {drafts.map((draft, idx) => (
                    <div key={idx} className='flex items-center justify-between p-4 bg-slate-50 border rounded-xl'>
                        <div className='flex items-center gap-3'>
                            <FileText className='h-5 w-5 text-blue-600' />
                            <div>
                                <p className='text-sm font-medium'>{draft.title}</p>
                                <p className='text-[10px] text-slate-400'>Pre-filled based on Ratio and Price</p>
                            </div>
                        </div>
                        <Button variant='outline' size='sm' className='gap-2' onClick={() => handleDownloadDraft(draft)}>
                            <Download className='h-3 w-3' /> Download Draft
                        </Button>
                    </div>
                ))}
                <UploadGate 
                    stepId={103} 
                    docTitle='Signed Letter of Offer' 
                    onVerified={() => setIsOfferVerified(true)} 
                />
            </CardContent>
          </Card>

          <Card className='border-blue-100 bg-blue-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2 text-blue-800'>
                    <Send className='h-4 w-4' />
                    Dispatch Verification
                </CardTitle>
                <CardDescription>Upload dispatch proofs (Speed Post receipts / Courier PODs) as required by MCA.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={104} 
                    docTitle='Dispatch Proofs' 
                    onVerified={() => setIsDispatchVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/board-approval' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-primary hover:bg-primary/90 text-white'
                disabled={!isOfferVerified || !isDispatchVerified || isProcessing}
                onClick={handleProceed}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Confirm Dispatch & Open Offer'} <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-blue-600/10 bg-blue-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-blue-800'>
                <CheckCircle2 className='h-4 w-4' />
                Dispatch Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-blue-900/80 leading-relaxed'>
              <p>
                <b>Dispatch Proof:</b> The offer letter must be dispatched at least 3 days before the opening of the issue.
                <br /><br />
                <b>Mode:</b> Registered Post, Speed Post, or electronic mode.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
