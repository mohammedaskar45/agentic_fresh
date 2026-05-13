import { createFileRoute } from '@tanstack/react-router'
import DINStep from '@/features/incorporation/steps/din'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/din')({
  component: DINStep,
})
