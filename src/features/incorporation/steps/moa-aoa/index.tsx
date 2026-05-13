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
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    pdfService.generateStatutoryPDF(selectedDoc.title, selectedDoc.content, 'AGENTIC COMPLIANCE SOLUTIONS') // Fallback name
  }

  const categories = ['Constitutional', 'Pre-Incorporation', 'Board Meeting', 'Auditor', 'Commencement', 'Other Statutory']

  return (
    <div className='p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/compliance/incorporation' })}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='p-3 bg-purple-500/10 rounded-2xl'>
            <Sparkles className='h-8 w-8 text-purple-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Step 4: Statutory Drafting Hub</h1>
            <p className='text-sm text-muted-foreground'>AI-powered generation of all 18 mandatory statutory documents.</p>
          </div>
        </div>
        <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            variant='outline'
            className='gap-2 border-purple-200 text-purple-700 hover:bg-purple-50'
        >
          {isGenerating ? <Loader2 className='h-4 w-4 animate-spin' /> : <RotateCcw className='h-4 w-4' />}
          Regenerate All Drafts
        </Button>
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
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-purple-600' />
                {selectedDoc?.title}
            </DialogTitle>
            <DialogDescription>
                Statutory Draft Preview - System Generated
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 p-12 bg-[#fdfdfb] border shadow-inner min-h-[600px] font-serif text-sm leading-relaxed whitespace-pre-wrap relative overflow-hidden'>
            {/* Paper Texture Overlay */}
            <div className='absolute inset-0 opacity-[0.03] pointer-events-none bg-[url("https://www.transparenttextures.com/patterns/paper-fibers.png")]' />
            {selectedDoc?.content}
          </div>
          <div className='flex justify-end gap-3 mt-6'>
            <Button variant='outline' onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button className='gap-2 bg-purple-600 hover:bg-purple-700' onClick={handleDownload}>
                <Download className='h-4 w-4' /> Download Official PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
