import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  Bot, 
  FileText, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WorkflowStepper } from '../components/workflow-stepper'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { toast } from 'sonner'

const ALL_STEP_TITLES = [
  { id: 1, title: 'Digital Signature (DSC)', description: 'Acquire Digital Signature Certificates for all proposed directors.' },
  { id: 2, title: 'Director Identification (DIN)', description: 'Obtain DIN for the proposed directors of the company.' },
  { id: 3, title: 'Name Approval (RUN)', description: 'Reservation of Unique Name through the MCA portal.' },
  { id: 4, title: 'Document Drafting', description: 'AI-assisted drafting of MOA, AOA, and other declarations.' },
  { id: 5, title: 'ROC Filing (SPICe+)', description: 'Filing of application for incorporation of the company.' },
  { id: 6, title: 'PAN & TAN Allotment', description: 'Automatic generation of PAN and TAN by the Income Tax Dept.' },
  { id: 7, title: 'Certificate of Incorporation', description: 'Receiving the COI from the Registrar of Companies.' },
  { id: 8, title: 'Bank Account Opening', description: 'Corporate bank account setup based on COI.' },
  { id: 9, title: 'GST Registration', description: 'Applying for Goods and Services Tax identification.' },
  { id: 10, title: 'PF & ESI Registration', description: 'Mandatory labor law registrations for the new entity.' },
  { id: 11, title: 'Commencement of Business', description: 'Filing the declaration of business commencement.' },
]

export default function IncorporationDashboard() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [stats, setStats] = useState({
    daysElapsed: 1,
    pendingTasks: 11,
    vaultFiles: 0,
    progress: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await incorporationService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }
    fetchStats()
  }, [workflow.currentStepId]) // Refresh when step changes
  
  const currentStep = ALL_STEP_TITLES.find(s => s.id === workflow.currentStepId) || ALL_STEP_TITLES[0]
  const progress = stats.progress

  const stepsWithData = workflow.steps.map(step => ({
    ...step,
    title: ALL_STEP_TITLES.find(s => s.id === step.id)?.title || '',
    description: ALL_STEP_TITLES.find(s => s.id === step.id)?.description || '',
  }))

  const handleStepClick = (stepId: number) => {
    // Validation: Check if all previous steps are completed
    const previousSteps = workflow.steps.filter(s => s.id < stepId);
    const allPreviousCompleted = previousSteps.every(s => s.status === 'completed');

    if (!allPreviousCompleted) {
        const firstIncomplete = previousSteps.find(s => s.status !== 'completed');
        toast.error(`Please complete Step ${firstIncomplete?.id || stepId - 1} first!`);
        
        // Redirect to the first incomplete step
        const incompleteId = firstIncomplete?.id || 1;
        navigateToStep(incompleteId);
        return;
    }

    navigateToStep(stepId);
  };

  const navigateToStep = (id: number) => {
    const routeMap: Record<number, string> = {
      1: '/admin/compliance/incorporation/dsc',
      2: '/admin/compliance/incorporation/din',
      3: '/admin/compliance/incorporation/run',
      4: '/admin/compliance/incorporation/moa-aoa',
      5: '/admin/compliance/incorporation/spice',
      6: '/admin/compliance/incorporation/pan-tan',
      7: '/admin/compliance/incorporation/coi',
      8: '/admin/compliance/incorporation/bank',
      9: '/admin/compliance/incorporation/gst',
      10: '/admin/compliance/incorporation/labor',
      11: '/admin/compliance/incorporation/commencement',
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

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
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
                {progress === 100 ? 'Journey Completed Successfully!' : `Step ${workflow.currentStepId} of 11: ${currentStep.title}`}
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
                  onClick={() => handleStepClick(workflow.currentStepId > 11 ? 1 : workflow.currentStepId)}
                >
                  {progress === 100 ? 'View Summary' : 'Open Submission Form'} <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
                <Button size='sm' variant='outline' className='rounded-full'>
                  View AI Analysis Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Steps Timeline */}
        <div className='lg:col-span-4'>
          <Card className='h-full border-none shadow-xl bg-card/50 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Workflow Timeline</CardTitle>
              <CardDescription>11 Steps to Incorporation</CardDescription>
            </CardHeader>
            <CardContent className='max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
              <WorkflowStepper 
                steps={stepsWithData} 
                currentStepId={workflow.currentStepId} 
                onStepClick={handleStepClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
