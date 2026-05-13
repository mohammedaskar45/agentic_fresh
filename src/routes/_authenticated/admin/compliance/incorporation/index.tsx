import { createFileRoute } from '@tanstack/react-router'
import IncorporationDashboard from '@/features/incorporation/dashboard'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/')({
  component: IncorporationDashboard,
})
