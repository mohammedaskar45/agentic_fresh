import { createFileRoute } from '@tanstack/react-router'
import DSCStep from '@/features/incorporation/steps/dsc'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/dsc')({
  component: DSCStep,
})
