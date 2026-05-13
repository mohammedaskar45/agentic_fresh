import { createFileRoute } from '@tanstack/react-router'
import CommencementStep from '@/features/incorporation/steps/commencement'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/commencement')({
  component: CommencementStep,
})
