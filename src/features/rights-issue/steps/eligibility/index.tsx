import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Bot,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'

export default function RightsIssueEligibility() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isVerifying, setIsVerifying] = useState(true)
  const [checks, setChecks] = useState<any[]>([])

  useEffect(() => {
    runEligibility()
  }, [])

  const runEligibility = async () => {
    setIsVerifying(true)
    try {
      const results = await rightsIssueService.runEligibility()
      setChecks(results)
    } catch (error) {
      toast.error('Failed to run eligibility check.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleProceed = async () => {
    try {
        await rightsIssueService.saveStep(1)
        riStore.completeStep(1)
        toast.success('Eligibility Verified! Proceeding to Board Approval.')
        navigate({ to: '/admin/compliance/rights-issue/board-approval' })
    } catch (error) {
        toast.error('Failed to proceed.')
    }
  }

  const allPassed = checks.every(c => c.status !== 'red')

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/master-data' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-indigo-600/10 rounded-2xl'>
            <ShieldCheck className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 1: Automated Eligibility Engine</h1>
            <p className='text-sm text-muted-foreground'>AI-driven validation of Companies Act and SEBI regulations.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          {isVerifying ? (
            <Card className='border-none shadow-none bg-slate-50'>
              <CardContent className='flex flex-col items-center justify-center p-20 space-y-4'>
                <Loader2 className='h-12 w-12 text-indigo-600 animate-spin' />
                <p className='text-sm font-medium text-slate-600'>AI Compliance Engine is scanning your application...</p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {checks.map((check, idx) => (
                <Card key={idx} className={`border-l-4 ${
                  check.status === 'green' ? 'border-l-green-500' : 
                  check.status === 'red' ? 'border-l-red-500' : 'border-l-amber-500'
                }`}>
                  <CardContent className='p-4 flex items-start gap-4'>
                    <div className='mt-1'>
                      {check.status === 'green' ? <CheckCircle2 className='h-5 w-5 text-green-500' /> : 
                       check.status === 'red' ? <XCircle className='h-5 w-5 text-red-500' /> : 
                       <AlertTriangle className='h-5 w-5 text-amber-500' />}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h4 className='text-sm font-bold'>{check.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          check.status === 'green' ? 'bg-green-100 text-green-700' : 
                          check.status === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {check.status === 'green' ? 'Pass' : check.status === 'red' ? 'Fail' : 'Warning'}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>{check.message}</p>
                      {check.status !== 'green' && (
                        <div className='mt-2 p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-2'>
                          <Bot className='h-3 w-3 text-indigo-600' />
                          <p className='text-[10px] font-medium text-slate-700'><span className='text-indigo-600 font-bold'>Remedy:</span> {check.remedy}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className='flex justify-between items-center pt-6'>
                <Button variant='outline' onClick={runEligibility}>
                  Re-run Checks
                </Button>
                <Button 
                    className='px-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                    disabled={!allPassed}
                    onClick={handleProceed}
                >
                  Proceed to Board Approval <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Bot className='h-5 w-5' />
                Agentic Verification
              </CardTitle>
            </CardHeader>
            <CardContent className='text-xs opacity-90 leading-relaxed'>
              <p>
                Our AI agent has verified your data against Section 62 and SEBI ICDR Regulations. 
                <br /><br />
                <b>Critical Failure:</b> If any check is <span className='font-bold text-red-200'>RED</span>, you cannot generate statutory drafts as the issue would be legally invalid.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
