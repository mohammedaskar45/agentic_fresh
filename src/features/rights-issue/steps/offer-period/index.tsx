import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Clock, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'

export default function RightsIssueOfferPeriod() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [daysElapsed, setDaysElapsed] = useState(0)
  const totalDays = 15 // Mock total offer period

  useEffect(() => {
    // Simulate time passing
    const timer = setInterval(() => {
      setDaysElapsed(prev => (prev < totalDays ? prev + 1 : totalDays))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCloseOffer = async () => {
    try {
        await rightsIssueService.saveStep(5)
        riStore.completeStep(5)
        toast.success('Offer closed! Proceeding to Allotment.')
        navigate({ to: '/admin/compliance/rights-issue/allotment' })
    } catch (error) {
        toast.error('Failed to close offer.')
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/rights-issue/pre-offer' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-green-600/10 rounded-2xl'>
            <Clock className='h-8 w-8 text-green-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 4: Offer Period Tracking</h1>
            <p className='text-sm text-muted-foreground'>Monitoring the active subscription window for shareholders.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-xl bg-slate-900 text-white'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-green-400' />
                Subscription Window Progress
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex justify-between text-xs'>
                <span>Offer Opened: Day 1</span>
                <span>Offer Closure: Day {totalDays}</span>
              </div>
              <Progress value={(daysElapsed / totalDays) * 100} className='h-4 bg-slate-700' />
              <p className='text-center text-sm font-medium'>
                {daysElapsed === totalDays ? 'Offer Window has Closed!' : `${totalDays - daysElapsed} Days Remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                    <Users className='h-4 w-4 text-green-600' />
                    Shareholder Applications
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='p-4 bg-slate-50 rounded-xl border border-dashed text-center text-slate-400 text-sm'>
                    Monitoring bank records for ASBA/Cheque receipts...
                </div>
                <div className='flex items-center justify-between p-3 border rounded-lg bg-white'>
                    <div className='flex items-center gap-3'>
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        <span className='text-sm font-medium'>Applications Received: 85%</span>
                    </div>
                    <span className='text-xs text-slate-400'>Pro-rata logic applied</span>
                </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/rights-issue/pre-offer' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-12 bg-green-600 hover:bg-green-700 text-white'
                disabled={daysElapsed < totalDays}
                onClick={handleCloseOffer}
            >
              Close Offer & Start Allotment <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-green-600/10 bg-green-600/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-green-800'>
                <ShieldCheck className='h-4 w-4' />
                Statutory Window
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs text-green-900/80 leading-relaxed'>
              <p>
                <b>Min Period:</b> 15 Days.
                <br />
                <b>Max Period:</b> 30 Days.
                <br /><br />
                The offer must remain open for at least 15 days from the date of dispatch.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
