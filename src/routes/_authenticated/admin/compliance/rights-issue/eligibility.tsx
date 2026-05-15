import { createFileRoute } from '@tanstack/react-router'
import RightsIssueEligibility from '@/features/rights-issue/steps/eligibility'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/eligibility')({
  component: RightsIssueEligibility,
})
