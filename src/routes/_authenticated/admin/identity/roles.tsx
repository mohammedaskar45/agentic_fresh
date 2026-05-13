import { createFileRoute } from '@tanstack/react-router'
import { Roles } from '@/features/roles'

export const Route = createFileRoute('/_authenticated/admin/identity/roles')({
  component: Roles,
})
