import { createFileRoute } from '@tanstack/react-router'
import RightsIssueListedRecordDate from '@/features/rights-issue/steps/listed-record-date'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/listed-record-date')({
  component: RightsIssueListedRecordDate,
})
