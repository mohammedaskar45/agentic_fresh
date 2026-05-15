import { createFileRoute } from '@tanstack/react-router'
import AuditorStep from '@/features/incorporation/steps/auditor'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/auditor')({
  component: AuditorStep,
})
