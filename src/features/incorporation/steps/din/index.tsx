import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileCheck, 
  User, 
  MapPin, 
  ShieldCheck,
  CheckCircle2,
  Bot,
  ArrowLeft,
  ChevronLeft,
  Plus,
  Trash2,
  Mail,
  Phone,
  Fingerprint,
  Clock,
  Home
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { Switch } from '@/components/ui/switch'

interface Director {
  id: string
  full_name: string
  father_name: string
  pan_number: string
  email: string
  mobile: string
  qualification: string
  occupation: string
  pob: string
  duration_of_stay: string
  present_address: string
  permanent_address: string
  is_same_address: boolean
}

export default function DINStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [directors, setDirectors] = useState<Director[]>([
    { 
        id: crypto.randomUUID(), 
        full_name: '', 
        father_name: '',
        pan_number: '',
        email: '',
        mobile: '',
        qualification: 'graduate', 
        occupation: 'business', 
        pob: '',
        duration_of_stay: '',
        present_address: '',
        permanent_address: '',
        is_same_address: true
    }
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await incorporationService.getDin()
        if (response && response.din_data && Array.isArray(response.din_data.directors)) {
          setDirectors(response.din_data.directors)
        }
      } catch (error) {
        console.error('Failed to fetch DIN data:', error)
      }
    }
    fetchData()
  }, [])

  const handleAddDirector = () => {
    setDirectors([
      ...directors,
      { 
        id: crypto.randomUUID(), 
        full_name: '', 
        father_name: '',
        pan_number: '',
        email: '',
        mobile: '',
        qualification: 'graduate', 
        occupation: 'business', 
        pob: '',
        duration_of_stay: '',
        present_address: '',
        permanent_address: '',
        is_same_address: true
      }
    ])
  }

  const handleRemoveDirector = (id: string) => {
    if (directors.length === 1) {
      toast.error('At least one director is required.')
      return
    }
    setDirectors(directors.filter(d => d.id !== id))
  }

  const updateDirector = (id: string, field: keyof Director, value: any) => {
    setDirectors(directors.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const handleComplete = async () => {
    if (directors.some(d => !d.full_name || !d.pan_number || !d.present_address)) {
      toast.error('Please fill all mandatory identity and address fields.')
      return
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveDin({ directors })
      workflow.completeStep(2)
      toast.success('Step 2: Complete Statutory DIN Applications Submitted!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Application failed.')
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
          <div className='p-3 bg-blue-500/10 rounded-2xl'>
            <FileCheck className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-slate-800'>Step 2: Director Identification (DIN)</h1>
            <p className='text-sm text-muted-foreground'>Enhanced DIR-3 statutory profiling with address history.</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-8'>
          {directors.map((director, index) => (
            <Card key={director.id} className='border-none shadow-2xl relative overflow-hidden bg-white'>
              <div className='absolute top-0 left-0 w-1.5 h-full bg-blue-600' />
              <CardHeader className='flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30'>
                <CardTitle className='text-lg flex items-center gap-2'>
                   <User className='h-5 w-5 text-blue-600' />
                   Director {index + 1}: Statutory Profile
                </CardTitle>
                {directors.length > 1 && (
                  <Button variant='ghost' size='icon' className='text-red-500 hover:text-red-700' onClick={() => handleRemoveDirector(director.id)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </CardHeader>
              <CardContent className='pt-8 space-y-8'>
                {/* Identity Section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>Full Name</Label>
                    <Input 
                      value={director.full_name} 
                      onChange={(e) => updateDirector(director.id, 'full_name', e.target.value.toUpperCase())}
                      className='bg-slate-50/50 h-11'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>Father's Name</Label>
                    <Input 
                      value={director.father_name} 
                      onChange={(e) => updateDirector(director.id, 'father_name', e.target.value.toUpperCase())}
                      className='bg-slate-50/50 h-11'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>PAN Identification</Label>
                    <div className='relative'>
                      <Fingerprint className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                      <Input 
                        placeholder='ABCDE1234F'
                        value={director.pan_number} 
                        onChange={(e) => updateDirector(director.id, 'pan_number', e.target.value.toUpperCase())}
                        className='pl-10 bg-slate-50/50 h-11 font-mono'
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>Stay Duration (Years)</Label>
                    <div className='relative'>
                        <Clock className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                        <Input 
                        placeholder='Ex: 5 Years' 
                        value={director.duration_of_stay}
                        onChange={(e) => updateDirector(director.id, 'duration_of_stay', e.target.value)}
                        className='pl-10 bg-slate-50/50 h-11'
                        />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className='space-y-4 pt-6 border-t border-slate-50'>
                   <div className='flex items-center justify-between'>
                      <Label className='text-[10px] font-bold uppercase text-blue-600'>Residential Address Details</Label>
                      <div className='flex items-center space-x-2'>
                         <span className='text-[10px] text-slate-400 font-medium'>Permanent same as Present?</span>
                         <Switch 
                           checked={director.is_same_address}
                           onCheckedChange={(val) => updateDirector(director.id, 'is_same_address', val)}
                         />
                      </div>
                   </div>
                   <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label className='text-[10px] text-slate-500'>Present Address</Label>
                        <div className='relative'>
                            <Home className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                            <textarea 
                                value={director.present_address}
                                onChange={(e) => updateDirector(director.id, 'present_address', e.target.value)}
                                className='w-full min-h-[80px] pl-10 pt-2 text-sm rounded-md border border-input bg-slate-50/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                                placeholder='Full present address...'
                            />
                        </div>
                      </div>
                      {!director.is_same_address && (
                        <div className='space-y-2 animate-in fade-in zoom-in-95'>
                            <Label className='text-[10px] text-slate-500'>Permanent Address</Label>
                            <div className='relative'>
                                <MapPin className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                                <textarea 
                                    value={director.permanent_address}
                                    onChange={(e) => updateDirector(director.id, 'permanent_address', e.target.value)}
                                    className='w-full min-h-[80px] pl-10 pt-2 text-sm rounded-md border border-input bg-slate-50/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                                    placeholder='Full permanent address...'
                                />
                            </div>
                        </div>
                      )}
                   </div>
                </div>

                {/* Contact Section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50'>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>Email for Authentication</Label>
                    <div className='relative'>
                        <Mail className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                        <Input 
                        type='email'
                        value={director.email}
                        onChange={(e) => updateDirector(director.id, 'email', e.target.value.toLowerCase())}
                        className='pl-10 bg-slate-50/50 h-11'
                        />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-bold uppercase text-slate-400'>Mobile Number</Label>
                    <div className='relative'>
                        <Phone className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                        <Input 
                        value={director.mobile}
                        onChange={(e) => updateDirector(director.id, 'mobile', e.target.value)}
                        className='pl-10 bg-slate-50/50 h-11'
                        />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant='outline' className='w-full border-dashed py-8 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all group' onClick={handleAddDirector}>
            <Plus className='mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300' /> Add Proposed Director
          </Button>

          <div className='flex justify-between gap-3 pt-6'>
            <Button variant='outline' className='gap-2 rounded-xl h-11' onClick={() => navigate({ to: '/admin/compliance/incorporation/dsc' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button className='px-10 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-xl h-11' onClick={handleComplete} disabled={isProcessing}>
              {isProcessing ? 'Saving Details...' : 'Submit Final DIN Applications'}
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='bg-blue-600/5 border-blue-600/10 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-blue-800'>
                <Bot className='h-4 w-4' />
                Agent Address Audit
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-xs leading-relaxed text-blue-900/80 text-justify italic'>
                "I am monitoring the 'Duration of Stay'. MCA usually expects at least 1 year of residence history. If it is less, additional proofs may be required."
              </p>
              <div className='pt-2 space-y-2 border-t border-blue-100'>
                <div className='flex items-center gap-2 text-[10px] text-blue-700'>
                  <ShieldCheck className='h-3.5 w-3.5 text-blue-600' />
                  <span>Statutory History Logging Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
