'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { accessControlService } from '@/services/access-control.service'
import { toast } from 'sonner'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: any
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const username = currentRow.mail_id?.split('@')[0] || ''

  const handleDelete = async () => {
    if (value.trim() !== username) return

    try {
      await accessControlService.deleteUser(currentRow.user_id)
      toast.success('User deleted successfully')
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='users-delete-form'
      disabled={value.trim() !== username}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <form
          id='users-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{username}</span>?
            <br />
            This action will permanently remove the user from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username (Email prefix):
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter email prefix to confirm deletion.'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  )
}
