import { createFileRoute } from '@tanstack/react-router'
import SelectCompany from '@/features/auth/select-company'

export const Route = createFileRoute('/(auth)/select-company')({
  component: SelectCompany,
})
