import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { accessControlService } from '@/services/access-control.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AccessMatrix() {
  const [roles, setRoles] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, menusData] = await Promise.all([
          accessControlService.getRoles(),
          accessControlService.getMenus(),
        ])
        setRoles(rolesData)
        setMenus(menusData)
      } catch (error) {
        toast.error('Error fetching data')
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRole) {
      const fetchPermissions = async () => {
        try {
          const perms = await accessControlService.getPermissions(selectedRole)
          setMappings(perms)
        } catch (error) {
          toast.error('Error fetching permissions')
        }
      }
      fetchPermissions()
    }
  }, [selectedRole])

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
            role_id: selectedRole,
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

  const handleSave = async () => {
    if (!selectedRole) return
    setLoading(true)
    try {
      await accessControlService.updatePermissions(selectedRole, mappings)
      toast.success('Permissions updated successfully')
    } catch (error) {
      toast.error('Error saving permissions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='w-64'>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder='Select Role' />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={!selectedRole || loading}>
          {loading ? 'Saving...' : 'Save Matrix'}
        </Button>
      </div>

      <div className='overflow-hidden rounded-lg border bg-background shadow'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-muted/50 border-b'>
              <tr>
                <th className='p-4 font-medium'>Menu Name</th>
                <th className='p-4 text-center font-medium'>View</th>
                <th className='p-4 text-center font-medium'>Add</th>
                <th className='p-4 text-center font-medium'>Edit</th>
                <th className='p-4 text-center font-medium'>Delete</th>
                <th className='p-4 text-center font-medium'>Full Access</th>
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
    </div>
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
        <td className='p-4 font-medium flex items-center gap-2'>
          <span>{menu.menu_name}</span>
        </td>
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
            <td className='p-4 pl-10 text-sm text-muted-foreground'>
              {child.menu_name}
            </td>
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
    <td className='p-4 text-center'>
      <Checkbox checked={!!value} onCheckedChange={onToggle} />
    </td>
  )
}
