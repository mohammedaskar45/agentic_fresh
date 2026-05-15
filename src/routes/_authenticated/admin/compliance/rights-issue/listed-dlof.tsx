import { createFileRoute } from '@tanstack/react-router'
import RightsIssueListedDLOF from '@/features/rights-issue/steps/listed-dlof'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/listed-dlof')({
  component: RightsIssueListedDLOF,
})
