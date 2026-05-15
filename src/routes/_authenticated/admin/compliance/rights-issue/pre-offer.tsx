import { createFileRoute } from '@tanstack/react-router'
import RightsIssuePreOffer from '@/features/rights-issue/steps/pre-offer'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/pre-offer')({
  component: RightsIssuePreOffer,
})
