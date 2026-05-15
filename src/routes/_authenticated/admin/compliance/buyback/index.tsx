import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/compliance/buyback/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/compliance/buyback/dashboard',
    })
  },
})
