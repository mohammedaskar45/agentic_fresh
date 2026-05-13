import { createFileRoute } from '@tanstack/react-router'
import GSTStep from '@/features/incorporation/steps/gst'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/gst')({
  component: GSTStep,
})
