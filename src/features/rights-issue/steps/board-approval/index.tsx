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
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { UploadGate } from '@/features/incorporation/components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function RightsIssueBoardApproval() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isResolutionVerified, setIsResolutionVerified] = useState(false)
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
      const data = await rightsIssueService.generateDrafts(2) // Step 2: Board Approval
      setDrafts(data)
    } catch (error) {
      toast.error('Failed to fetch statutory drafts.')
    }
  }

  const handleDownloadDraft = (draft: any) => {
      const companyName = masterData?.company_name || 'The Company'
      pdfService.generateStatutoryPDF(draft.title, draft.content, companyName)
      toast.success(`${draft.title} downloaded!`)
  }

  const handleProceed = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveStep(2)
      riStore.completeStep(2)
      toast.success('Board Approval completed!')
      const nextRoute = riStore.companyType === 'PRIVATE' ? 'pre-offer' : 'sebi-filing'
      navigate({ to: `/admin/compliance/rights-issue/${nextRoute}` })
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
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/eligibility' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-amber-600/10 rounded-2xl'>
            <FileText className='h-8 w-8 text-amber-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 2: Board Approval & Resolutions</h1>
            <p className='text-sm text-muted-foreground'>Draft and approve the statutory resolutions for the Rights Issue.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <FileText className='h-4 w-4 text-amber-600' />
                AI-Generated Statutory Drafts
              </CardTitle>
              <CardDescription>Review and download the drafts before obtaining board approval.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {drafts.map((draft, idx) => (
                <div key={idx} className='flex items-center justify-between p-4 bg-slate-50 border rounded-xl'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-white rounded-lg shadow-sm text-amber-600'>
                            <FileText className='h-5 w-5' />
                        </div>
                        <div>
                            <p className='text-sm font-medium'>{draft.title}</p>
                            <p className='text-[10px] text-slate-400'>Pre-filled based on Master Data</p>
                        </div>
                    </div>
                    <Button variant='outline' size='sm' className='gap-2' onClick={() => handleDownloadDraft(draft)}>
                        <Download className='h-3 w-3' /> Download Draft
                    </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className='border-amber-100 bg-amber-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-amber-600' />
                    Upload Execution Gate
                </CardTitle>
                <CardDescription>Upload the signed Board Resolution (Certified True Copy) to unlock the next phase.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={102} // Step 2: Board Approval resolution
                    docTitle='Signed Board Resolution' 
                    onVerified={() => setIsResolutionVerified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/eligibility' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20'
                disabled={!isResolutionVerified || isProcessing}
                onClick={handleProceed}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Approve & Continue'} <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-amber-600/10 bg-amber-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-amber-800'>
                <AlertCircle className='h-4 w-4' />
                Legal Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-amber-900/80 leading-relaxed'>
              <p>
                <b>Section 179:</b> The powers to issue shares must be exercised by the Board of Directors at a meeting.
                <br /><br />
                <b>Secretarial Standards:</b> Ensure the notice of meeting is issued at least 7 days in advance as per SS-1.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
