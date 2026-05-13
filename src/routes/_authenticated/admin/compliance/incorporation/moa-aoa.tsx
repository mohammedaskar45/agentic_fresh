import { createFileRoute } from '@tanstack/react-router'
import MoaAoaStep from '@/features/incorporation/steps/moa-aoa'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/moa-aoa')({
  component: MoaAoaStep,
})
