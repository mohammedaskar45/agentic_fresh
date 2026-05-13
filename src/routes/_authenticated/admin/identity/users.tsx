import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'

const usersSearchSchema = z.any()

export const Route = createFileRoute('/_authenticated/admin/identity/users')({
  validateSearch: usersSearchSchema,
  component: Users,
})
