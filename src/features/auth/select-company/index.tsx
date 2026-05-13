import { useNavigate } from '@tanstack/react-router'
import { Building2, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SelectCompany() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const handleSelect = (company: any) => {
    auth.setSelectedCompany(company)
    navigate({ to: '/', replace: true })
  }

  if (auth.companies.length === 0) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>No companies associated with your account.</p>
      </div>
    )
  }

  return (
    <div className='container relative flex h-screen flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Select Company
          </h1>
          <p className='text-sm text-muted-foreground'>
            Please select a company to manage its compliance.
          </p>
        </div>

        <div className='grid gap-4'>
          {auth.companies.map((company) => (
            <Card 
              key={company.company_id} 
              className='cursor-pointer hover:border-primary transition-all duration-200 group'
              onClick={() => handleSelect(company)}
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                <div className='flex items-center space-x-4'>
                  <div className='p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors'>
                    <Building2 className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>{company.company_name}</CardTitle>
                    <CardDescription>{company.is_primary ? 'Primary Company' : 'Associate Company'}</CardDescription>
                  </div>
                </div>
                <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
              </CardHeader>
            </Card>
          ))}
        </div>

        <Button 
          variant='ghost' 
          className='mt-4'
          onClick={() => navigate({ to: '/sign-in', replace: true })}
        >
          Back to Login
        </Button>
      </div>
    </div>
  )
}
