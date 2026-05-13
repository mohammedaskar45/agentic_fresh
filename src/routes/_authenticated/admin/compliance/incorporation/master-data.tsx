import { createFileRoute } from '@tanstack/react-router'
import MasterDataForm from '@/features/incorporation/components/master-data-form'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/admin/compliance/incorporation/master-data',
)({
  component: MasterDataRoute,
})

function MasterDataRoute() {
  const navigate = useNavigate()
  
  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Step 0: Master Data Profiling</h1>
        <p className='text-sm text-muted-foreground'>Initialize the statutory data required for the incorporation process.</p>
      </div>
      
      <MasterDataForm 
        onSuccess={() => {
          navigate({ to: '/admin/compliance/incorporation' })
        }} 
      />
    </div>
  )
}
