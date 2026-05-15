import { createFileRoute } from '@tanstack/react-router'
import RightsIssueListedAppointment from '@/features/rights-issue/steps/listed-appointment'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/listed-appointment')({
  component: RightsIssueListedAppointment,
})
