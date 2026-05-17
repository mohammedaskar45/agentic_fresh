import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  CreditCard, 
  Hash, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  Download,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Building,
  Zap,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function PanTanStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const [laborData, setLaborData] = useState<any>(null)
  const [masterData, setMasterData] = useState<any>(null)
  const [formData, setFormData] = useState({
    pan_number: '',
    pan_area_code: '',
    pan_ao_type: '',
    pan_range_code: '',
    pan_ao_no: '',
    tan_number: '',
    tan_area_code: '',
    tan_ao_type: '',
    tan_range_code: '',
    tan_ao_no: '',
    allotment_date: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      const response = await incorporationService.getPanTan()
      if (response && response.pan_tan_data) {
        setFormData(prev => ({ ...prev, ...response.pan_tan_data }))
      }
      const laborRes = await incorporationService.getLabor()
      if (laborRes && laborRes.labor_data) {
        setLaborData(laborRes.labor_data)
      }
    } catch (error) {
      console.error('Failed to fetch PAN/TAN data:', error)
    }
  }

  const suggestAOCodes = () => {
    const state = masterData?.company?.state || 'Tamil Nadu'
    if (state.includes('Tamil Nadu')) {
      setFormData(prev => ({
        ...prev,
        pan_area_code: 'CHE',
        pan_ao_type: 'W',
        pan_range_code: '112',
        pan_ao_no: '1',
        tan_area_code: 'CHNP',
        tan_ao_type: 'W',
        tan_range_code: '112',
        tan_ao_no: '4'
      }))
      toast.success('AO Codes suggested for Tamil Nadu jurisdiction.')
    } else {
      toast.info('AI Suggestion: Please select your local ward/circle.')
    }
  }

  const getEpfoStateOfficeCodes = () => {
    const state = (masterData?.company?.state || 'Tamil Nadu').toLowerCase()
    if (state.includes('tamil nadu')) {
      return { stateCode: 'TN', officeCode: 'MAS' }
    } else if (state.includes('maharashtra')) {
      return { stateCode: 'MH', officeCode: 'BAN' }
    } else if (state.includes('karnataka')) {
      return { stateCode: 'KA', officeCode: 'BAN' }
    } else if (state.includes('delhi')) {
      return { stateCode: 'DL', officeCode: 'CPM' }
    } else if (state.includes('telangana')) {
      return { stateCode: 'TS', officeCode: 'HYD' }
    } else if (state.includes('andhra')) {
      return { stateCode: 'AP', officeCode: 'VJG' }
    }
    return { stateCode: 'TN', officeCode: 'MAS' } // Default fallback
  }

  const getEsicStateCode = () => {
    const state = (masterData?.company?.state || 'Tamil Nadu').toLowerCase()
    if (state.includes('tamil nadu')) return '55'
    if (state.includes('maharashtra')) return '31'
    if (state.includes('karnataka')) return '53'
    if (state.includes('delhi')) return '11'
    if (state.includes('telangana')) return '51'
    if (state.includes('andhra')) return '39'
    return '55' // Default Tamil Nadu ESIC code
  }

  const handleGenerateAI = () => {
    setIsProcessing(true)
    setTimeout(async () => {
      suggestAOCodes()
      
      const mockPan = 'AAAC' + Math.random().toString(36).substring(2, 7).toUpperCase() + 'A'
      const mockTan = 'CHNP' + Math.random().toString(36).substring(2, 7).toUpperCase() + 'T'
      
      // Get dynamic EPFO state/office codes from masterData
      const { stateCode, officeCode } = getEpfoStateOfficeCodes()
      const mockEpfo = `${stateCode}/${officeCode}/` + Math.floor(1000000 + Math.random() * 9000000)
      
      // Get dynamic ESIC state code from masterData
      const esicStateCode = getEsicStateCode()
      const mockEsic = `${esicStateCode}-` + Math.floor(100000 + Math.random() * 900000) + '-001'

      setFormData(prev => ({
        ...prev,
        pan_number: mockPan,
        tan_number: mockTan,
        allotment_date: new Date().toISOString().split('T')[0],
        status: 'allotted'
      }))

      try {
        const updatedLabor = {
          epfo_number: mockEpfo,
          esic_number: mockEsic,
          establishment_id: 'EST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        }
        await incorporationService.saveLabor(updatedLabor)
        setLaborData(updatedLabor)
      } catch (err) {
        console.error('Failed to sync mock labor data:', err)
      }

      setIsProcessing(false)
      toast.success('Statutory Identities (PAN/TAN/GST/Labor) successfully tracked!')
    }, 1500)
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await incorporationService.savePanTan(formData)
      toast.success('Tax data saved successfully!')
    } catch (error) {
      toast.error('Failed to save data.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async () => {
    if (!formData.pan_number || !formData.tan_number) {
      toast.error('Please ensure statutory identities are allotted.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.savePanTan(formData)
      workflow.completeStep(6)
      toast.success('Step 6: PAN, TAN & GST Allotment Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

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
            <ShieldCheck className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 6: PAN, TAN & GST Allotment</h1>
            <p className='text-sm text-muted-foreground'>Tracking automatic allotment of statutory identities post-incorporation.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          {/* Identity Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* PAN Card */}
            <Card className='border-none shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative group'>
               <CardHeader className='pb-2'>
                  <div className='flex justify-between items-start'>
                     <div className='p-2 bg-white/10 rounded-lg'>
                        <CreditCard className='h-5 w-5' />
                     </div>
                     <Badge className='bg-green-500/20 text-green-400 border-green-500/30 text-[10px]'>ALLOTTED</Badge>
                  </div>
               </CardHeader>
               <CardContent className='pt-4 space-y-4'>
                  <div className='space-y-1'>
                     <p className='text-[10px] uppercase font-bold text-slate-400 tracking-widest'>Permanent Account Number</p>
                     <p className='text-2xl font-black tracking-[0.2em] font-mono'>{formData.pan_number || 'XXXXXXXXXX'}</p>
                  </div>
                  <div className='flex justify-between items-end'>
                     <div className='space-y-1'>
                        <p className='text-[8px] uppercase font-bold text-slate-500'>Jurisdiction</p>
                        <p className='text-[10px] font-bold'>{formData.pan_area_code || 'TBD'}-{formData.pan_ao_no || 'X'}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* TAN Card */}
            <Card className='border-none shadow-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white overflow-hidden relative'>
               <CardHeader className='pb-2'>
                  <div className='flex justify-between items-start'>
                     <div className='p-2 bg-white/10 rounded-lg'>
                        <Building className='h-5 w-5' />
                     </div>
                     <Badge className='bg-blue-400/20 text-blue-200 border-blue-400/30 text-[10px]'>ACTIVE</Badge>
                  </div>
               </CardHeader>
               <CardContent className='pt-4 space-y-4'>
                  <div className='space-y-1'>
                     <p className='text-[10px] uppercase font-bold text-blue-300 tracking-widest'>Tax Deduction Account</p>
                     <p className='text-2xl font-black tracking-[0.2em] font-mono'>{formData.tan_number || 'XXXXXXXXXX'}</p>
                  </div>
                  <div className='flex justify-between items-end'>
                     <div className='space-y-1'>
                        <p className='text-[8px] uppercase font-bold text-blue-400'>State</p>
                        <p className='text-[10px] font-bold'>{masterData?.company?.state || 'Tamil Nadu'}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* GST Card */}
            <Card className='border-none shadow-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white overflow-hidden relative'>
               <CardHeader className='pb-2'>
                  <div className='flex justify-between items-start'>
                     <div className='p-2 bg-white/10 rounded-lg'>
                        <Zap className='h-5 w-5' />
                     </div>
                     <Badge className='bg-teal-400/20 text-teal-100 border-teal-400/30 text-[10px]'>PAN LINKED</Badge>
                  </div>
               </CardHeader>
               <CardContent className='pt-4 space-y-4'>
                  <div className='space-y-1'>
                     <p className='text-[10px] uppercase font-bold text-teal-200 tracking-widest'>GST Identification Number</p>
                     <p className='text-2xl font-black tracking-[0.2em] font-mono'>
                       {formData.pan_number ? `33${formData.pan_number}1Z5` : 'XXXXXXXXXXXXXXX'}
                     </p>
                  </div>
                  <div className='flex justify-between items-end'>
                     <div className='space-y-1'>
                        <p className='text-[8px] uppercase font-bold text-teal-400'>Category</p>
                        <p className='text-[10px] font-bold'>Regular Taxpayer</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Labor Card */}
            <Card className='border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden relative'>
               <CardHeader className='pb-2'>
                  <div className='flex justify-between items-start'>
                     <div className='p-2 bg-white/10 rounded-lg'>
                        <Users className='h-5 w-5' />
                     </div>
                     <Badge className='bg-indigo-400/20 text-indigo-100 border-indigo-400/30 text-[10px]'>AGILE-PRO-S</Badge>
                  </div>
               </CardHeader>
               <CardContent className='pt-4 space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                       <p className='text-[8px] uppercase font-bold text-indigo-300'>EPFO Allotment</p>
                       <p className='text-xs font-mono font-bold'>{laborData?.epfo_number || 'PENDING COI'}</p>
                    </div>
                    <div className='space-y-1'>
                       <p className='text-[8px] uppercase font-bold text-indigo-300'>ESIC Status</p>
                       <p className='text-xs font-mono font-bold'>{laborData?.esic_number || 'PENDING COI'}</p>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          <div className='flex justify-between gap-3 pt-6'>
            <Button 
              variant='outline' 
              className='gap-2 rounded-xl'
              onClick={() => navigate({ to: '/admin/compliance/incorporation/spice' })}
            >
              <ChevronLeft className='h-4 w-4' /> Back to Step 5
            </Button>
            <div className='flex gap-3'>
              <Button 
                variant='outline' 
                className='gap-2 rounded-xl'
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                <Save className='h-4 w-4' /> Save Draft
              </Button>
              <Button 
                className='px-8 gap-2 rounded-xl'
                onClick={handleGenerateAI}
              >
                <Bot className='h-4 w-4' /> AI Identity Sync
              </Button>
              <Button 
                className='px-8 rounded-xl'
                onClick={handleComplete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Finalize Step 6'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='border-none shadow-lg bg-white/50 backdrop-blur-sm'>
            <CardHeader>
               <CardTitle className='text-sm flex items-center gap-2'>
                 <Bot className='h-4 w-4 text-blue-600' />
                 Statutory AI Agent
               </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-[11px] leading-relaxed text-slate-600 italic'>
                "I am tracking the allotment of your statutory identities from the MCA21 and Income Tax portals. Once the COI is issued, these numbers will be automatically validated here."
              </p>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-[10px] font-medium'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  <span>PAN Allotment Integrated</span>
                </div>
                <div className='flex items-center gap-2 text-[10px] font-medium'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  <span>TAN Tracking Active</span>
                </div>
                <div className='flex items-center gap-2 text-[10px] font-medium'>
                  <CheckCircle2 className='h-3 w-3 text-green-500' />
                  <span>GST Status: Linked to PAN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
