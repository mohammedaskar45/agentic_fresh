import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { buybackService } from '@/services/buyback.service'
import { useBuybackStore } from '@/stores/buyback-store'

export default function BuybackMasterData() {
  const navigate = useNavigate()
  const bbStore = useBuybackStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [eligibility, setEligibility] = useState<any[]>([])
  const [formData, setFormData] = useState({
    paid_up_capital: '',
    free_reserves: '',
    total_debt: '',
    buyback_amount: '',
    shares_to_buyback: '',
    buyback_price: '',
    buyback_method: 'TENDER',
    company_type: 'PRIVATE'
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const data = await buybackService.getStatus()
      if (data.master_data) {
        setFormData({
          paid_up_capital: data.master_data.paid_up_capital.toString(),
          free_reserves: data.master_data.free_reserves.toString(),
          total_debt: data.master_data.total_debt.toString(),
          buyback_amount: data.master_data.buyback_amount.toString(),
          shares_to_buyback: data.master_data.shares_to_buyback.toString(),
          buyback_price: data.master_data.buyback_price.toString(),
          buyback_method: data.master_data.buyback_method || 'TENDER',
          company_type: data.master_data.company_type || 'PRIVATE'
        })
      }
      setEligibility(data.eligibility_results || [])
    } catch (error) {}
  }

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      const response = await buybackService.saveMasterData(formData)
      setEligibility(response.eligibility_results || [])
      toast.success('Master Data & Eligibility updated!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProceed = async () => {
      try {
          await buybackService.saveStep(0)
          bbStore.completeStep(0)
          navigate({ to: '/admin/compliance/buyback/dashboard' })
      } catch (error) {}
  }

  const allPassed = eligibility.length > 0 && eligibility.every(e => e.status === 'green')

  return (
    <div className='p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/buyback/dashboard' })}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div className='p-3 bg-indigo-600/10 rounded-2xl text-indigo-600'>
          <Database className='h-8 w-8' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Step 0: Master Data & Eligibility</h1>
          <p className='text-sm text-muted-foreground'>Section 68(2) & Rule 17: Limits and ratios check.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-indigo-600' />
                Financial Thresholds
              </CardTitle>
              <CardDescription>Enter values as per latest audited financial statements.</CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Paid-up Share Capital (Rs.)</Label>
                <Input 
                  type='number' 
                  value={formData.paid_up_capital} 
                  onChange={e => setFormData({...formData, paid_up_capital: e.target.value})}
                  placeholder='e.g. 10000000'
                />
              </div>
              <div className='space-y-2'>
                <Label>Free Reserves (Rs.)</Label>
                <Input 
                  type='number' 
                  value={formData.free_reserves}
                  onChange={e => setFormData({...formData, free_reserves: e.target.value})}
                  placeholder='e.g. 50000000'
                />
              </div>
              <div className='space-y-2'>
                <Label>Total Outstanding Debt (Rs.)</Label>
                <Input 
                  type='number' 
                  value={formData.total_debt}
                  onChange={e => setFormData({...formData, total_debt: e.target.value})}
                  placeholder='All secured + unsecured loans'
                />
              </div>
              <div className='space-y-2'>
                <Label>Company Type</Label>
                <Select value={formData.company_type} onValueChange={v => setFormData({...formData, company_type: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PRIVATE'>Private / Unlisted</SelectItem>
                    <SelectItem value='LISTED'>Listed (SEBI Applicability)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle className='text-lg'>Buyback Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Shares to Buyback</Label>
                <Input 
                  type='number' 
                  value={formData.shares_to_buyback}
                  onChange={e => setFormData({...formData, shares_to_buyback: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Buyback Price (per share)</Label>
                <Input 
                  type='number' 
                  value={formData.buyback_price}
                  onChange={e => {
                      const price = e.target.value;
                      setFormData({
                          ...formData, 
                          buyback_price: price,
                          buyback_amount: (Number(price) * Number(formData.shares_to_buyback)).toString()
                      })
                  }}
                />
              </div>
              <div className='space-y-2'>
                <Label>Total Buyback Size (Rs.)</Label>
                <Input value={formData.buyback_amount} readOnly className='bg-slate-50' />
              </div>
              <div className='space-y-2'>
                <Label>Buyback Method</Label>
                <Select value={formData.buyback_method} onValueChange={v => setFormData({...formData, buyback_method: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value='TENDER'>Tender Offer (Sec 68)</SelectItem>
                        <SelectItem value='OPEN_MARKET'>Open Market (Stock Exchange)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardContent>
                <Button className='w-full' onClick={handleSave} disabled={isProcessing}>
                    {isProcessing ? 'Calculating...' : 'Run Eligibility Checks'}
                </Button>
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-xl sticky top-6'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-emerald-600' />
                Eligibility Results
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {eligibility.length === 0 ? (
                  <div className='text-center py-8 text-slate-400'>
                      <HelpCircle className='h-12 w-12 mx-auto mb-2 opacity-20' />
                      <p className='text-xs'>Enter data and run checks to see eligibility.</p>
                  </div>
              ) : (
                  eligibility.map((check, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${
                        check.status === 'green' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                    }`}>
                        <div className='flex items-start gap-3'>
                            {check.status === 'green' ? <CheckCircle2 className='h-4 w-4 text-emerald-600 mt-1' /> : <XCircle className='h-4 w-4 text-red-600 mt-1' />}
                            <div>
                                <p className='text-xs font-bold'>{check.title}</p>
                                <p className='text-[10px] opacity-70 mt-1'>{check.message}</p>
                                {check.status === 'red' && (
                                    <p className='text-[10px] text-red-600 font-medium mt-2'>Remedy: {check.remedy}</p>
                                )}
                            </div>
                        </div>
                    </div>
                  ))
              )}

              <Button 
                className='w-full mt-6 bg-slate-900 text-white' 
                disabled={!allPassed}
                onClick={handleProceed}
              >
                  Proceed to Board Approval <ChevronRight className='ml-2 h-4 w-4' />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
