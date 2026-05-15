import { createFileRoute } from '@tanstack/react-router'
import RightsIssueBoardApproval from '@/features/rights-issue/steps/board-approval'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/board-approval')({
  component: RightsIssueBoardApproval,
})
