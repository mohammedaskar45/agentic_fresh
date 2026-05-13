import { createFileRoute } from '@tanstack/react-router'
import PanTanStep from '@/features/incorporation/steps/pan-tan'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/pan-tan')({
  component: PanTanStep,
})
