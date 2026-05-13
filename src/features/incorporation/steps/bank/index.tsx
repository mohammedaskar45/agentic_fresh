import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Building2, 
  CreditCard, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Bot,
  Building,
  Landmark,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function BankStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    account_type: 'Current Account'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getBank()
        if (response && response.bank_data) {
          setFormData(response.bank_data)
        }
      } catch (error) {
        console.error('Failed to fetch Bank data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSimulateBank = () => {
    setFormData({
      bank_name: 'HDFC BANK LIMITED',
      account_number: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      ifsc_code: 'HDFC0001234',
      branch_name: 'CHENNAI MAIN BRANCH',
      account_type: 'Current Account'
    })
    toast.success('Corporate Bank Account linked successfully!')
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.saveBank(formData)
      toast.success('Bank details saved!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.account_number) {
      toast.error('Please ensure bank account details are provided.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveBank(formData)
      workflow.completeStep(8)
      toast.success('Step 8: Corporate Bank Account Setup Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
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
            <Landmark className='h-8 w-8 text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 8: Bank Account Opening</h1>
            <p className='text-sm text-muted-foreground'>Corporate current account setup for the newly incorporated entity.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-lg overflow-hidden'>
            <CardHeader className='bg-indigo-50/50 pb-6'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <CreditCard className='h-5 w-5 text-indigo-600' />
                Account Details
              </CardTitle>
              <CardDescription>Enter the corporate account details provided by the bank.</CardDescription>
            </CardHeader>
            <CardContent className='pt-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label>Bank Name</Label>
                  <Input 
                    placeholder='e.g. ICICI BANK / HDFC BANK' 
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Account Number</Label>
                  <Input 
                    placeholder='Account Number' 
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>IFSC Code</Label>
                  <Input 
                    placeholder='e.g. HDFC0001234' 
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Branch Name</Label>
                  <Input 
                    placeholder='Branch Location' 
                    value={formData.branch_name}
                    onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/coi' })}>
              <ChevronLeft className='h-4 w-4' /> Back to COI
            </Button>
            <div className='flex gap-3'>
              <Button variant='outline' className='gap-2' onClick={handleSaveDraft} disabled={isSavingDraft}>
                <Save className='h-4 w-4' /> {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button className='px-8 bg-indigo-600 hover:bg-indigo-700 text-white' onClick={handleSimulateBank}>
                <Bot className='mr-2 h-4 w-4' /> AI Account Retrieval
              </Button>
              <Button className='px-8' onClick={handleComplete} disabled={isProcessing}>
                {isProcessing ? 'Finalizing...' : 'Finalize Step 8'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4'>
          <Card className='border-indigo-500/10 bg-indigo-500/5 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-indigo-700'>
                <Building className='h-4 w-4' />
                Preferred Partners
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
               <div className='p-3 bg-white rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Landmark className='h-4 w-4 text-indigo-500' />
                    <div>
                        <p className='text-[10px] font-bold'>ICICI BANK</p>
                        <p className='text-[8px] text-muted-foreground text-green-600'>Pre-approved for you</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    <ExternalLink className='h-3 w-3' />
                  </Button>
               </div>
               <div className='p-3 bg-white rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Landmark className='h-4 w-4 text-indigo-500' />
                    <div>
                        <p className='text-[10px] font-bold'>HDFC BANK</p>
                        <p className='text-[8px] text-muted-foreground'>Standard Corporate Account</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    <ExternalLink className='h-3 w-3' />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
