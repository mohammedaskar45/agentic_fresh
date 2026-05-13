import { createFileRoute } from '@tanstack/react-router'
import LaborStep from '@/features/incorporation/steps/labor'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/labor')({
  component: LaborStep,
})
