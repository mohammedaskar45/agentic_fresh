import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileBadge, 
  Award, 
  ArrowLeft, 
  ChevronLeft, 
  Download,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Building,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'

export default function COIStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    cin_number: '',
    registration_number: '',
    incorporation_date: '',
    certificate_url: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getCoi()
        if (response && response.coi_data) {
          setFormData(response.coi_data)
        }
      } catch (error) {
        console.error('Failed to fetch COI data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSimulateCoi = () => {
    setFormData({
      cin_number: 'U' + Math.floor(10000 + Math.random() * 90000) + 'TN' + new Date().getFullYear() + 'PTC' + Math.floor(100000 + Math.random() * 900000),
      registration_number: Math.floor(100000 + Math.random() * 900000).toString(),
      incorporation_date: new Date().toISOString().split('T')[0],
      certificate_url: '#'
    })
    toast.success('Certificate of Incorporation (COI) successfully generated!')
  }

  const handleComplete = async () => {
    if (!formData.cin_number) {
      toast.error('Please ensure COI and CIN are generated.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveCoi(formData)
      workflow.completeStep(7)
      toast.success('Step 7: Certificate of Incorporation Received!')
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
          <div className='p-3 bg-yellow-500/10 rounded-2xl'>
            <Award className='h-8 w-8 text-yellow-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-yellow-900'>Step 7: Certificate of Incorporation (COI)</h1>
            <p className='text-sm text-muted-foreground'>The legal birth certificate of your company.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Card className='border-none shadow-2xl bg-gradient-to-br from-yellow-50/50 to-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 p-8 opacity-5'>
              <Award className='h-48 w-48' />
            </div>
            <CardHeader className='border-b border-yellow-100'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl text-yellow-800 font-serif'>Corporate Identity Details</CardTitle>
                {formData.cin_number && <Badge className='bg-yellow-500 text-white'>OFFICIAL</Badge>}
              </div>
            </CardHeader>
            <CardContent className='pt-8 space-y-8'>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                 <div className='space-y-2'>
                    <span className='text-xs font-bold text-yellow-700 uppercase tracking-widest'>Corporate Identification Number (CIN)</span>
                    <p className='text-2xl font-mono font-bold tracking-wider text-slate-800 break-all'>
                        {formData.cin_number || 'WAITING FOR ALLOTMENT...'}
                    </p>
                 </div>
                 <div className='space-y-2'>
                    <span className='text-xs font-bold text-yellow-700 uppercase tracking-widest'>Registration Number</span>
                    <p className='text-2xl font-mono font-bold text-slate-800'>
                        {formData.registration_number || '------'}
                    </p>
                 </div>
               </div>

               <div className='flex items-center gap-6 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-yellow-600' />
                    <span className='text-sm font-medium'>Date of Incorporation:</span>
                    <span className='text-sm font-bold'>{formData.incorporation_date || 'TBD'}</span>
                  </div>
                  <div className='flex items-center gap-2 border-l border-yellow-500/20 pl-6'>
                    <Building className='h-4 w-4 text-yellow-600' />
                    <span className='text-sm font-medium'>ROC Code:</span>
                    <span className='text-sm font-bold'>ROC-CHENNAI</span>
                  </div>
               </div>

               {formData.cin_number && (
                 <Button 
                   variant='outline' 
                   className='w-full py-8 border-dashed border-yellow-300 hover:bg-yellow-50 group'
                   onClick={() => {
                     const pdfContent = '%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n72 720 Td\n(Certificate of Incorporation) Tj\nET\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
                     const blob = new Blob([pdfContent], { type: 'application/pdf' });
                     const url = URL.createObjectURL(blob);
                     const link = document.createElement('a');
                     link.href = url;
                     link.download = `COI_${formData.cin_number || 'Company'}.pdf`;
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                     URL.revokeObjectURL(url);
                     toast.success('Certificate downloaded successfully!');
                   }}
                 >
                    <Download className='mr-2 h-5 w-5 text-yellow-600 group-hover:animate-bounce' />
                    Download Official Certificate of Incorporation (Form INC-11)
                 </Button>
               )}
            </CardContent>
          </Card>

          <div className='flex justify-between gap-3'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/pan-tan' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <div className='flex gap-3'>
              <Button className='px-8 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white border-none shadow-lg' onClick={handleSimulateCoi}>
                <Bot className='mr-2 h-4 w-4' /> Receive COI from MCA
              </Button>
              <Button className='px-8' onClick={handleComplete} disabled={isProcessing || !formData.cin_number}>
                {isProcessing ? 'Saving...' : 'Finalize Step 7'}
              </Button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-4'>
           <Card className='bg-primary/5 border-primary/10 shadow-none h-full'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-md flex items-center gap-2 text-primary'>
                  <Bot className='h-5 w-5' />
                  Agent Insight
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-xs leading-relaxed'>
                  Congratulations! Your company is now a legal entity. 
                  <br /><br />
                  The CIN is a unique 21-digit alpha-numeric identifier. You must now display this on all company stationary and nameplates.
                </p>
                <div className='space-y-2 pt-4 border-t border-primary/10'>
                   <div className='flex items-center gap-2 text-[10px]'>
                      <CheckCircle2 className='h-3 w-3 text-green-500' />
                      <span>Incorporated under Companies Act 2013</span>
                   </div>
                   <div className='flex items-center gap-2 text-[10px]'>
                      <ShieldCheck className='h-3 w-3 text-blue-500' />
                      <span>Digital COI Verified</span>
                   </div>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
