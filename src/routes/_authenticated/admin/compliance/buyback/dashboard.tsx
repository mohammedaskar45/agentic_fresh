import { createFileRoute } from '@tanstack/react-router'
import BuybackDashboard from '@/features/buyback/dashboard'

export const Route = createFileRoute('/_authenticated/admin/compliance/buyback/dashboard')({
  component: BuybackDashboard,
})
