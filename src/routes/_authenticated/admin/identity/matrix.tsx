import { createFileRoute } from '@tanstack/react-router'
import { Roles } from '@/features/roles'

export const Route = createFileRoute('/_authenticated/admin/identity/matrix')({
  component: Roles, // We can reuse the Roles page which has the Matrix tab
})
