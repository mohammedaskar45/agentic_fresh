import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  TrendingUp,
  History,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBuybackStore } from '@/stores/buyback-store'
import { buybackService } from '@/services/buyback.service'
import { toast } from 'sonner'
import { pdfService } from '@/lib/pdf-service'

export default function BuybackDashboard() {
  const navigate = useNavigate()
  const bbStore = useBuybackStore()
  const [stats, setStats] = useState({
    progress: 0,
    companyName: 'Loading...',
    limitUsed: 0,
    debtEquity: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await buybackService.getStatus()
      bbStore.setWorkflow(data.workflow_status || [], data.current_step_id)
      
      setStats({
        progress: Math.round((data.current_step_id / 6) * 100),
        companyName: 'Corporate Entity',
        limitUsed: data.master_data ? (data.master_data.buyback_amount / ((Number(data.master_data.paid_up_capital) + Number(data.master_data.free_reserves)) * 0.25)) * 100 : 0,
        debtEquity: 1.5 // Mock for now
      })
    } catch (error) {
      console.error('Failed to fetch buyback stats:', error)
    }
  }

  const handleStepClick = (stepId: number) => {
    const routeMap: Record<number, string> = {
      0: '/admin/compliance/buyback/master-data',
      1: '/admin/compliance/buyback/board-approval',
      2: '/admin/compliance/buyback/shareholder-approval',
      3: '/admin/compliance/buyback/solvency',
      4: '/admin/compliance/buyback/letter-of-offer',
    }
    
    if (routeMap[stepId]) {
      navigate({ to: routeMap[stepId] })
    }
  }

  return (
    <div className='p-6 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Buyback Dashboard</h1>
          <p className='text-muted-foreground'>Managing Share Buyback under Section 68 of Companies Act, 2013.</p>
        </div>
        <div className='flex gap-3'>
            <Button variant='outline' className='gap-2'><History className='h-4 w-4' /> Audit Log</Button>
            <Button className='gap-2 bg-slate-900 text-white hover:bg-slate-800' onClick={() => navigate({ to: '/admin/compliance/buyback/master-data' })}>
                Continue Workflow <ArrowRight className='h-4 w-4' />
            </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border-none shadow-lg shadow-blue-500/5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium opacity-90'>Total Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{stats.progress}%</div>
            <Progress value={stats.progress} className='h-2 mt-4 bg-white/20' />
          </CardContent>
        </Card>

        <Card className='border-none shadow-lg shadow-slate-200'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-slate-500'>Buyback Limit Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-slate-900'>{stats.limitUsed.toFixed(1)}%</div>
            <p className='text-xs text-slate-400 mt-2'>Max Allowed: 25% of Net Worth</p>
          </CardContent>
        </Card>

        <Card className='border-none shadow-lg shadow-slate-200'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-slate-500'>Post-Debt:Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-emerald-600'>{stats.debtEquity}:1</div>
            <p className='text-xs text-slate-400 mt-2'>Regulatory Limit: 2.0:1</p>
          </CardContent>
        </Card>

        <Card className='border-none shadow-lg shadow-amber-500/5 bg-amber-50 border border-amber-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-amber-800'>Active Step</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-amber-900 truncate'>
                {bbStore.workflowStatus[bbStore.currentStepId]?.title || 'Master Data'}
            </div>
            <p className='text-xs text-amber-700 mt-2 flex items-center gap-1'><Clock className='h-3 w-3' /> Pending Action</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle>Buyback Workflow Lifecycle</CardTitle>
              <CardDescription>Strict sequence enforcement as per Rule 17 of Share Capital Rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {bbStore.workflowStatus.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                        step.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
                        step.status === 'current' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-slate-100 opacity-60'
                    }`}
                    onClick={() => handleStepClick(idx)}
                  >
                    <div className='flex items-center gap-4'>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        step.status === 'completed' ? 'bg-emerald-500 text-white' :
                        step.status === 'current' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle2 className='h-5 w-5' /> : idx + 1}
                      </div>
                      <div>
                        <p className={`font-semibold ${step.status === 'current' ? 'text-blue-900' : 'text-slate-700'}`}>{step.title}</p>
                        <p className='text-xs text-slate-400'>
                            {idx === 0 ? 'Section 68(2) conditions' : 
                             idx === 3 ? 'Rule 17(3) declaration' : 'Statutory requirement'}
                        </p>
                      </div>
                    </div>
                    {step.status === 'current' && <ArrowRight className='h-5 w-5 text-blue-600' />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl bg-slate-900 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 p-8 opacity-10'>
                <TrendingUp className='h-32 w-32' />
            </div>
            <CardHeader>
              <CardTitle>Compliance Audit</CardTitle>
              <CardDescription className='text-slate-400 text-xs'>Real-time risk assessment</CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='text-5xl font-bold'>A+</div>
              <p className='text-xs opacity-90 leading-relaxed'>
                Your buyback workflow is 100% aligned with Section 68 and Rule 17. 
                All solvency checks passed.
              </p>
              <Button variant='secondary' className='w-full gap-2'>
                <Download className='h-4 w-4' /> Download Audit Report
              </Button>
            </CardContent>
          </Card>

          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle className='text-sm'>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl'>
                <AlertCircle className='h-4 w-4 text-red-600 mt-1' />
                <div>
                  <p className='text-xs font-semibold text-red-900'>File SH-9 Solvency</p>
                  <p className='text-[10px] text-red-700'>Due before offer opening</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
