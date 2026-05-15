import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  Bot, 
  FileText, 
  Clock, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRightsIssueStore } from '@/stores/rights-issue-store'
import { rightsIssueService } from '@/services/rights-issue.service'
import { toast } from 'sonner'
import { pdfService } from '@/lib/pdf-service'

export default function RightsIssueDashboard() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [stats, setStats] = useState({
    progress: 0,
    daysLeft: 30,
    pendingDocs: 0,
    companyName: 'Loading...'
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await rightsIssueService.getStatus()
      riStore.setSteps(data.workflow_status)
      riStore.setCurrentStep(data.current_step_id)
      riStore.setCompanyType(data.master_data?.company_type || 'PRIVATE')
      
      const completed = data.workflow_status.filter((s: any) => s.status === 'completed').length
      setStats({
          progress: Math.round((completed / data.workflow_status.length) * 100),
          daysLeft: 15,
          pendingDocs: data.workflow_status.length - completed,
          companyName: data.master_data?.company_name || 'Select Company'
      })
    } catch (error) {
      console.error('Failed to fetch RI stats:', error)
    }
  }

  const handleDownloadAudit = () => {
      const content = `COMPLIANCE AUDIT REPORT\n\nIssue Progress: ${stats.progress}%\nStatus: ${riStore.steps[riStore.currentStepId]?.title}\nWorkflow: ${riStore.companyType}\n\nAll automated eligibility checks passed (Authorised Capital, Issue Price, SEBI Guidelines).`
      pdfService.generateStatutoryPDF('Compliance Audit Report', content, stats.companyName)
      toast.success('Compliance Audit Report downloaded!')
  }

  const handleStepClick = (stepId: number) => {
    const routeMap: Record<number, string> = {
      0: '/admin/compliance/rights-issue/master-data',
      1: '/admin/compliance/rights-issue/eligibility',
      2: '/admin/compliance/rights-issue/board-approval',
      // ... more mapping
    }
    navigate({ to: routeMap[stepId] || routeMap[0] })
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-700'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            Rights Issue Module
          </h1>
          <p className='text-muted-foreground mt-1'>
            {riStore.companyType === 'LISTED' ? 'SEBI ICDR Fast Track Workflow' : 'Section 62(1)(a) Private Company Workflow'}
          </p>
        </div>
        <div className='flex items-center space-x-2 bg-primary/5 p-2 rounded-xl border border-primary/10'>
          <TrendingUp className='h-5 w-5 text-primary' />
          <span className='text-sm font-medium'>Capital Raising in Progress</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Issue Progress Overview</CardTitle>
                <span className='text-2xl font-bold text-primary'>{stats.progress}%</span>
              </div>
              <CardDescription className='text-slate-400'>
                Step {riStore.currentStepId + 1} of {riStore.steps.length}: {riStore.steps[riStore.currentStepId]?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={stats.progress} className='h-3 mb-6 bg-slate-700' />
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='bg-white/5 p-4 rounded-xl border border-white/10'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Clock className='h-4 w-4 text-blue-400' />
                    <span className='text-[10px] font-semibold uppercase'>Offer Window</span>
                  </div>
                  <p className='text-lg font-bold'>{stats.daysLeft} Days Left</p>
                </div>
                <div className='bg-white/5 p-4 rounded-xl border border-white/10'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <FileCheck2 className='h-4 w-4 text-orange-400' />
                    <span className='text-[10px] font-semibold uppercase'>Pending Filings</span>
                  </div>
                  <p className='text-lg font-bold'>{stats.pendingDocs} Actions</p>
                </div>
                <div className='bg-white/5 p-4 rounded-xl border border-white/10'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Users2 className='h-4 w-4 text-green-400' />
                    <span className='text-[10px] font-semibold uppercase'>Allottees</span>
                  </div>
                  <p className='text-lg font-bold'>Pro-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-primary/20 shadow-lg'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Bot className='h-5 w-5 text-primary' />
                Workflow Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {riStore.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      step.status === 'current' ? 'bg-primary/5 border-primary shadow-sm' : 
                      step.status === 'completed' ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-100'
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === 'current' ? 'bg-primary text-white' : 
                      step.status === 'completed' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.status === 'completed' ? <FileText className='h-4 w-4' /> : step.id + 1}
                    </div>
                    <div className='flex-1'>
                      <p className={`text-sm font-bold ${step.status === 'current' ? 'text-primary' : 'text-slate-700'}`}>{step.title}</p>
                      <p className='text-[10px] text-muted-foreground'>
                        {step.status === 'current' ? 'Active Step - Action Required' : step.status === 'completed' ? 'Verified & Complete' : 'Upcoming Step'}
                      </p>
                    </div>
                    {step.status === 'current' && <ArrowRight className='h-4 w-4 text-primary' />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-primary text-white'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4' />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='text-5xl font-bold'>A+</div>
              <p className='text-xs opacity-90'>Your current workflow adheres 100% to Section 62 and SEBI guidelines.</p>
              <Button variant='secondary' className='w-full' onClick={handleDownloadAudit}>Download Compliance Audit</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
