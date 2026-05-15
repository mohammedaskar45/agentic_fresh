import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileCheck2, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
  Building,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { UploadGate } from '@/features/incorporation/components/upload-gate'
import { pdfService } from '@/lib/pdf-service'

export default function RightsIssueAllotment() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAllotmentVerified, setIsAllotmentVerified] = useState(false)
  const [isPas3Verified, setIsPas3Verified] = useState(false)
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
      const data = await rightsIssueService.generateDrafts(5) // Step 5: Allotment
      setDrafts(data)
    } catch (error) {}
  }

  const handleDownloadDraft = (draft: any) => {
    const companyName = masterData?.company_name || 'The Company'
    pdfService.generateStatutoryPDF(draft.title, draft.content, companyName)
    toast.success(`${draft.title} downloaded!`)
  }

  const handleFinalize = async () => {
    setIsProcessing(true)
    try {
      await rightsIssueService.saveStep(6)
      riStore.completeStep(6)
      toast.success('Rights Issue completed successfully!')
      navigate({ to: '/admin/compliance/rights-issue' })
    } catch (error) {
      toast.error('Failed to finalize.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/offer-period' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-purple-600/10 rounded-2xl'>
            <FileCheck2 className='h-8 w-8 text-purple-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 5: Allotment & PAS-3 Filing</h1>
            <p className='text-sm text-muted-foreground'>Finalize share allotment and file the return with ROC.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Building className='h-4 w-4 text-purple-600' />
                Board Meeting (Allotment)
              </CardTitle>
              <CardDescription>Conduct the board meeting to formally allot shares to applicants.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                {drafts.map((draft, idx) => (
                    <div key={idx} className='flex items-center justify-between p-4 bg-slate-50 border rounded-xl'>
                        <div className='flex items-center gap-3'>
                            <FileCheck2 className='h-5 w-5 text-purple-600' />
                            <div>
                                <p className='text-sm font-medium'>{draft.title}</p>
                                <p className='text-[10px] text-slate-400'>Certified True Copy for ROC filing</p>
                            </div>
                        </div>
                        <Button variant='outline' size='sm' className='gap-2' onClick={() => handleDownloadDraft(draft)}>
                            <Download className='h-3 w-3' /> Download
                        </Button>
                    </div>
                ))}
                <UploadGate 
                    stepId={105} 
                    docTitle='Signed Allotment Resolution' 
                    onVerified={() => setIsAllotmentVerified(true)} 
                />
            </CardContent>
          </Card>

          <Card className='border-purple-100 bg-purple-50/30'>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2 text-purple-800'>
                    <ShieldCheck className='h-4 w-4' />
                    Return of Allotment (Form PAS-3)
                </CardTitle>
                <CardDescription>File Form PAS-3 with the ROC within 30 days of allotment.</CardDescription>
            </CardHeader>
            <CardContent>
                <UploadGate 
                    stepId={106} 
                    docTitle='PAS-3 Challan / SRN' 
                    onVerified={() => setIsPas3Verified(true)} 
                />
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/offer-period' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20'
                disabled={!isAllotmentVerified || !isPas3Verified || isProcessing}
                onClick={handleFinalize}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Finalize & Close Module'} <CheckCircle2 className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-purple-600/10 bg-purple-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-purple-800'>
                <ShieldCheck className='h-4 w-4' />
                ROC Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-purple-900/80 leading-relaxed'>
              <p>
                <b>Section 39(4):</b> Return of allotment must be filed in Form PAS-3.
                <br /><br />
                <b>Deadline:</b> 30 days from allotment.
                <br />
                <b>Penalty:</b> Rs. 1,000 per day for default.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
