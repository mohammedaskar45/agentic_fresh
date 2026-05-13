import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Award, 
  Download, 
  CheckCircle2, 
  ArrowLeft, 
  PartyPopper,
  ShieldCheck,
  FileBadge,
  Share2,
  ChevronRight,
  Building2,
  CalendarDays,
  Hash
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Badge } from '@/components/ui/badge'
import { pdfService } from '@/lib/pdf-service'

export default function CoiStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [masterData, setMasterData] = useState<any>(null)
  const [coiNumber, setCoiNumber] = useState('')
  const [regDate, setRegDate] = useState('')

  useEffect(() => {
    fetchData()
    // Simulate COI Generation
    setCoiNumber(`U${Math.floor(Math.random() * 90000) + 10000}TN${new Date().getFullYear()}PTC${Math.floor(Math.random() * 900000) + 100000}`)
    setRegDate(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }))
  }, [])

  const fetchData = async () => {
    try {
      const md = await incorporationService.getMasterData()
      setMasterData(md)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleDownload = () => {
    if (!masterData) return
    const content = `GOVERNMENT OF INDIA\nMINISTRY OF CORPORATE AFFAIRS\n\nCERTIFICATE OF INCORPORATION\n\nI hereby certify that ${masterData.company.proposed_name} is this day incorporated under the Companies Act, 2013 and that the company is limited by shares.\n\nThe Corporate Identity Number (CIN) of the company is ${coiNumber}.\n\nGiven under my hand at Chennai this ${regDate}.`
    pdfService.generateStatutoryPDF('Certificate of Incorporation', content, masterData.company.proposed_name)
  }

  const handleComplete = async () => {
    try {
      await incorporationService.saveCoi({ coi_number: coiNumber, registration_date: regDate })
      workflow.completeStep(7)
      toast.success('Congratulations! Company officially incorporated.')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Failed to save COI.')
    }
  }

  if (!masterData || !masterData.company) {
    return (
      <div className='p-20 text-center space-y-4'>
        <Award className='h-12 w-12 text-amber-400 mx-auto' />
        <h2 className='text-xl font-bold'>Master Data Missing</h2>
        <p className='text-sm text-muted-foreground'>Company details are required to generate the Certificate of Incorporation.</p>
        <Button onClick={() => navigate({ to: '/admin/compliance/incorporation/master-data' })}>Complete Step 0</Button>
      </div>
    )
  }

  return (
    <div className='p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700'>
      {/* Celebration Header */}
      <div className='text-center space-y-4'>
        <div className='inline-flex p-4 bg-amber-500/10 rounded-full text-amber-600 animate-bounce'>
          <PartyPopper className='h-12 w-12' />
        </div>
        <h1 className='text-4xl font-extrabold tracking-tight text-slate-900'>Registration Successful!</h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
          {masterData.company.proposed_name} is now a legally registered entity in India. Your incorporation journey has reached its crown jewel.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Certificate Preview Card */}
        <Card className='relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-amber-50 to-white'>
            <div className='absolute inset-0 border-[16px] border-amber-200/30 m-4 pointer-events-none' />
            <div className='p-12 text-center space-y-8'>
                <div className='space-y-2'>
                    <Building2 className='h-10 w-10 text-amber-700 mx-auto' />
                    <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800'>Government of India</p>
                    <p className='text-xs font-serif italic text-amber-700'>Ministry of Corporate Affairs</p>
                </div>
                
                <h2 className='text-2xl font-serif font-bold text-slate-800 border-y-2 border-amber-200 py-4'>
                    Certificate of Incorporation
                </h2>

                <div className='space-y-4'>
                    <p className='text-sm leading-relaxed text-slate-600'>
                        I hereby certify that <span className='font-bold text-slate-900'>{masterData.company.proposed_name}</span> is this day incorporated under the Companies Act, 2013 and that the company is limited by shares.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-4 text-left pt-6'>
                    <div className='space-y-1'>
                        <p className='text-[10px] font-bold text-amber-800 uppercase'>CIN Number</p>
                        <p className='text-xs font-mono font-bold'>{coiNumber}</p>
                    </div>
                    <div className='space-y-1'>
                        <p className='text-[10px] font-bold text-amber-800 uppercase'>Registration Date</p>
                        <p className='text-xs font-bold'>{regDate}</p>
                    </div>
                </div>

                <div className='pt-8'>
                    <FileBadge className='h-16 w-16 text-amber-500/20 mx-auto absolute bottom-12 right-12' />
                    <div className='w-32 h-0.5 bg-slate-200 mx-auto' />
                    <p className='text-[10px] mt-2 text-slate-400'>Registrar of Companies</p>
                </div>
            </div>
        </Card>

        {/* Action Panel */}
        <div className='space-y-8'>
            <div className='space-y-4'>
                <h3 className='text-xl font-bold'>Next Actions</h3>
                <div className='space-y-4'>
                    {[
                        { icon: Building2, label: 'Open Corporate Bank Account', desc: 'Use COI and Board Resolution to open account.' },
                        { icon: Award, label: 'Appoint First Auditor', desc: 'Mandatory within 30 days of incorporation.' },
                        { icon: ShieldCheck, label: 'File INC-20A', desc: 'Declare commencement of business.' }
                    ].map((item, idx) => (
                        <div key={idx} className='flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all'>
                            <div className='p-2 bg-white shadow-sm rounded-xl h-fit'>
                                <item.icon className='h-5 w-5 text-amber-600' />
                            </div>
                            <div>
                                <p className='text-sm font-bold'>{item.label}</p>
                                <p className='text-xs text-muted-foreground'>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <Button 
                    className='w-full py-6 text-lg bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20 rounded-2xl gap-2'
                    onClick={handleDownload}
                >
                    <Download className='h-5 w-5' /> Download Certificate (PDF)
                </Button>
                <div className='grid grid-cols-2 gap-3'>
                    <Button variant='outline' className='py-6 rounded-2xl gap-2'>
                        <Share2 className='h-4 w-4' /> Share COI
                    </Button>
                    <Button 
                        className='py-6 rounded-2xl gap-2 bg-slate-900 text-white'
                        onClick={handleComplete}
                    >
                        Proceed to Post-COI <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
