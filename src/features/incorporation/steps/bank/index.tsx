import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Building2, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Bot,
  Landmark,
  ShieldCheck,
  Globe,
  FileText,
  Download,
  Upload,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function BankStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingKit, setIsGeneratingKit] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)

  const [formData, setFormData] = useState({
    bank_name: '',
    branch_name: '',
    account_type: 'Current Account',
    account_number: '',
    ifsc_code: '',
    application_status: 'pending' // pending, kit_ready, submitted, active
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [md, coiResponse] = await Promise.all([
        incorporationService.getMasterData(),
        incorporationService.getCoi()
      ])
      
      setMasterData({
        ...md,
        coi: coiResponse?.coi_data
      })
      
      // Auto-patch bank name from Master Data
      if (md?.company?.bank_name) {
        setFormData(prev => ({ ...prev, bank_name: md.company.bank_name }))
      }

      const bankResponse = await incorporationService.getBank()
      if (bankResponse && bankResponse.bank_data) {
        setFormData(prev => ({ ...prev, ...bankResponse.bank_data }))
      }
    } catch (error) {
      console.error('Failed to fetch banking data:', error)
    }
  }

  const handleGenerateBankKit = () => {
    setIsGeneratingKit(true)
    setTimeout(() => {
      setFormData(prev => ({ ...prev, application_status: 'kit_ready' }))
      setIsGeneratingKit(false)
      toast.success('Bank Account Opening Kit (BR & Application) generated successfully!')
    }, 2000)
  }

  const handleSimulateActivation = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        account_number: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
        ifsc_code: formData.bank_name.includes('ICICI') ? 'ICIC0000001' : 'HDFC0000001',
        application_status: 'active'
      }))
      setIsProcessing(false)
      toast.success('Corporate Account Successfully Activated!')
    }, 2000)
  }

  const handleSaveDraft = async () => {
    try {
      await incorporationService.saveBank(formData)
      toast.success('Banking details saved!')
    } catch (error) {
      toast.error('Failed to save data.')
    }
  }

  const handleComplete = async () => {
    if (formData.application_status !== 'active') {
      toast.error('Please ensure the account is activated first.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveBank(formData)
      workflow.completeStep(8)
      toast.success('Step 8: Bank Account Opening Finalized!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const statusSteps = [
    { id: 'pending', label: 'Initial Request' },
    { id: 'kit_ready', label: 'Kit Generated' },
    { id: 'submitted', label: 'In-Verification' },
    { id: 'active', label: 'Active' }
  ]

  const currentStatusIndex = statusSteps.findIndex(s => s.id === formData.application_status)

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button 
            variant='ghost' 
            size='icon' 
            className='rounded-xl'
            onClick={() => navigate({ to: '/admin/compliance/incorporation' })}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-blue-500/10 rounded-2xl'>
            <Building2 className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 8: Bank Account Opening</h1>
            <p className='text-sm text-muted-foreground'>Setup corporate current account and KYC for your new entity.</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
           {formData.application_status === 'active' && (
              <Badge className='bg-green-500 py-1.5 px-4 rounded-full gap-2 text-[10px] font-bold shadow-lg shadow-green-500/20'>
                 <ShieldCheck className='h-3 w-3' /> ACCOUNT ACTIVATED
              </Badge>
           )}
        </div>
      </div>

      {/* Status Tracker */}
      <Card className='border-none shadow-sm bg-slate-50/50 rounded-3xl overflow-hidden'>
         <CardContent className='p-6'>
            <div className='flex items-center justify-between relative'>
               <div className='absolute h-0.5 bg-slate-200 top-1/2 left-0 right-0 -translate-y-1/2 z-0' />
               <div 
                 className='absolute h-0.5 bg-blue-600 top-1/2 left-0 transition-all duration-500 z-0' 
                 style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
               />
               {statusSteps.map((s, i) => (
                 <div key={s.id} className='relative z-10 flex flex-col items-center gap-2'>
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-md',
                      i <= currentStatusIndex ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                    )}>
                       {i < currentStatusIndex ? <CheckCircle2 className='h-5 w-5' /> : <span className='text-xs font-black'>{i + 1}</span>}
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', i <= currentStatusIndex ? 'text-blue-700' : 'text-slate-400')}>
                      {s.label}
                    </span>
                 </div>
               ))}
            </div>
         </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] overflow-hidden relative group'>
              <div className='absolute -bottom-10 -right-10 p-8 opacity-5 group-hover:scale-110 transition-transform'>
                 <Building2 className='h-48 w-48' />
              </div>
              <CardHeader className='pb-4 border-b border-white/5'>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                   <Globe className='h-5 w-5 text-blue-400' /> Corporate Account Detail
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-8 space-y-6'>
                <div className='space-y-1'>
                  <p className='text-[10px] uppercase font-bold text-slate-400'>Selected Bank</p>
                  <p className='text-2xl font-black text-blue-400 uppercase'>{formData.bank_name || 'PENDING MASTER DATA'}</p>
                </div>
                
                <div className='grid grid-cols-2 gap-4'>
                   <div className='space-y-1'>
                      <p className='text-[10px] uppercase font-bold text-slate-400'>Account Category</p>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='bg-blue-500/10 text-blue-400 border-blue-500/20 px-3'>
                           {formData.account_type}
                        </Badge>
                      </div>
                   </div>
                   <div className='space-y-1'>
                      <p className='text-[10px] uppercase font-bold text-slate-400'>IFSC Code</p>
                      <p className='text-sm font-bold tracking-widest text-slate-200'>{formData.ifsc_code || 'AWAITING APPROVAL'}</p>
                   </div>
                </div>

                <div className='pt-6 border-t border-white/5'>
                   <p className='text-[10px] uppercase font-bold text-slate-400 mb-1'>Account Number</p>
                   <p className='text-3xl font-black tracking-widest font-mono text-green-400'>
                      {formData.account_number || '•••• •••• ••••'}
                   </p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-sm bg-white rounded-3xl overflow-hidden'>
               <CardHeader className='bg-slate-50 border-b pb-4'>
                  <CardTitle className='text-sm font-bold flex items-center gap-2'>
                     <FileText className='h-4 w-4 text-blue-600' /> Action Required
                  </CardTitle>
               </CardHeader>
               <CardContent className='p-6 space-y-6'>
                  <div className='p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-4'>
                     <div className='space-y-2'>
                        <Label className='text-[10px] font-bold text-blue-800 uppercase'>Account Type Preference</Label>
                        <Select 
                          value={formData.account_type} 
                          onValueChange={(val) => setFormData(prev => ({ ...prev, account_type: val }))}
                        >
                          <SelectTrigger className='bg-white border-blue-200 rounded-xl'>
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value='Current Account'>Current Account</SelectItem>
                             <SelectItem value='Savings Account'>Savings Account</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <p className='text-[10px] font-medium text-blue-600 italic'>
                        * Most corporate entities require a Current Account.
                     </p>
                     <Button 
                       className='w-full rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 gap-2'
                       onClick={handleGenerateBankKit}
                       disabled={isGeneratingKit}
                     >
                        {isGeneratingKit ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
                        Generate Bank Kit
                     </Button>
                  </div>

                  {formData.application_status === 'kit_ready' && (
                    <Button 
                      variant='outline'
                      className='w-full rounded-xl border-dashed border-2 hover:bg-slate-50 gap-2'
                      onClick={() => setFormData(prev => ({ ...prev, application_status: 'submitted' }))}
                    >
                       <Upload className='h-4 w-4' /> Mark as Submitted
                    </Button>
                  )}

                  {formData.application_status === 'submitted' && (
                    <Button 
                      className='w-full rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 gap-2'
                      onClick={handleSimulateActivation}
                      disabled={isProcessing}
                    >
                       {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Bot className='h-4 w-4' />}
                       Simulate Account Activation
                    </Button>
                  )}
               </CardContent>
            </Card>
          </div>

          <Card className='border-none shadow-sm bg-white rounded-3xl overflow-hidden'>
             <CardHeader className='bg-slate-50 border-b pb-4'>
                <CardTitle className='text-sm font-bold'>Entity Identity Patch (Step 6 & 7)</CardTitle>
             </CardHeader>
             <CardContent className='p-6'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                   {[
                     { l: 'CIN', v: masterData?.coi?.cin || masterData?.company?.cin || 'PENDING' },
                     { l: 'PAN', v: masterData?.coi?.pan || 'AUTO-PATCHED' },
                     { l: 'Office State', v: masterData?.company?.state || 'N/A' },
                     { l: 'Constitution', v: 'Private Limited' }
                   ].map((item, i) => (
                     <div key={i} className='space-y-1'>
                        <p className='text-[10px] uppercase font-bold text-slate-400'>{item.l}</p>
                        <p className='text-xs font-black truncate'>{item.v}</p>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-4 space-y-6'>
           <Card className='border-none shadow-sm bg-slate-900 rounded-3xl overflow-hidden text-white'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-bold flex items-center gap-2'>
                   <ShieldCheck className='h-4 w-4 text-green-400' /> Compliance Note
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0 space-y-4'>
                 <p className='text-[11px] text-slate-400 leading-relaxed'>
                    As per Section 12 of Companies Act 2013, the bank account must be opened in the name of the company as approved in SPICe+ Part B.
                 </p>
                 <div className='p-3 bg-white/5 rounded-xl border border-white/10'>
                    <p className='text-[10px] font-bold text-blue-400 mb-1'>Required Documents:</p>
                    <ul className='text-[9px] space-y-1 text-slate-300'>
                       <li>• Certified Copy of COI</li>
                       <li>• MOA & AOA (Finalized)</li>
                       <li>• Board Resolution (Pre-filled)</li>
                       <li>• Director PAN & Aadhaar</li>
                    </ul>
                 </div>
              </CardContent>
           </Card>

           <div className='flex flex-col gap-3'>
              <Button 
                variant='outline' 
                className='w-full rounded-2xl h-12 gap-2 border-slate-200'
                onClick={handleSaveDraft}
              >
                 <Save className='h-4 w-4' /> Save Progress
              </Button>
              <Button 
                className='w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20'
                disabled={formData.application_status !== 'active' || isProcessing}
                onClick={handleComplete}
              >
                 {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Finalize Step 8'}
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
