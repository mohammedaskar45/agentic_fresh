import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  Bot, 
  FileText, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkflowStepper } from '../components/workflow-stepper'
import { ActivityTimeline } from '../components/activity-timeline'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'

const ALL_STEP_TITLES = [
  { id: 0, title: 'Master Data Profiling', description: 'Complete the consolidated company, stakeholder and professional profile.' },
  { id: 1, title: 'Digital Signature (DSC)', description: 'Acquire Digital Signature Certificates for all proposed directors.' },
  { id: 2, title: 'Director Identification (DIN)', description: 'Obtain DIN for the proposed directors of the company.' },
  { id: 3, title: 'Name Approval (RUN)', description: 'Reservation of Unique Name through the MCA portal.' },
  { id: 4, title: 'Document Drafting', description: 'AI-assisted drafting of MOA, AOA, and other declarations.' },
  { id: 5, title: 'ROC Filing (SPICe+)', description: 'Filing of application for incorporation of the company.' },
  { id: 6, title: 'PAN, TAN & GST Allotment', description: 'Tracking automatic allotment of PAN, TAN, and GSTIN by authorities.' },
  { id: 7, title: 'First Board Meeting', description: 'Conducting the mandatory first board meeting within 30 days of COI.' },
  { id: 8, title: 'First Auditor Appointment', description: 'Appointing statutory auditors within 30 days of registration.' },
  { id: 9, title: 'Commencement of Business', description: 'Filing the declaration of business commencement (INC-20A) within 180 days.' },
]

export default function IncorporationDashboard() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [stats, setStats] = useState({
    daysElapsed: 1,
    pendingTasks: 10,
    vaultFiles: 0,
    progress: 0,
    deadlines: [] as any[]
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await incorporationService.getStats()
        setStats(data)
        
        // Sync Workflow Store with Backend (Force Clean Sync)
        const record = await incorporationService.getStatus()
        const logs = await incorporationService.getLogs()

        if (record) {
            const currentId = record.current_step_id || 0
            
            // Force recalculate statuses based on currentId and logs
            const syncedSteps = Array.from({ length: 10 }, (_, i) => {
                const stepLogs = logs.filter((l: any) => l.step_id === i)
                const isUploaded = stepLogs.some((l: any) => l.action.includes('Document Uploaded'))
                const isVerified = stepLogs.some((l: any) => l.action.includes('Document Verified'))
                
                let docStatus: any = 'NOT STARTED'
                if (isVerified) docStatus = 'VERIFIED'
                else if (isUploaded) docStatus = 'UPLOADED'
                else if (i === 4) docStatus = 'DRAFT READY' // Step 4 always has drafts ready
                
                return {
                    id: i,
                    status: (i < currentId) ? 'completed' : (i === currentId ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
                    documentStatus: docStatus
                }
            })
            
            workflow.setSteps(syncedSteps, currentId)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }
    fetchStats()
  }, []) // Sync on initial load

  const handleViewAnalysis = async () => {
    setIsAnalyzing(true)
    setIsAnalysisOpen(true)
    try {
      const response = await axiosInstance.get('/v1/incorporation/analysis')
      setAnalysisReport(response.data)
    } catch (error) {
      toast.error('Failed to fetch analysis report')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const currentStep = ALL_STEP_TITLES.find(s => s.id === workflow.currentStepId) || ALL_STEP_TITLES[0]
  const progress = stats.progress

  const stepsWithData = workflow.steps.slice(0, 10).map(step => ({
    ...step,
    title: ALL_STEP_TITLES.find(s => s.id === step.id)?.title || '',
    description: ALL_STEP_TITLES.find(s => s.id === step.id)?.description || '',
  }))

  const handleStepClick = (stepId: number) => {
    // 1. Validation: Check if all previous steps are completed in terms of ID
    const previousSteps = workflow.steps.filter(s => s.id < stepId);
    const allPreviousCompleted = previousSteps.every(s => s.status === 'completed');

    if (!allPreviousCompleted) {
        const firstIncomplete = previousSteps.find(s => s.status !== 'completed');
        toast.error(`Step ${firstIncomplete?.id || stepId - 1} must be completed first!`);
        return;
    }

    // 2. Section 11.2 Upload Gate: Check if current step requires verification before unlocking next
    // For example, to enter Step 5, Step 4 documents must be VERIFIED
    if (stepId > 4) {
      const draftingStep = workflow.steps.find(s => s.id === 4)
      if (draftingStep && draftingStep.documentStatus !== 'VERIFIED') {
        toast.error("Upload Gate: Please upload and verify Step 4 documents (MoA/AoA) to proceed!");
        navigate({ to: '/admin/compliance/incorporation/moa-aoa' })
        return
      }
    }

    // 3. Section 11.2 COI Gate: To enter Step 7, COI (Step 6) must be VERIFIED
    if (stepId >= 7) {
      const coiStep = workflow.steps.find(s => s.id === 6)
      if (coiStep && coiStep.documentStatus !== 'VERIFIED') {
        toast.error("Upload Gate: COI and PAN/TAN must be uploaded and verified first!");
        navigate({ to: '/admin/compliance/incorporation/pan-tan' })
        return
      }
    }

    navigateToStep(stepId);
  };

  const navigateToStep = (id: number) => {
    const routeMap: Record<number, string> = {
      0: '/admin/compliance/incorporation/master-data',
      1: '/admin/compliance/incorporation/dsc',
      2: '/admin/compliance/incorporation/din',
      3: '/admin/compliance/incorporation/run',
      4: '/admin/compliance/incorporation/moa-aoa',
      5: '/admin/compliance/incorporation/spice',
      6: '/admin/compliance/incorporation/pan-tan',
      7: '/admin/compliance/incorporation/board-meeting',
      8: '/admin/compliance/incorporation/auditor',
      9: '/admin/compliance/incorporation/commencement',
    }
    navigate({ to: routeMap[id] || '#' })
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-700'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            Agentic Incorporation
          </h1>
          <p className='text-muted-foreground mt-1'>
            Manage and track your company formation journey with AI orchestration.
          </p>
        </div>
        <div className='flex items-center space-x-2 bg-primary/5 p-2 rounded-xl border border-primary/10'>
          <Bot className='h-5 w-5 text-primary animate-bounce' />
          <span className='text-sm font-medium'>
            {progress === 100 ? 'Incorporation Completed!' : `AI Agent: Monitoring Step ${workflow.currentStepId}`}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Critical Priority Countdown (Section 12.1 Requirement) */}
        {stats.deadlines && stats.deadlines.find(d => d.task === 'File INC-20A (Commencement)') && (
          <div className='lg:col-span-12'>
            <Card className='border-none shadow-2xl bg-primary text-primary-foreground overflow-hidden relative group'>
              <div className='absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000'>
                <Clock className='h-40 w-40' />
              </div>
              <CardContent className='p-8 relative'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Badge className='bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1 animate-pulse'>CRITICAL PRIORITY</Badge>
                      <span className='text-[10px] font-bold uppercase tracking-widest opacity-80'>Companies Act Section 10A</span>
                    </div>
                    <h2 className='text-3xl font-black tracking-tight'>INC-20A Commencement Clock</h2>
                    <p className='text-primary-foreground/90 font-medium max-w-xl'>
                      Under Section 10A, your company must file the Declaration of Commencement of Business within 180 days. 
                      Failure to file prevents legal business operations and borrowing powers.
                    </p>
                  </div>
                  <div className='flex items-center gap-8'>
                    <div className='text-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 min-w-[160px]'>
                      <p className='text-5xl font-black tabular-nums'>
                        {Math.max(0, stats.deadlines.find(d => d.task === 'File INC-20A (Commencement)')?.remaining_days || 0)}
                      </p>
                      <p className='text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80'>
                        {Number(stats.deadlines.find(d => d.task === 'File INC-20A (Commencement)')?.remaining_days) <= 0 ? 'Days Overdue!' : 'Days Left'}
                      </p>
                    </div>
                    <Button 
                      className='bg-background text-primary hover:bg-muted font-bold h-16 px-8 rounded-2xl shadow-xl border-none transition-all hover:scale-105'
                      onClick={() => navigate({ to: '/admin/compliance/incorporation/commencement' })}
                    >
                      Start Filing Now <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Left Column: Progress & Details */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Progress Overview Card */}
          <Card className='border-none shadow-xl bg-gradient-to-br from-card to-muted/30 overflow-hidden relative'>
            <div className='absolute top-0 right-0 p-8 opacity-5'>
              <ShieldCheck className='h-32 w-32' />
            </div>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Incorporation Roadmap</CardTitle>
                <span className='text-2xl font-bold text-primary'>{progress}%</span>
              </div>
              <CardDescription>
                {progress === 100 ? 'Journey Completed Successfully!' : `Step ${workflow.currentStepId + 1} of 10: ${currentStep?.title}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className='h-3 mb-6' />
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='bg-background/50 p-4 rounded-xl border border-border/50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Clock className='h-4 w-4 text-blue-500' />
                    <span className='text-xs font-semibold uppercase'>Time Elapsed</span>
                  </div>
                  <p className='text-lg font-bold'>{stats.daysElapsed} Days</p>
                </div>
                <div className='bg-background/50 p-4 rounded-xl border border-border/50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <AlertCircle className='h-4 w-4 text-orange-500' />
                    <span className='text-xs font-semibold uppercase'>Pending Tasks</span>
                  </div>
                  <p className='text-lg font-bold'>{stats.pendingTasks} Actions</p>
                </div>
                <div className='bg-background/50 p-4 rounded-xl border border-border/50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <FileText className='h-4 w-4 text-green-500' />
                    <span className='text-xs font-semibold uppercase'>Vault Files</span>
                  </div>
                  <p className='text-lg font-bold'>{stats.vaultFiles} Docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Deadlines Section (Governance Logic) */}
          {stats.deadlines && stats.deadlines.length > 0 && (
            <Card className='border-none shadow-lg bg-white overflow-hidden'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='text-md flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4 text-primary' />
                        Statutory Compliance Tracker
                        </CardTitle>
                        <CardDescription>Section 12: Auto-calculated deadlines with dynamic penalty assessment</CardDescription>
                    </div>
                    <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[9px] px-3'>Engine v2.1 Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4'>
                  {stats.deadlines.map((d: any, idx: number) => (
                    <div key={idx} className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[1.5rem] border transition-all hover:shadow-lg hover:scale-[1.01] ${
                      d.status === 'red' ? 'bg-red-50/50 border-red-200' : 
                      d.status === 'amber' ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className='flex items-center gap-5 flex-1'>
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          d.status === 'red' ? 'bg-red-500 text-white' : 
                          d.status === 'amber' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          <Clock className='h-6 w-6' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <p className='text-md font-extrabold text-slate-800'>{d.task}</p>
                            <Badge variant='outline' className='text-[8px] font-bold border-slate-200'>{d.section}</Badge>
                          </div>
                          <p className='text-xs text-muted-foreground font-medium'>
                            Deadline: <span className='text-slate-700'>{new Date(d.deadline).toLocaleDateString()}</span> ({d.days_limit} days from COI)
                          </p>
                          {/* Penalty Alert - Section 12.1 */}
                          <div className='flex items-center gap-1.5 mt-2'>
                            <AlertCircle className={`h-3 w-3 ${d.status === 'red' ? 'text-red-500' : 'text-slate-400'}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-tight ${d.status === 'red' ? 'text-red-600' : 'text-slate-500'}`}>
                              Penalty: {d.penalty || 'Standard MCA Fees'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='mt-4 md:mt-0 flex items-center gap-6'>
                        <div className='text-right'>
                          <p className={`text-2xl font-black tracking-tighter ${
                            d.status === 'red' ? 'text-red-600' : 
                            d.status === 'amber' ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {d.remaining_days <= 0 ? 'OVERDUE' : `${d.remaining_days} Days`}
                          </p>
                          <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Remaining Time</p>
                        </div>
                        <Button variant='outline' size='sm' className='rounded-xl font-bold bg-white'>Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Step Details */}
          <Card className='border-primary/20 shadow-lg'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <div className='h-2 w-2 rounded-full bg-primary animate-pulse' />
                {progress === 100 ? 'All Steps Finalized' : `Active Step: ${currentStep.title}`}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                {progress === 100 ? 'Your company incorporation process is fully completed and all statutory filings are done.' : currentStep.description}
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button 
                  size='sm' 
                  className='rounded-full'
                  onClick={() => handleStepClick(workflow.currentStepId)}
                >
                  {progress === 100 ? 'View Summary' : 'Open Submission Form'} <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
                <Button 
                  size='sm' 
                  variant='outline' 
                  className='rounded-full'
                  onClick={handleViewAnalysis}
                >
                  View AI Analysis Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Dialog */}
          <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-primary' />
                  AI Compliance Analysis Report
                </DialogTitle>
                <DialogDescription>
                  Automated regulatory risk assessment based on MCA 2026 guidelines.
                </DialogDescription>
              </DialogHeader>
              
              <div className='py-4 space-y-4'>
                {isAnalyzing ? (
                  <div className='flex flex-col items-center py-10 space-y-4'>
                    <Loader2 className='h-10 w-10 text-primary animate-spin' />
                    <p className='text-sm text-muted-foreground animate-pulse'>Analyzing corporate structure...</p>
                  </div>
                ) : analysisReport.length === 0 ? (
                  <div className='text-center py-10 bg-green-50 rounded-2xl border border-green-100'>
                    <ShieldCheck className='h-12 w-12 text-green-500 mx-auto mb-3' />
                    <p className='font-bold text-green-800'>No Critical Risks Detected</p>
                    <p className='text-sm text-green-600'>Your stakeholder profile complies with basic Indian residency rules.</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {analysisReport.map((item, i) => (
                      <div key={i} className='p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-1'>
                        <div className='flex items-center gap-2 text-orange-800 font-bold'>
                          <AlertCircle className='h-4 w-4' />
                          <span>{item.stakeholder}</span>
                        </div>
                        <p className='text-sm text-orange-700'>{item.message}</p>
                        <div className='pt-2'>
                          <span className='px-2 py-0.5 bg-orange-200 text-orange-900 rounded text-[10px] font-bold'>
                            {item.requirement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className='flex justify-end pt-4 border-t'>
                <Button variant='ghost' onClick={() => setIsAnalysisOpen(false)}>
                  Close Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column: Steps Timeline */}
        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-card/50 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Workflow Timeline</CardTitle>
              <CardDescription>10 Steps to Incorporation</CardDescription>
            </CardHeader>
            <CardContent className='max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
              <WorkflowStepper 
                steps={stepsWithData} 
                currentStepId={workflow.currentStepId} 
                onStepClick={handleStepClick}
              />
            </CardContent>
          </Card>
          
          <ActivityTimeline />
        </div>
      </div>
    </div>
  )
}
