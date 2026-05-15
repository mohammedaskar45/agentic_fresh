import { createFileRoute } from '@tanstack/react-router'
import RightsIssueOfferPeriod from '@/features/rights-issue/steps/offer-period'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/offer-period')({
  component: RightsIssueOfferPeriod,
})
