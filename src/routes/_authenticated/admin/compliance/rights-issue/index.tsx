import { createFileRoute } from '@tanstack/react-router'
import RightsIssueDashboard from '@/features/rights-issue/dashboard'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/')({
  component: RightsIssueDashboard,
})
