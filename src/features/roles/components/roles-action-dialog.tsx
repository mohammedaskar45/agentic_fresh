'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { accessControlService } from '@/services/access-control.service'
import { toast } from 'sonner'

const formSchema = z.object({
  role_name: z.string().min(1, 'Role name is required.'),
  role_type: z.string().min(1, 'Role type is required.'),
  order_no: z.number().default(0),
})

type RoleForm = z.infer<typeof formSchema>

type RoleActionDialogProps = {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RoleActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          role_name: currentRow.role_name,
          role_type: currentRow.role_type,
          order_no: currentRow.order_no,
        }
      : {
          role_name: '',
          role_type: '',
          order_no: 0,
        },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        role_name: currentRow.role_name,
        role_type: currentRow.role_type,
        order_no: currentRow.order_no,
      })
    }
  }, [currentRow, form])

  const onSubmit = async (values: RoleForm) => {
    try {
      if (isEdit && currentRow) {
        await accessControlService.updateRole(currentRow.role_id, values)
        toast.success('Role updated successfully')
      } else {
        await accessControlService.createRole(values)
        toast.success('Role created successfully')
      }
      onOpenChange(false)
      form.reset()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to save role')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the role here. ' : 'Create new role here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='role-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='role_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Manager' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Type</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. MANAGER' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='order_no'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order No</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='role-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
