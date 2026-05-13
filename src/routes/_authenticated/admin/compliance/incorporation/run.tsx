import { createFileRoute } from '@tanstack/react-router'
import RUNStep from '@/features/incorporation/steps/run'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/run')({
  component: RUNStep,
})
