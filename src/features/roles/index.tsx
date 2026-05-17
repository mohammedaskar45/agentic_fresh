import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AccessMatrix } from './matrix'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { accessControlService } from '@/services/access-control.service'
import { Button } from '@/components/ui/button'
import { RolesActionDialog } from './components/roles-action-dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function Roles() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const fetchRoles = async () => {
    try {
      const data = await accessControlService.getRoles()
      setRoles(data)
    } catch (error) {
      toast.error('Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Roles & Permissions</h2>
            <p className='text-muted-foreground'>
              Configure role-based access control and menu visibility.
            </p>
          </div>
          <Button onClick={() => { setSelectedRole(null); setIsAddOpen(true); }}>
            <Plus className='mr-2 h-4 w-4' /> Add Role
          </Button>
        </div>

        <Tabs defaultValue='roles' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='roles'>Role List</TabsTrigger>
            <TabsTrigger value='matrix'>Access Matrix</TabsTrigger>
          </TabsList>
          <TabsContent value='matrix' className='space-y-4'>
            <AccessMatrix />
          </TabsContent>
          <TabsContent value='roles'>
            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='p-4 text-left font-medium'>Role Name</th>
                    <th className='p-4 text-left font-medium'>Type</th>
                    <th className='p-4 text-left font-medium'>Order</th>
                    <th className='p-4 text-right font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className='p-4 text-center'>Loading...</td></tr>
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={4} className='p-4 text-center'>No roles found.</td></tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.role_id} className='border-b hover:bg-muted/30'>
                        <td className='p-4'>{role.role_name}</td>
                        <td className='p-4'>{role.role_type}</td>
                        <td className='p-4'>{role.order_no}</td>
                        <td className='p-4 text-right'>
                          <Button variant='ghost' size='sm' onClick={() => { setSelectedRole(role); setIsAddOpen(true); }}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <RolesActionDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        currentRow={selectedRole} 
      />
    </>
  )
}
