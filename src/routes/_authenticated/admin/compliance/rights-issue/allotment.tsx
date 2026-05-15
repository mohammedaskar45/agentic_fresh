import { createFileRoute } from '@tanstack/react-router'
import RightsIssueAllotment from '@/features/rights-issue/steps/allotment'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/allotment')({
  component: RightsIssueAllotment,
})
