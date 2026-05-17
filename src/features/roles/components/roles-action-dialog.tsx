'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  const [menus, setMenus] = useState<any[]>([])
  const [mappings, setMappings] = useState<any[]>([])

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

  // Fetch menus and existing permissions on Dialog open
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const menusData = await accessControlService.getMenus()
          setMenus(menusData)

          if (currentRow) {
            const perms = await accessControlService.getPermissions(currentRow.role_id)
            setMappings(perms)
          } else {
            setMappings([])
          }
        } catch (error) {
          toast.error('Failed to load menu permissions')
        }
      }
      fetchData()
    }
  }, [open, currentRow])

  useEffect(() => {
    if (currentRow) {
      form.reset({
        role_name: currentRow.role_name,
        role_type: currentRow.role_type,
        order_no: currentRow.order_no,
      })
    } else {
      form.reset({
        role_name: '',
        role_type: '',
        order_no: 0,
      })
    }
  }, [currentRow, form, open])

  const handleToggle = (menuId: string, permission: string) => {
    setMappings((prev) => {
      const existingMapping = prev.find((m) => m.menu_id === menuId)
      if (existingMapping) {
        return prev.map((m) =>
          m.menu_id === menuId ? { ...m, [permission]: !m[permission] } : m
        )
      } else {
        return [
          ...prev,
          {
            menu_id: menuId,
            role_id: currentRow?.role_id || '',
            view: false,
            add: false,
            edit: false,
            delete: false,
            full_access: false,
            [permission]: true,
          },
        ]
      }
    })
  }

  const onSubmit = async (values: RoleForm) => {
    try {
      let roleId = currentRow?.role_id
      if (isEdit && currentRow) {
        await accessControlService.updateRole(currentRow.role_id, values)
      } else {
        const newRole = await accessControlService.createRole(values)
        roleId = newRole.role_id
      }

      // Save permissions mapping for this role
      const updatedMappings = mappings.map((m) => ({
        ...m,
        role_id: roleId,
      }))
      await accessControlService.updatePermissions(roleId, updatedMappings)

      toast.success(isEdit ? 'Role & Access Matrix updated successfully' : 'Role & Access Matrix created successfully')
      onOpenChange(false)
      form.reset()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to save role and permissions')
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
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Role & Permissions' : 'Add New Role & Access Matrix'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update role properties and modify its page access rights below. ' : 'Define a new role and configure its initial access matrix permissions below. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='role-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-3 gap-4'>
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
                      <Input type='number' {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='border-t pt-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Role Access Permissions Matrix</h4>
                <span className='text-xs text-muted-foreground'>Configure granular module-level access.</span>
              </div>
              <div className='overflow-hidden rounded-lg border bg-background shadow max-h-[350px] overflow-y-auto'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-muted/50 border-b sticky top-0 bg-background z-10'>
                    <tr>
                      <th className='p-3 font-medium'>Menu Name</th>
                      <th className='p-3 text-center font-medium'>View</th>
                      <th className='p-3 text-center font-medium'>Add</th>
                      <th className='p-3 text-center font-medium'>Edit</th>
                      <th className='p-3 text-center font-medium'>Delete</th>
                      <th className='p-3 text-center font-medium'>Full Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((menu) => (
                      <MenuRow
                        key={menu.menu_id}
                        menu={menu}
                        mappings={mappings}
                        onToggle={handleToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter className='border-t pt-4'>
          <Button type='submit' form='role-form'>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MenuRow({ menu, mappings, onToggle }: { menu: any; mappings: any[]; onToggle: any }) {
  const mapping = mappings.find((m) => m.menu_id === menu.menu_id) || {
    view: false,
    add: false,
    edit: false,
    delete: false,
    full_access: false,
  }

  return (
    <>
      <tr className='border-b hover:bg-muted/30'>
        <td className='p-3 font-semibold text-slate-700'>{menu.menu_name}</td>
        <PermissionCell value={mapping.view} onToggle={() => onToggle(menu.menu_id, 'view')} />
        <PermissionCell value={mapping.add} onToggle={() => onToggle(menu.menu_id, 'add')} />
        <PermissionCell value={mapping.edit} onToggle={() => onToggle(menu.menu_id, 'edit')} />
        <PermissionCell value={mapping.delete} onToggle={() => onToggle(menu.menu_id, 'delete')} />
        <PermissionCell value={mapping.full_access} onToggle={() => onToggle(menu.menu_id, 'full_access')} />
      </tr>
      {menu.children?.map((child: any) => {
        const childMapping = mappings.find(m => m.menu_id === child.menu_id) || {
          view: false,
          add: false,
          edit: false,
          delete: false,
          full_access: false,
        };
        return (
          <tr key={child.menu_id} className='border-b bg-muted/10 hover:bg-muted/30'>
            <td className='p-3 pl-8 text-muted-foreground'>{child.menu_name}</td>
            <PermissionCell value={childMapping.view} onToggle={() => onToggle(child.menu_id, 'view')} />
            <PermissionCell value={childMapping.add} onToggle={() => onToggle(child.menu_id, 'add')} />
            <PermissionCell value={childMapping.edit} onToggle={() => onToggle(child.menu_id, 'edit')} />
            <PermissionCell value={childMapping.delete} onToggle={() => onToggle(child.menu_id, 'delete')} />
            <PermissionCell value={childMapping.full_access} onToggle={() => onToggle(child.menu_id, 'full_access')} />
          </tr>
        );
      })}
    </>
  )
}

function PermissionCell({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <td className='p-3 text-center'>
      <Checkbox checked={!!value} onCheckedChange={onToggle} />
    </td>
  )
}
