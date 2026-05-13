import { createFileRoute } from '@tanstack/react-router'
import BankStep from '@/features/incorporation/steps/bank'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/bank')({
  component: BankStep,
})
