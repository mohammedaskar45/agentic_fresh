import { createFileRoute } from '@tanstack/react-router'
import BuybackMasterData from '@/features/buyback/master-data'

export const Route = createFileRoute('/_authenticated/admin/compliance/buyback/master-data')({
  component: BuybackMasterData,
})
