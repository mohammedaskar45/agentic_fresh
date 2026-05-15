import { createFileRoute } from '@tanstack/react-router'
import RightsIssueMasterData from '@/features/rights-issue/steps/master-data'

export const Route = createFileRoute('/_authenticated/admin/compliance/rights-issue/master-data')({
  component: RightsIssueMasterData,
})
