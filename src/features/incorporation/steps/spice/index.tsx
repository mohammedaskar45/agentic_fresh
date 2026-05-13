import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileCheck, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronLeft, 
  Save, 
  Loader2,
  ShieldAlert,
  Bot,
  Globe,
  Copy,
  LayoutGrid,
  ClipboardCheck,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SpiceAssistant() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    submission_status: 'pending',
    mca_reference_id: '',
    declaration_accepted: false,
    inc9_declaration_accepted: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      const spice = await incorporationService.getSpice()
      if (spice && spice.spice_data) setFormData(spice.spice_data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const handleComplete = async () => {
    if (!formData.declaration_accepted) {
      toast.error('Please accept the statutory declaration.')
      return
    }

    setIsProcessing(true)
    try {
      const finalData = { 
        ...formData, 
        submission_status: 'submitted',
        mca_reference_id: 'MCA-' + Math.random().toString(36).substring(7).toUpperCase() 
      }
      await incorporationService.saveSpice(finalData)
      workflow.completeStep(5)
      toast.success('Step 5: SPICe+ Filing Simulated Successfully!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Filing failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Use the extracted data for rendering
  const normalizedData = masterData?.company ? masterData : (masterData as any)?.master_data;

  if (!normalizedData || !normalizedData.company) {
    return (
      <div className='p-20 text-center space-y-4'>
        <Bot className='h-12 w-12 text-blue-400 mx-auto animate-pulse' />
        <h2 className='text-xl font-bold'>Master Data Missing</h2>
        <p className='text-sm text-muted-foreground'>Step 0 (Master Data Profiling) has not been completed yet. Please provide the required company details to proceed.</p>
        <Button onClick={() => navigate({ to: '/admin/compliance/incorporation/master-data' })}>Complete Step 0</Button>
      </div>
    )
  }

  const { company, stakeholders } = normalizedData

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-blue-600/10 rounded-2xl'>
            <Globe className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 5: SPICe+ Smart Assistant</h1>
            <p className='text-sm text-muted-foreground'>Use this assistant to fill the MCA Portal fields using your Master Data.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Tabs defaultValue='part-a' className='w-full'>
            <TabsList className='grid grid-cols-4 bg-slate-100 p-1 rounded-xl'>
              <TabsTrigger value='part-a'>Part A</TabsTrigger>
              <TabsTrigger value='part-b'>Part B</TabsTrigger>
              <TabsTrigger value='agile'>AGILE-PRO</TabsTrigger>
              <TabsTrigger value='linked'>Linked Forms</TabsTrigger>
            </TabsList>

            <div className='mt-6'>
              <TabsContent value='part-a'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm'>Part A: Name Reservation</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[
                        { label: 'Proposed Name', value: company.proposed_name },
                        { label: 'Type of Company', value: company.type },
                        { label: 'Class of Company', value: 'Private' },
                        { label: 'Category', value: 'Company limited by shares' }
                      ].map((field, idx) => (
                        <div key={idx} className='p-4 bg-slate-50 border rounded-xl flex items-center justify-between group'>
                          <div>
                            <p className='text-[10px] uppercase font-bold text-slate-400'>{field.label}</p>
                            <p className='text-sm font-medium mt-0.5'>{field.value}</p>
                          </div>
                          <Button variant='ghost' size='icon' onClick={() => copyToClipboard(field.value, field.label)}>
                            <Copy className='h-4 w-4 text-slate-400 group-hover:text-blue-600' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='part-b'>
                <Card>
                  <CardHeader><CardTitle className='text-sm'>Part B: Company & Director Details</CardTitle></CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-4'>
                      <div className='p-4 bg-slate-50 border rounded-xl'>
                        <p className='text-[10px] uppercase font-bold text-slate-400'>Main Objects (Clause III(a))</p>
                        <p className='text-xs mt-1 leading-relaxed'>{company.main_objects}</p>
                        <Button variant='link' size='sm' className='p-0 h-auto mt-2 text-blue-600 gap-1' onClick={() => copyToClipboard(company.main_objects, 'Main Objects')}>
                          <Copy className='h-3 w-3' /> Copy Clause
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {[
                          { label: 'Authorised Capital', value: `Rs. ${company.authorised_capital}` },
                          { label: 'Number of Directors', value: stakeholders.length.toString() },
                        ].map((field, idx) => (
                          <div key={idx} className='p-4 bg-slate-50 border rounded-xl flex items-center justify-between'>
                             <div>
                                <p className='text-[10px] uppercase font-bold text-slate-400'>{field.label}</p>
                                <p className='text-sm font-medium'>{field.value}</p>
                             </div>
                             <Button variant='ghost' size='icon' onClick={() => copyToClipboard(field.value, field.label)}>
                                <Copy className='h-4 w-4' />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='agile'>
                <Card>
                  <CardHeader><CardTitle className='text-sm'>AGILE-PRO-S: Statutory Registrations</CardTitle></CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4'>
                      {[
                        { label: 'GSTIN Application', value: 'Yes' },
                        { label: 'EPFO/ESIC Registration', value: 'Yes' },
                        { label: 'Bank Name', value: 'ICICI Bank (Proposed)' },
                        { label: 'Police Station', value: 'Teynampet Police Station' }
                      ].map((field, idx) => (
                        <div key={idx} className='p-4 bg-slate-50 border rounded-xl flex items-center justify-between'>
                             <div>
                                <p className='text-[10px] uppercase font-bold text-slate-400'>{field.label}</p>
                                <p className='text-sm font-medium'>{field.value}</p>
                             </div>
                             <Button variant='ghost' size='icon' onClick={() => copyToClipboard(field.value, field.label)}>
                                <Copy className='h-4 w-4' />
                             </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='linked'>
                 <Card className='bg-green-50 border-green-200'>
                    <CardContent className='p-8 text-center space-y-4'>
                        <div className='p-3 bg-green-500 text-white rounded-full w-fit mx-auto'>
                            <ClipboardCheck className='h-8 w-8' />
                        </div>
                        <h3 className='text-lg font-bold text-green-900'>e-MOA & e-AOA Ready</h3>
                        <p className='text-sm text-green-700 max-w-md mx-auto'>
                            All objects and regulations have been mapped. You can download the INC-33 and INC-34 draft from Step 4 if needed for manual verification.
                        </p>
                    </CardContent>
                 </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className='flex items-center gap-3 pt-6 border-t'>
            <input 
              type='checkbox' 
              id='declare'
              className='h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary'
              checked={formData.declaration_accepted}
              onChange={(e) => setFormData({...formData, declaration_accepted: e.target.checked})}
            />
            <label htmlFor='declare' className='text-sm text-muted-foreground'>
              I have completed the filing on the MCA Portal using the data above.
            </label>
          </div>

          <div className='flex items-center gap-3 pt-2'>
            <input 
              type='checkbox' 
              id='inc9'
              className='h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary'
              checked={formData.inc9_declaration_accepted}
              onChange={(e) => setFormData({...formData, inc9_declaration_accepted: e.target.checked})}
            />
            <label htmlFor='inc9' className='text-sm font-medium text-blue-900'>
              Statutory Declaration (INC-9): I/We declare that all information is correct and I am not guilty of any offence.
            </label>
          </div>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/moa-aoa' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
              className='px-10 bg-blue-600 hover:bg-blue-700 text-white'
              onClick={handleComplete}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Zap className='h-4 w-4 mr-2' />}
              Confirm Filing Completed
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='bg-blue-600/5 border-blue-600/10 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-blue-800'>
                <Bot className='h-4 w-4' />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-xs leading-relaxed text-blue-900/80'>
                "Please use the data provided in Part A and Part B to complete the MCA portal filing. Ensure the Objects clause is copied exactly as drafted."
              </p>
              <div className='pt-2 space-y-2 border-t border-blue-100'>
                <div className='flex items-center gap-2 text-[10px] text-blue-700'>
                  <CheckCircle2 className='h-3.5 w-3.5 text-blue-600' />
                  <span>Master Data Validated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
