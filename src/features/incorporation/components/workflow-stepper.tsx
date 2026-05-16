import { cn } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  documentStatus?: 'NOT STARTED' | 'DRAFT READY' | 'DOWNLOADED' | 'PENDING UPLOAD' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
}

interface WorkflowStepperProps {
  steps: Step[]
  currentStepId: number
  onStepClick?: (stepId: number) => void
}

export function WorkflowStepper({ steps, currentStepId, onStepClick }: WorkflowStepperProps) {
  return (
    <div className='relative space-y-4'>
      {steps.map((step, idx) => (
        <div key={step.id} className='relative flex items-start group'>
          {/* Connector Line */}
          {idx !== steps.length - 1 && (
            <div 
              className={cn(
                'absolute left-4 top-10 w-0.5 h-full -ml-px transition-colors duration-500',
                step.status === 'completed' ? 'bg-primary' : 'bg-muted'
              )} 
            />
          )}

          <div className='flex items-center space-x-4 w-full'>
            <div className='relative flex items-center justify-center'>
              <div 
                className={cn(
                  'z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                  step.status === 'completed' ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 
                  step.status === 'current' ? 'bg-background border-primary text-primary animate-pulse shadow-md shadow-primary/10' : 
                  'bg-background border-muted text-muted-foreground'
                )}
              >
                {step.status === 'completed' ? (
                  <Check className='size-4 font-bold' />
                ) : (
                  <span className='text-xs font-semibold'>{step.id}</span>
                )}
              </div>
            </div>

            <div 
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                'flex flex-1 flex-col p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer active:scale-95',
                step.status === 'current' ? 'bg-primary/5 border-primary/20 scale-[1.02]' : 'bg-card border-transparent'
              )}
            >
              <div className='flex items-center justify-between'>
                <h4 className={cn(
                  'font-semibold text-sm',
                  step.status === 'current' ? 'text-primary' : 'text-foreground'
                )}>
                  {step.title}
                </h4>
                {step.status === 'current' ? (
                  <span className='px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full'>
                    In Progress
                  </span>
                ) : step.status === 'completed' && (
                  <span className='px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full'>
                    Verified
                  </span>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>{step.description}</p>
              
              {/* Document Lifecycle Badge (Section 11) */}
              {step.documentStatus && step.documentStatus !== 'NOT STARTED' && (
                <div className='mt-3 flex items-center gap-2'>
                  <div className={cn(
                    'px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border',
                    step.documentStatus === 'DRAFT READY' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    step.documentStatus === 'DOWNLOADED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    step.documentStatus === 'PENDING UPLOAD' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    step.documentStatus === 'UPLOADED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    step.documentStatus === 'VERIFIED' ? 'bg-green-500 text-white border-green-600' :
                    step.documentStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400'
                  )}>
                    {step.documentStatus}
                  </div>
                  {step.documentStatus === 'PENDING UPLOAD' && (
                    <span className='text-[8px] font-bold text-orange-400 animate-pulse'>Action Required</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
