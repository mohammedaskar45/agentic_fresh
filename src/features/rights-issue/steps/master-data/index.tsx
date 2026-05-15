import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Building2, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  Banknote,
  Calendar,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { rightsIssueService } from '@/services/rights-issue.service'
import { useRightsIssueStore } from '@/stores/rights-issue-store'

export default function RightsIssueMasterData() {
  const navigate = useNavigate()
  const riStore = useRightsIssueStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    company_type: 'PRIVATE',
    shares_to_issue: '',
    issue_price: '',
    face_value: '10',
    entitlement_ratio: '1:5',
    record_date: '',
    offer_opening_date: '',
    offer_closing_date: '',
    purpose_of_issue: '',
    board_meeting_date: '',
    subscription_amount: '',
    stock_exchange: 'BSE',
    isin: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const status = await rightsIssueService.getStatus()
      if (status.master_data) {
        setFormData(prev => ({ ...prev, ...status.master_data }))
        riStore.setCompanyType(status.master_data.company_type)
      }
      riStore.setSteps(status.workflow_status)
    } catch (error) {
      console.error('Failed to fetch RI status:', error)
    }
  }

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      const result = await rightsIssueService.saveMasterData(formData)
      riStore.setSteps(result.workflow_status)
      riStore.setCurrentStep(1)
      toast.success('Master Data saved! Moving to Eligibility Check.')
      navigate({ to: '/admin/compliance/rights-issue/eligibility' })
    } catch (error) {
      toast.error('Failed to save master data.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-primary/10 rounded-2xl'>
            <Building2 className='h-8 w-8 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 0: Master Data Profiling</h1>
            <p className='text-sm text-muted-foreground'>Configure the core parameters for your Rights Issue.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          {/* Company Type Selection */}
          <Card className='border-primary/10'>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-primary' />
                Entity Governance Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={formData.company_type} 
                onValueChange={(val) => setFormData({...formData, company_type: val})}
                className='grid grid-cols-2 gap-4'
              >
                <div>
                  <RadioGroupItem value='PRIVATE' id='private' className='peer sr-only' />
                  <Label
                    htmlFor='private'
                    className='flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'
                  >
                    <Building2 className='mb-3 h-6 w-6' />
                    <span className='text-sm font-bold'>Private / Unlisted</span>
                    <span className='text-[10px] text-muted-foreground text-center mt-1'>Section 62(1)(a) Compliance</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value='LISTED' id='listed' className='peer sr-only' />
                  <Label
                    htmlFor='listed'
                    className='flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'
                  >
                    <ShieldCheck className='mb-3 h-6 w-6' />
                    <span className='text-sm font-bold'>Listed Company</span>
                    <span className='text-[10px] text-muted-foreground text-center mt-1'>SEBI ICDR Regulations</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Banknote className='h-4 w-4 text-primary' />
                Rights Issue Financials
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>No. of Shares to be Issued</Label>
                <Input 
                  type='number' 
                  placeholder='e.g. 500000' 
                  value={formData.shares_to_issue}
                  onChange={e => setFormData({...formData, shares_to_issue: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Issue Price (per share)</Label>
                <Input 
                  type='number' 
                  placeholder='e.g. 150' 
                  value={formData.issue_price}
                  onChange={e => setFormData({...formData, issue_price: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Face Value (per share)</Label>
                <Input 
                  type='number' 
                  value={formData.face_value}
                  onChange={e => setFormData({...formData, face_value: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Entitlement Ratio</Label>
                <Input 
                  placeholder='e.g. 1:5 (1 share for every 5 held)' 
                  value={formData.entitlement_ratio}
                  onChange={e => setFormData({...formData, entitlement_ratio: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-primary' />
                Statutory Timelines
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Board Meeting Date</Label>
                <Input 
                  type='date' 
                  value={formData.board_meeting_date}
                  onChange={e => setFormData({...formData, board_meeting_date: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Record Date</Label>
                <Input 
                  type='date' 
                  value={formData.record_date}
                  onChange={e => setFormData({...formData, record_date: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Offer Opening Date</Label>
                <Input 
                  type='date' 
                  value={formData.offer_opening_date}
                  onChange={e => setFormData({...formData, offer_opening_date: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label>Offer Closing Date</Label>
                <Input 
                  type='date' 
                  value={formData.offer_closing_date}
                  onChange={e => setFormData({...formData, offer_closing_date: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Listed Specific Fields */}
          {formData.company_type === 'LISTED' && (
            <Card className='border-amber-100 bg-amber-50/20'>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2 text-amber-800'>
                  <ShieldCheck className='h-4 w-4' />
                  SEBI Mandatory Disclosures
                </CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label>Stock Exchange</Label>
                  <Select 
                    value={formData.stock_exchange} 
                    onValueChange={val => setFormData({...formData, stock_exchange: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exchange" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSE">BSE Limited</SelectItem>
                      <SelectItem value="NSE">National Stock Exchange (NSE)</SelectItem>
                      <SelectItem value="BOTH">BSE & NSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>ISIN Number</Label>
                  <Input 
                    placeholder='e.g. INE123A01011' 
                    value={formData.isin}
                    onChange={e => setFormData({...formData, isin: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className='flex justify-end pt-4'>
            <Button 
              className='px-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20'
              disabled={isProcessing}
              onClick={handleSave}
            >
              {isProcessing ? 'Saving...' : 'Run Eligibility Check'} <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='bg-primary/5 border-none shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-primary'>
                <Info className='h-4 w-4' />
                Compliance Tip
              </CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-muted-foreground leading-relaxed'>
              <p>
                <b>Section 62(1)(a):</b> Rights Issue offer must be made pro-rata to existing holding. 
                The offer period must be between 15 to 30 days.
                <br /><br />
                {formData.company_type === 'LISTED' ? 
                  "Listed companies must follow SEBI ICDR guidelines and ensure ASBA mechanism for payments." : 
                  "Private companies can use a simplified PAS-4 letter of offer format."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
