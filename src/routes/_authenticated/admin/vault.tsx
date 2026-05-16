import { createFileRoute } from '@tanstack/react-router'
import DocumentVault from '@/features/vault'

export const Route = createFileRoute('/_authenticated/admin/vault')({
  component: DocumentVault,
})
