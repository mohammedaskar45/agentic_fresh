import { createFileRoute } from '@tanstack/react-router'
import COIStep from '@/features/incorporation/steps/coi'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/coi')({
  component: COIStep,
})
