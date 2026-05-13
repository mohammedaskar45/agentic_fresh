import { ShieldCheck } from 'lucide-react'

export function AppTitle() {
  return (
    <div className='flex items-center gap-2 px-2'>
      <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
        <ShieldCheck className='size-5' />
      </div>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-bold text-lg'>Agentic</span>
        <span className='truncate text-xs text-muted-foreground'>Compliance Platform</span>
      </div>
    </div>
  )
}
