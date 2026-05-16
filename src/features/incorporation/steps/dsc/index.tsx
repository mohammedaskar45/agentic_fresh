import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Fingerprint, 
  User, 
  IdCard, 
  UploadCloud, 
  ShieldCheck,
  CheckCircle2,
  Bot,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { UploadGate } from '../../components/upload-gate'
import { cn } from '@/lib/utils'

export default function DSCStep() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeDirectorId, setActiveDirectorId] = useState<string | null>(null)
  
  const [directors, setDirectors] = useState<any[]>([])

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dscRes, masterRes] = await Promise.all([
          incorporationService.getDsc(),
          incorporationService.getMasterData()
        ])

        if (masterRes && masterRes.stakeholders) {
          const stakeholders = masterRes.stakeholders;
          
          // Merge existing DSC data with stakeholders
          const mergedDirectors = stakeholders.map((s: any) => {
            const existingDsc = dscRes?.dsc_data?.directors?.find((d: any) => d.id === s.inc_stakeholder_id);
            return {
              id: s.inc_stakeholder_id,
              full_name: s.full_name || '',
              dob: s.dob || '',
              father_name: s.father_name || '',
              nationality: s.nationality || 'Indian',
              pan: s.pan || '',
              aadhaar: s.aadhaar || '',
              is_verified: existingDsc?.is_verified || false,
              status: existingDsc?.status || 'pending'
            }
          });

          setDirectors(mergedDirectors);
          if (mergedDirectors.length > 0) setActiveDirectorId(mergedDirectors[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch DSC data:', error)
      }
    }
    fetchData()
  }, [])

  const activeDirector = directors.find(d => d.id === activeDirectorId)

  const updateActiveDirector = (field: string, value: any) => {
    setDirectors(prev => prev.map(d => d.id === activeDirectorId ? { ...d, [field]: value } : d))
  }

  const handleOcrSimulate = () => {
    setIsAiProcessing(true)
    setTimeout(() => {
      setIsAiProcessing(false)
      toast.success('AI successfully extracted details from PAN card!')
    }, 2000)
  }

  const handleComplete = async () => {
    const allVerified = directors.every(d => d.is_verified);
    if (!allVerified && directors.length > 0) {
       toast.error('Please complete identity verification for all directors.');
       return;
    }

    setIsSaving(true)
    try {
      await incorporationService.saveDsc({ directors })
      workflow.completeStep(1)
      toast.success('Step 1: All Director DSC Applications Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Failed to save DSC data.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='p-6 space-y-8 animate-in fade-in duration-500'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-primary/10 rounded-2xl shadow-inner'>
            <Fingerprint className='h-8 w-8 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Step 1: Digital Signature Acquisition</h1>
            <p className='text-sm text-muted-foreground'>Track and verify DSC status for all proposed directors.</p>
          </div>
        </div>
        <div className='flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full border border-green-500/20'>
          <ShieldCheck className='h-4 w-4' />
          <span className='text-xs font-bold uppercase tracking-wider'>MCA 2026 Compliant</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left: Director List Sidebar */}
        <div className='lg:col-span-4 space-y-4'>
           <h3 className='text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 ml-1'>Proposed Directors</h3>
           <div className='space-y-3'>
              {directors.map((d) => (
                <div 
                  key={d.id}
                  onClick={() => setActiveDirectorId(d.id)}
                  className={cn(
                    'group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer',
                    activeDirectorId === d.id 
                      ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5 scale-[1.02]' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  )}
                >
                  <div className='flex items-center gap-4'>
                    <div className={cn(
                      'p-3 rounded-xl transition-colors',
                      d.is_verified 
                        ? 'bg-green-100 text-green-600' 
                        : activeDirectorId === d.id ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'
                    )}>
                      <User className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-800'>{d.full_name || 'Unnamed Director'}</p>
                      <div className='flex items-center gap-1.5 mt-0.5'>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          d.is_verified ? 'bg-green-500' : 'bg-slate-300'
                        )} />
                        <p className='text-[9px] font-bold text-muted-foreground uppercase tracking-tighter'>{d.status}</p>
                      </div>
                    </div>
                  </div>
                  {activeDirectorId === d.id ? (
                    <ChevronRight className='h-4 w-4 text-primary' />
                  ) : d.is_verified ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : null}
                </div>
              ))}
           </div>

           <Card className='mt-8 border-dashed border-2 bg-slate-50/50 shadow-none border-slate-200'>
              <CardContent className='p-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <Bot className='h-4 w-4 text-primary' />
                  <span className='text-[10px] font-bold uppercase text-slate-500'>Agentic Rule Engine</span>
                </div>
                <p className='text-[11px] leading-relaxed text-slate-400 italic'>
                  "As per Section 7, all subscribers to the MoA must have a valid DSC. I am monitoring the verification status for each."
                </p>
              </CardContent>
           </Card>
        </div>

        {/* Right: Form Sections */}
        <div className='lg:col-span-8 space-y-6'>
          {activeDirector ? (
            <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
              <Card className='border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white rounded-3xl'>
                <div className='h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30' />
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-xl font-bold flex items-center gap-2'>
                        Director Profiling: {activeDirector.full_name}
                      </CardTitle>
                      <CardDescription className='text-xs'>Statutory identity validation for Class 3 Certificate.</CardDescription>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase',
                      activeDirector.is_verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    )}>
                      {activeDirector.is_verified ? 'Verified' : 'Pending Verification'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6 space-y-8'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Full Name (As per PAN)</Label>
                      <Input 
                        value={activeDirector.full_name}
                        onChange={(e) => updateActiveDirector('full_name', e.target.value.toUpperCase())}
                        className='bg-slate-50/50 h-11 focus:bg-white transition-all'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Date of Birth</Label>
                      <Input 
                        type='date' 
                        value={activeDirector.dob}
                        onChange={(e) => updateActiveDirector('dob', e.target.value)}
                        className='bg-slate-50/50 h-11 focus:bg-white transition-all'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Father's Name</Label>
                      <Input 
                        value={activeDirector.father_name}
                        onChange={(e) => updateActiveDirector('father_name', e.target.value.toUpperCase())}
                        className='bg-slate-50/50 h-11 focus:bg-white transition-all'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Nationality</Label>
                      <Input 
                        value={activeDirector.nationality}
                        onChange={(e) => updateActiveDirector('nationality', e.target.value)}
                        className='bg-slate-50/50 h-11 focus:bg-white transition-all'
                      />
                    </div>
                  </div>

                  <Separator className='bg-slate-100' />

                  <div className='flex items-center justify-between'>
                    <h3 className='text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2'>
                      <IdCard className='h-4 w-4 text-primary' />
                      Identity Extraction
                    </h3>
                    <Button 
                      variant='outline' 
                      size='sm' 
                      className='text-[10px] font-bold h-8 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
                      onClick={handleOcrSimulate}
                    >
                      <Bot className='h-3 w-3' />
                      AI OCR SYNC
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Permanent Account Number (PAN)</Label>
                      <Input 
                        value={activeDirector.pan}
                        className='uppercase bg-slate-50/50 h-11 font-mono tracking-wider' 
                        maxLength={10} 
                        onChange={(e) => updateActiveDirector('pan', e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-bold uppercase text-slate-400'>Aadhaar Virtual ID / UID</Label>
                      <Input 
                        value={activeDirector.aadhaar}
                        maxLength={12} 
                        className='bg-slate-50/50 h-11 font-mono tracking-wider'
                        onChange={(e) => updateActiveDirector('aadhaar', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Upload Section */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div 
                      className='border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden'
                      onClick={() => document.getElementById('pan-upload')?.click()}
                    >
                      <input 
                        id='pan-upload'
                        type='file'
                        className='hidden'
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              await incorporationService.uploadDocument(1, file)
                              toast.success('PAN Card uploaded successfully')
                            } catch (err) {
                              toast.error('Upload failed')
                            }
                          }
                        }}
                      />
                      <div className='p-3 bg-slate-100 group-hover:bg-primary/20 rounded-xl transition-colors'>
                        <UploadCloud className='h-6 w-6 text-slate-400 group-hover:text-primary' />
                      </div>
                      <div className='text-center'>
                         <p className='text-xs font-bold text-slate-700'>PAN Card Copy</p>
                         <p className='text-[10px] text-slate-400'>Click to browse (.pdf, .jpg)</p>
                      </div>
                    </div>

                    <div 
                      className='border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden'
                      onClick={() => document.getElementById('aadhaar-upload')?.click()}
                    >
                      <input 
                        id='aadhaar-upload'
                        type='file'
                        className='hidden'
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              await incorporationService.uploadDocument(1, file)
                              toast.success('Aadhaar Card uploaded successfully')
                            } catch (err) {
                              toast.error('Upload failed')
                            }
                          }
                        }}
                      />
                      <div className='p-3 bg-slate-100 group-hover:bg-primary/20 rounded-xl transition-colors'>
                        <UploadCloud className='h-6 w-6 text-slate-400 group-hover:text-primary' />
                      </div>
                      <div className='text-center'>
                         <p className='text-xs font-bold text-slate-700'>Aadhaar Proof</p>
                         <p className='text-[10px] text-slate-400'>Click to browse (.pdf, .jpg)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className='mt-8'>
                <UploadGate 
                  stepId={1} 
                  subId={activeDirector.id}
                  docTitle={`Signed DSC App: ${activeDirector.full_name}`} 
                  onVerified={() => {
                    updateActiveDirector('is_verified', true)
                    updateActiveDirector('status', 'verified')
                    toast.success(`${activeDirector.full_name}'s DSC Application Verified!`)
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className='h-[500px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200'>
               <div className='p-6 bg-white rounded-full shadow-sm'>
                  <User className='h-12 w-12 text-slate-300' />
               </div>
               <div>
                  <p className='text-slate-500 font-bold'>No Director Selected</p>
                  <p className='text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed'>Select a director from the sidebar to manage their statutory DSC application.</p>
               </div>
            </div>
          )}

          <div className='flex justify-end gap-3 pt-10'>
            <Button variant='ghost' className='text-slate-400 hover:text-slate-600'>Save Draft</Button>
            <Button 
              className='px-12 bg-primary text-white shadow-xl shadow-primary/30 rounded-2xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]'
              onClick={handleComplete}
              disabled={isSaving}
            >
              {isSaving ? 'Synchronizing...' : 'Final Submission (Step 1)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
