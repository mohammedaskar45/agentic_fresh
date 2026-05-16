import { createFileRoute } from '@tanstack/react-router'
import BoardMeetingStep from '@/features/incorporation/steps/board-meeting'

export const Route = createFileRoute('/_authenticated/admin/compliance/incorporation/board-meeting')({
  component: BoardMeetingStep,
})
