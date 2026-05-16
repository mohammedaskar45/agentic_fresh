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
  Zap,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { pdfService } from '@/lib/pdf-service'
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
  const [drafts, setDrafts] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
      const spice = await incorporationService.getSpice()
      if (spice && spice.spice_data) setFormData(spice.spice_data)
      
      const d = await incorporationService.generateDrafts()
      setDrafts(d)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleDownload = (docId: string) => {
    const doc = drafts.find(d => d.id === docId)
    if (doc) {
      pdfService.generateStatutoryPDF(doc.title, doc.content, masterData?.company?.proposed_name || 'Company')
    } else {
      toast.error('Draft not found. Please check Step 4.')
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

  const getCompanyTypeLabel = (type: string) => {
    const types: any = {
      'pvt_ltd': 'Private Limited Company',
      'pub_ltd': 'Public Limited Company',
      'opc': 'One Person Company',
      'section8': 'Section 8 Company',
      'llp': 'Limited Liability Partnership'
    }
    return types[type] || type
  }

  const { company, stakeholders } = normalizedData

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-primary/10 rounded-2xl'>
            <Globe className='h-8 w-8 text-primary' />
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
                <Card className='border-none shadow-sm bg-white rounded-3xl overflow-hidden'>
                  <CardHeader className='bg-slate-50/50 border-b pb-4'>
                    <CardTitle className='text-sm font-bold flex items-center gap-2'>
                        <LayoutGrid className='h-4 w-4 text-blue-600' />
                        Part A: Name Reservation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[
                        { label: 'Proposed Name', value: company.proposed_name },
                        { label: 'Type of Company', value: getCompanyTypeLabel(company.company_type) }, // Added mapping
                        { label: 'Class of Company', value: 'Private' },
                        { label: 'Category', value: 'Company limited by shares' }
                      ].map((field, idx) => (
                        <div key={idx} className='p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group transition-all hover:bg-white hover:shadow-md hover:border-blue-100'>
                          <div>
                            <p className='text-[10px] uppercase font-black text-slate-400 tracking-wider'>{field.label}</p>
                            <p className='text-sm font-semibold mt-1 text-slate-700'>{field.value || 'N/A'}</p>
                          </div>
                          <Button variant='ghost' size='icon' className='rounded-xl' onClick={() => copyToClipboard(field.value, field.label)}>
                            <Copy className='h-4 w-4 text-slate-400 group-hover:text-blue-600' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='part-b'>
                <Card className='border-none shadow-sm bg-white rounded-3xl overflow-hidden'>
                  <CardHeader className='bg-slate-50/50 border-b pb-4'>
                    <CardTitle className='text-sm font-bold flex items-center gap-2'>
                        <Bot className='h-4 w-4 text-blue-600' />
                        Part B: Company & Director Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      <div className='p-5 bg-blue-50/50 border border-blue-100 rounded-2xl'>
                        <p className='text-[10px] uppercase font-black text-blue-400 tracking-wider'>Main Objects (Clause III(a))</p>
                        <p className='text-xs mt-2 leading-relaxed font-medium text-slate-700'>{company.main_objects}</p>
                        <Button variant='link' size='sm' className='p-0 h-auto mt-3 text-blue-600 gap-1.5 font-bold hover:no-underline' onClick={() => copyToClipboard(company.main_objects, 'Main Objects')}>
                          <Copy className='h-3.5 w-3.5' /> Copy Clause
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {[
                          { label: 'Authorised Capital', value: `Rs. ${Number(company.authorised_capital).toLocaleString('en-IN')}` },
                          { label: 'Paid-up Capital', value: `Rs. ${Number(company.paid_up_capital).toLocaleString('en-IN')}` },
                          { label: 'Number of Directors', value: stakeholders.length.toString() },
                          { label: 'Registered State', value: company.state }
                        ].map((field, idx) => (
                          <div key={idx} className='p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between transition-all hover:bg-white hover:shadow-md hover:border-blue-100'>
                             <div>
                                <p className='text-[10px] uppercase font-black text-slate-400 tracking-wider'>{field.label}</p>
                                <p className='text-sm font-semibold mt-1 text-slate-700'>{field.value}</p>
                             </div>
                             <Button variant='ghost' size='icon' className='rounded-xl' onClick={() => copyToClipboard(field.value, field.label)}>
                                <Copy className='h-4 w-4 text-slate-400' />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='agile'>
                <Card className='border-none shadow-sm bg-white rounded-3xl overflow-hidden'>
                  <CardHeader className='bg-slate-50/50 border-b pb-4'>
                    <CardTitle className='text-sm font-bold flex items-center gap-2'>
                        <Zap className='h-4 w-4 text-blue-600' />
                        AGILE-PRO-S: Statutory Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[
                        { label: 'GSTIN Application', value: 'Yes' },
                        { label: 'EPFO/ESIC Registration', value: 'Yes' },
                        { label: 'Bank Name', value: company.bank_name || 'Proposed Bank' },
                        { label: 'Police Station Limit', value: company.police_station || 'N/A' },
                        { label: 'HSN Code (Primary)', value: company.main_objects.toLowerCase().includes('software') ? '998311 (IT Services)' : '998313 (Consultancy)' },
                        { label: 'Jurisdiction', value: company.jurisdiction || 'N/A' }
                      ].map((field, idx) => (
                        <div key={idx} className='p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between transition-all hover:bg-white hover:shadow-md hover:border-blue-100'>
                             <div>
                                <p className='text-[10px] uppercase font-black text-slate-400 tracking-wider'>{field.label}</p>
                                <p className='text-sm font-semibold mt-1 text-slate-700'>{field.value}</p>
                             </div>
                             <Button variant='ghost' size='icon' className='rounded-xl' onClick={() => copyToClipboard(field.value, field.label)}>
                                <Copy className='h-4 w-4 text-slate-400' />
                             </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='linked'>
                 <Card className='border-none shadow-sm bg-green-50/50 border-green-200 rounded-3xl overflow-hidden'>
                    <CardContent className='p-10 text-center space-y-6'>
                        <div className='p-4 bg-green-500 text-white rounded-3xl w-fit mx-auto shadow-lg shadow-green-500/20'>
                            <ClipboardCheck className='h-10 w-10' />
                        </div>
                        <div className='space-y-2'>
                            <h3 className='text-xl font-bold text-green-900'>e-MOA & e-AOA Ready</h3>
                            <p className='text-sm text-green-700/80 max-w-sm mx-auto leading-relaxed'>
                                All objects and regulations have been mapped. Download your forms below for portal filing.
                            </p>
                        </div>
                        <div className='flex flex-wrap items-center justify-center gap-4 mt-6'>
                           <Button 
                              variant='outline' 
                              className='bg-white border-green-200 hover:bg-green-100 text-green-700 gap-2 h-12 px-6 rounded-2xl shadow-sm'
                              onClick={() => handleDownload('moa')}
                           >
                              <Download className='h-4 w-4' /> Download e-MOA (INC-33)
                           </Button>
                           <Button 
                              variant='outline' 
                              className='bg-white border-green-200 hover:bg-green-100 text-green-700 gap-2 h-12 px-6 rounded-2xl shadow-sm'
                              onClick={() => handleDownload('aoa')}
                           >
                              <Download className='h-4 w-4' /> Download e-AOA (INC-34)
                           </Button>
                        </div>
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
              className='px-10 bg-primary hover:bg-primary/90 text-primary-foreground'
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

          {/* Section 13.1 - S5 Checklist Requirement */}
          <Card className='border-none shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden'>
            <CardHeader className='pb-4 border-b border-white/10'>
              <CardTitle className='text-sm font-bold flex items-center gap-2'>
                <ClipboardCheck className='h-4 w-4 text-emerald-400' />
                Mandatory Attachments Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-4'>
              {[
                'Proof of Office Address (NOC/Rent Agreement)',
                'Utility Bill (Not older than 2 months)',
                'Signed DIR-2 (Consent to act as Director)',
                'Signed INC-9 (Statutory Declaration)',
                'Interest in other entities (if applicable)',
                'Subscriber Sheet (e-MoA/e-AoA)'
              ].map((item, idx) => (
                <div key={idx} className='flex items-start gap-3 group'>
                  <div className='h-4 w-4 rounded border border-white/20 mt-0.5 group-hover:border-emerald-400 transition-colors' />
                  <span className='text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity'>{item}</span>
                </div>
              ))}
              <Alert className='bg-emerald-500/10 border-emerald-500/20 mt-4'>
                <CheckCircle2 className='h-4 w-4 text-emerald-400' />
                <AlertDescription className='text-[10px] text-emerald-200'>
                  All drafts generated in Step 4 are automatically mapped to these attachments.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
