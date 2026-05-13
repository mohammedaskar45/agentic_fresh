import { createFileRoute } from '@tanstack/react-router'
import SpiceStep from '@/features/incorporation/steps/spice'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/spice')({
  component: SpiceStep,
})
