import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  ArrowLeft, 
  ChevronLeft,
  Briefcase,
  HelpCircle,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'

export default function RUNStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{available: boolean, message: string} | null>(null)
  
  const [formData, setFormData] = useState({
    proposed_name: '',
    nic_code: '62011', // Default: Software development
    significance: '',
    status: 'pending'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getRun()
        if (response && response.run_data) {
          setFormData(response.run_data)
        }
      } catch (error) {
        console.error('Failed to fetch RUN data:', error)
      }
    }
    fetchData()
  }, [])

  const handleCheckAvailability = async () => {
    if (!formData.proposed_name) {
      toast.error('Please enter a name to check.')
      return
    }
    setIsChecking(true)
    try {
      const result = await incorporationService.checkNameAvailability(formData.proposed_name)
      setCheckResult(result)
      if (result.available) {
        toast.success('Name is available!')
      } else {
        toast.error('Name is already taken or too similar.')
      }
    } catch (error) {
      toast.error('Search failed.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.proposed_name || !formData.significance) {
      toast.error('Please provide name and its significance.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveRun({...formData, status: 'approved'})
      workflow.completeStep(3)
      toast.success('Step 3: Name Approval (RUN) Reserved Successfully!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-indigo-500/10 rounded-2xl'>
            <Search className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 3: Name Approval (RUN)</h1>
            <p className='text-sm text-muted-foreground'>Reservation of Unique Name with NIC classification.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <ShieldCheck className='h-5 w-5 text-indigo-600' />
                Name Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                   <div className='space-y-2'>
                        <Label>Proposed Company Name</Label>
                        <div className='flex gap-2'>
                            <Input 
                                placeholder='Ex: ALPHA TECH'
                                value={formData.proposed_name}
                                onChange={(e) => setFormData({...formData, proposed_name: e.target.value.toUpperCase()})}
                                className='font-bold'
                            />
                            <Button onClick={handleCheckAvailability} disabled={isChecking}>
                                {isChecking ? '...' : <Search className='h-4 w-4' />}
                            </Button>
                        </div>
                   </div>
                   <div className='space-y-2'>
                        <Label>Business Category (NIC Code)</Label>
                        <Select value={formData.nic_code} onValueChange={(val) => setFormData({...formData, nic_code: val})}>
                            <SelectTrigger>
                                <Briefcase className='h-4 w-4 mr-2 text-slate-400' />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='62011'>62011 - Software Development</SelectItem>
                                <SelectItem value='62012'>62012 - IT Enabled Services</SelectItem>
                                <SelectItem value='62099'>62099 - Other IT Services</SelectItem>
                                <SelectItem value='70200'>70200 - Management Consultancy</SelectItem>
                            </SelectContent>
                        </Select>
                   </div>
                </div>

                <div className='space-y-2'>
                   <Label className='flex items-center gap-2'>
                        Significance of Name
                        <HelpCircle className='h-3 w-3 text-slate-400' />
                   </Label>
                   <textarea 
                        value={formData.significance}
                        onChange={(e) => setFormData({...formData, significance: e.target.value})}
                        className='w-full min-h-[100px] p-4 text-sm rounded-md border border-input bg-slate-50/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        placeholder='Explain why you chose this name (Ex: Alpha represents market leadership, Tech represents our core focus...)'
                   />
                </div>
              </div>

              {checkResult && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${checkResult.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {checkResult.available ? <CheckCircle2 className='h-5 w-5' /> : <AlertCircle className='h-5 w-5' />}
                  <p className='text-sm font-medium'>{checkResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3 pt-4'>
            <Button variant='outline' className='gap-2 h-11' onClick={() => navigate({ to: '/admin/compliance/incorporation/din' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 rounded-xl h-11'
                onClick={handleComplete} 
                disabled={isProcessing || (checkResult && !checkResult.available)}
            >
              {isProcessing ? 'Reserving...' : 'Submit Name Approval'}
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4'>
           <Card className='bg-indigo-600/5 border-indigo-600/10 shadow-none'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm flex items-center gap-2 text-indigo-800'>
                  <Bot className='h-4 w-4' />
                  AI Name Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-[11px] leading-relaxed text-indigo-900/80 italic'>
                 "I am analyzing your significance statement. MCA usually rejects names that are too generic. Make sure the significance explains the link between the name and the NIC code (62011)."
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
