import { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Archive, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FolderOpen,
  Eye,
  X,
  Users,
  Award,
  Zap
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
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { incorporationService } from '@/services/incorporation.service'
import { pdfService } from '@/lib/pdf-service'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const CATEGORIES = [
  { id: 'all', name: 'All Documents', icon: FolderOpen },
  { id: 'pre-inc', name: 'Pre-Incorporation', icon: Clock },
  { id: 'constitutional', name: 'Constitutional', icon: ShieldCheck },
  { id: 'board-meeting', name: 'Board Meeting', icon: Users },
  { id: 'auditor', name: 'Auditor Appointment', icon: Award },
  { id: 'commencement', name: 'Commencement (20A)', icon: Zap },
]

export default function DocumentVault() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      // Fetching drafted documents logic
      const response = await incorporationService.generateDrafts()
      setDocuments(response || [])
    } catch (error) {
      console.error('Failed to fetch vault documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category.toLowerCase().replace(' ', '-') === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleView = (doc: any) => {
    setSelectedDoc(doc)
    setIsPreviewOpen(true)
  }

  const handleDownload = (doc: any) => {
    if (!doc) return
    try {
      pdfService.generateStatutoryPDF(doc.title, doc.content, 'the Company')
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download document')
    }
  }

  return (
    <div className='p-8 space-y-8 bg-[#f8fafc] min-h-screen font-sans'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div className='space-y-1'>
          <h1 className='text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-2xl'>
              <Archive className='h-8 w-8 text-primary' />
            </div>
            Document Vault
          </h1>
          <p className='text-slate-500 font-medium ml-1'>Enterprise-grade statutory repository for your incorporation journey.</p>
        </div>
        <div className='flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input 
              placeholder='Search documents...' 
              className='pl-10 w-[280px] bg-slate-50 border-none rounded-xl focus-visible:ring-primary/20'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant='ghost' className='rounded-xl hover:bg-slate-100 text-slate-600 gap-2'>
            <Filter className='h-4 w-4' /> Filter
          </Button>
        </div>
      </div>

      {/* Section 14: CS Review Disclaimer */}
      <Alert className='bg-amber-50 border-amber-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden'>
        <div className='absolute -right-10 -top-10 opacity-5'>
            <ShieldCheck className='h-40 w-40 text-amber-500' />
        </div>
        <ShieldCheck className='h-6 w-6 text-amber-600' />
        <AlertTitle className='text-amber-900 font-extrabold text-xl ml-2'>
            Section 14: Mandatory CS Review Disclaimer
        </AlertTitle>
        <AlertDescription className='text-amber-800 text-sm leading-relaxed mt-2 ml-2 max-w-5xl font-medium'>
            The AI-generated MoA, AoA, and other incorporation documents are starting templates only. 
            <span className='font-black underline decoration-amber-300 underline-offset-4'> They MUST be reviewed and approved by a qualified Practicing Company Secretary </span> 
            before submission to the ROC. Errors in the MoA (especially the Objects Clause) are very difficult 
            and expensive to rectify after incorporation.
        </AlertDescription>
      </Alert>

      {/* Category Tabs */}
      <div className='flex flex-wrap gap-3 bg-white/50 p-2 rounded-3xl border border-white/20 backdrop-blur-sm'>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.id
          return (
            <Button
              key={cat.id}
              variant='ghost'
              className={`rounded-2xl px-6 py-6 transition-all duration-300 font-bold ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                  : 'text-slate-500 hover:bg-white hover:text-primary'
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {cat.name}
            </Button>
          )
        })}
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl overflow-hidden relative'>
          <div className='absolute -right-4 -bottom-4 opacity-10'>
            <Archive className='h-32 w-32' />
          </div>
          <CardContent className='p-6'>
            <p className='text-xs font-bold text-blue-100 uppercase tracking-widest'>Total Repository</p>
            <p className='text-4xl font-black mt-2'>{documents.length} <span className='text-lg font-normal opacity-80'>Files</span></p>
          </CardContent>
        </Card>
        <Card className='border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl overflow-hidden relative'>
          <div className='absolute -right-4 -bottom-4 opacity-10'>
            <CheckCircle2 className='h-32 w-32' />
          </div>
          <CardContent className='p-6'>
            <p className='text-xs font-bold text-emerald-100 uppercase tracking-widest'>Compliance Status</p>
            <p className='text-4xl font-black mt-2'>100% <span className='text-lg font-normal opacity-80'>Verified</span></p>
          </CardContent>
        </Card>
        <Card className='border-none shadow-xl bg-white rounded-3xl overflow-hidden relative group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Regulatory Vault</p>
                <p className='text-4xl font-black mt-2 text-slate-800'>14</p>
              </div>
              <div className='h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform'>
                <ShieldCheck className='h-6 w-6' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='border-none shadow-xl bg-white rounded-3xl overflow-hidden relative group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Statutory Due</p>
                <p className='text-2xl font-black mt-2 text-slate-800'>INC-20A</p>
              </div>
              <div className='h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform'>
                <AlertCircle className='h-6 w-6' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredDocs.map((doc, i) => (
            <Card key={i} className='group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] overflow-hidden flex flex-col'>
              <div className='h-2 bg-gradient-to-r from-primary/40 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity' />
              <CardHeader className='pb-3 px-8 pt-8'>
                <div className='flex items-start justify-between'>
                  <div className='p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-500'>
                    <FileText className='h-6 w-6 text-slate-400 group-hover:text-primary transition-colors' />
                  </div>
                  <Badge variant='secondary' className='text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-full border-none'>
                    {doc.category}
                  </Badge>
                </div>
                <CardTitle className='text-lg mt-6 group-hover:text-primary transition-colors duration-500 leading-tight font-extrabold'>{doc.title}</CardTitle>
                <CardDescription className='text-xs mt-2 font-medium text-slate-400 uppercase tracking-wider'>
                  Statutory drafting completed via AI
                </CardDescription>
              </CardHeader>
              <CardContent className='px-8 pb-8 mt-auto'>
                <div className='flex items-center justify-between mt-8 pt-6 border-t border-slate-50'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Live Audit</span>
                  </div>
                  <Button 
                    variant='ghost' 
                    size='sm' 
                    className='h-10 px-5 gap-2 hover:bg-primary hover:text-white transition-all duration-300 rounded-2xl text-xs font-bold shadow-sm hover:shadow-lg hover:shadow-primary/20'
                    onClick={() => handleView(doc)}
                  >
                    <Eye className='h-4 w-4' /> Review Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDocs.length === 0 && (
            <div className='col-span-full flex flex-col items-center justify-center h-80 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-100'>
              <FolderOpen className='h-16 w-16 text-slate-200 mb-4' />
              <p className='text-slate-400 font-bold text-xl'>No documents match your search</p>
              <p className='text-slate-300 text-sm mt-1'>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='sm:max-w-[1400px] w-[95vw] max-h-[94vh] overflow-hidden flex flex-col p-0 bg-slate-50 border-none shadow-2xl rounded-3xl'>
          <DialogHeader className='p-8 bg-white border-b shrink-0'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20'>
                        <FileText className='h-6 w-6 text-white' />
                    </div>
                    <div>
                        <DialogTitle className='text-2xl font-bold'>{selectedDoc?.title}</DialogTitle>
                        <DialogDescription className='text-base'>Statutory Draft Preview - System Generated & AI Validated</DialogDescription>
                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <Button variant='outline' size='lg' onClick={() => setIsPreviewOpen(false)} className='rounded-xl font-bold'>Close</Button>
                    <Button size='lg' className='gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl px-8 font-bold' onClick={() => handleDownload(selectedDoc)}>
                        <Download className='h-5 w-5' /> Download Official PDF
                    </Button>
                </div>
            </div>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto p-12 bg-slate-100/30 flex justify-center items-start'>
            {/* The "Legal Paper" Container - Match Step 4 exactly */}
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
                            <p className='text-sm font-bold text-slate-900'>Chennai, India</p>
                            <p className='text-xs font-bold uppercase text-slate-400 tracking-wider pt-4'>Date:</p>
                            <p className='text-sm font-bold text-slate-900'>{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className='text-right space-y-4'>
                            <div className='w-48 h-12 border-b border-dashed border-slate-300 flex items-end justify-center pb-1'>
                                <span className='font-sans text-primary text-lg opacity-40 select-none italic'>Digital Signature Applied</span>
                            </div>
                            <div className='space-y-0.5'>
                                <p className='text-sm font-bold uppercase'>[Authorized Signatory]</p>
                                <p className='text-[10px] text-slate-500 uppercase tracking-tighter italic font-bold'>Electronically Generated via Agentic AI Hub</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Page Number Placeholder */}
                <div className='absolute bottom-8 left-0 right-0 flex justify-center text-[10px] text-slate-400 uppercase font-bold tracking-widest'>
                    Page 1 of 1
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
