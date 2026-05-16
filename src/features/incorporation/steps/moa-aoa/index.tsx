import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  FileText, 
  Sparkles, 
  Eye, 
  Download, 
  CheckCircle2, 
  Bot, 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileBadge,
  RotateCcw,
  Loader2,
  Calendar,
  RefreshCcw,
  HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { incorporationService } from '@/services/incorporation.service'
import { pdfService } from '@/lib/pdf-service'

interface DraftDoc {
    id: string
    title: string
    category: string
    content: string
}

export default function DraftingHub() {
  const navigate = useNavigate()
  const workflow = useWorkflowStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [documents, setDocuments] = useState<DraftDoc[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DraftDoc | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const data = await incorporationService.generateDrafts()
      if (Array.isArray(data)) {
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const data = await incorporationService.generateDrafts()
      setDocuments(data)
      toast.success('All 18 statutory documents regenerated with AI!')
    } catch (error) {
      toast.error('Failed to regenerate drafts. Ensure Step 0 is complete.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = async () => {
    try {
      await incorporationService.saveMoaAoa({ drafting_completed: true })
      workflow.completeStep(4)
      toast.success('Step 4: Statutory Drafting Completed!')
      navigate({ to: '/admin/compliance/incorporation' })
    } catch (error) {
      toast.error('Failed to save progress.')
    }
  }

  const handleDownload = () => {
    if (!selectedDoc) return
    pdfService.generateStatutoryPDF(selectedDoc.title, selectedDoc.content, 'the Company')
  }

  const categories = ['Constitutional', 'Pre-Incorporation', 'Other Statutory']

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* Header with Stats and Actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
            <div className='p-3 bg-white rounded-2xl shadow-sm border border-slate-100'>
                <FileText className='h-6 w-6 text-purple-600' />
            </div>
            <div>
                <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Step 4: Statutory Drafting Hub</h1>
                <p className='text-slate-500 text-sm'>AI-powered generation of foundational constitutional documents.</p>
            </div>
        </div>
        <div className='flex items-center gap-3'>
            <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className='gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 rounded-xl px-6'
            >
                {isGenerating ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCcw className='h-4 w-4' />}
                Regenerate All Drafts
            </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-8'>
          {categories.map((cat) => (
            <div key={cat} className='space-y-4'>
                <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2'>
                    {cat} Documents
                    <Badge variant='secondary' className='text-[10px] py-0'>{documents.filter(d => d.category === cat).length}</Badge>
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {documents.filter(d => d.category === cat).map((doc) => (
                        <Card key={doc.id} className='group hover:border-purple-300 transition-all cursor-pointer' onClick={() => { setSelectedDoc(doc); setIsPreviewOpen(true); }}>
                            <CardContent className='p-4 flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-slate-100 rounded-lg group-hover:bg-purple-50 transition-colors'>
                                        <FileText className='h-5 w-5 text-slate-500 group-hover:text-purple-600' />
                                    </div>
                                    <div>
                                        <p className='text-sm font-medium leading-tight'>{doc.title}</p>
                                        <p className='text-[10px] text-slate-400 mt-1 uppercase font-bold'>Ready for Review</p>
                                    </div>
                                </div>
                                <Eye className='h-4 w-4 text-slate-300 group-hover:text-purple-500' />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          ))}

          <div className='flex justify-between gap-3 pt-6 border-t'>
            <Button variant='outline' className='gap-2' onClick={() => navigate({ to: '/admin/compliance/incorporation/run' })}>
              <ChevronLeft className='h-4 w-4' /> Back
            </Button>
            <Button 
                className='px-10 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20 rounded-xl'
                onClick={handleComplete}
            >
              Confirm All Drafts & Proceed <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <Card className='bg-purple-600/5 border-purple-600/10 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center gap-2 text-purple-800'>
                <Bot className='h-4 w-4' />
                AI Drafting Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-xs leading-relaxed text-purple-900/80 italic'>
                "I have drafted the 18 statutory documents using your Master Data. I've automatically optimized the MoA Object Clause for MCA compliance based on your NIC selection."
              </p>
              <div className='pt-2 space-y-2 border-t border-purple-100'>
                <div className='flex items-center gap-2 text-[10px] text-purple-700'>
                  <ShieldCheck className='h-3.5 w-3.5 text-purple-600' />
                  <span>Legally Validated Templates</span>
                </div>
                <div className='flex items-center gap-2 text-[10px] text-purple-700'>
                  <FileBadge className='h-3.5 w-3.5 text-purple-600' />
                  <span>Section 10 Compliance Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='sm:max-w-[1400px] w-[95vw] max-h-[94vh] overflow-hidden flex flex-col p-0 bg-slate-50 border-none shadow-2xl rounded-3xl'>
          <DialogHeader className='p-8 bg-white border-b shrink-0'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-purple-600 rounded-2xl shadow-xl shadow-purple-600/20'>
                        <FileText className='h-6 w-6 text-white' />
                    </div>
                    <div>
                        <DialogTitle className='text-2xl font-bold'>{selectedDoc?.title}</DialogTitle>
                        <DialogDescription className='text-base'>Statutory Draft Preview - System Generated & AI Validated</DialogDescription>
                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <Button variant='outline' size='lg' onClick={() => setIsPreviewOpen(false)} className='rounded-xl'>Close</Button>
                    <Button size='lg' className='gap-2 bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-600/20 rounded-xl px-8' onClick={handleDownload}>
                        <Download className='h-5 w-5' /> Download Official PDF
                    </Button>
                </div>
            </div>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto p-12 bg-slate-100/30 flex justify-center items-start'>
            {/* The "Legal Paper" Container - Expanded width */}
            <div className='w-full max-w-[950px] bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] border border-slate-200 min-h-[1200px] relative p-24 font-serif text-[17px] leading-[1.8] text-slate-800 text-justify overflow-hidden'>
                
                {/* Stamp Paper Header Effect */}
                <div className='absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-50/50 to-white border-b-8 border-double border-amber-100/30 flex items-center justify-center pointer-events-none'>
                    <div className='border-2 border-amber-200/20 p-3 rounded-full'>
                        <div className='w-20 h-20 border-4 border-amber-300/10 rounded-full flex items-center justify-center font-bold text-amber-600/10 text-[10px] uppercase tracking-[0.3em] text-center'>
                            Government <br/> Of India
                        </div>
                    </div>
                </div>

                {/* Legal Margins (The Blue/Red Lines) */}
                <div className='absolute top-0 bottom-0 left-12 w-[1px] bg-blue-300/30' />
                <div className='absolute top-0 bottom-0 left-14 w-[1px] bg-blue-300/30' />
                <div className='absolute top-0 bottom-0 left-16 w-[1px] bg-red-400/20' />

                {/* Watermark */}
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden'>
                    <span className='text-[100px] font-black text-slate-100/50 -rotate-45 uppercase tracking-widest whitespace-nowrap'>
                        AGENTIC COMPLIANCE
                    </span>
                </div>

                {/* Paper Texture Overlay */}
                <div className='absolute inset-0 opacity-[0.04] pointer-events-none bg-[url("https://www.transparenttextures.com/patterns/paper-fibers.png")]' />

                {/* Content Area */}
                <div className='relative z-10 space-y-6'>
                    {/* Placeholder for Dynamic Content */}
                    <div className='whitespace-pre-wrap leading-relaxed'>
                        {selectedDoc?.content}
                    </div>

                    {/* Realistic Signature Area */}
                    <div className='mt-20 pt-8 border-t border-slate-100 flex justify-between items-start'>
                        <div className='space-y-1'>
                            <p className='text-xs font-bold uppercase text-slate-400 tracking-wider'>Place:</p>
                            <p className='text-sm'>Chennai, India</p>
                            <p className='text-xs font-bold uppercase text-slate-400 tracking-wider pt-4'>Date:</p>
                            <p className='text-sm'>{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className='text-right space-y-4'>
                            <div className='w-48 h-12 border-b border-dashed border-slate-300 flex items-end justify-center pb-1'>
                                <span className='font-signature text-purple-300 text-lg opacity-40 select-none'>Digital Signature Applied</span>
                            </div>
                            <div className='space-y-0.5'>
                                <p className='text-sm font-bold uppercase'>[Authorized Signatory]</p>
                                <p className='text-[10px] text-slate-500 uppercase tracking-tighter italic'>Electronically Generated via Agentic AI Hub</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Page Number Placeholder */}
                <div className='absolute bottom-8 left-0 right-0 flex justify-center text-[10px] text-slate-300 uppercase font-bold tracking-widest'>
                    Page 1 of 1
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
