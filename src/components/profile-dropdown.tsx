import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOut, User, Settings, CreditCard, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function ProfileDropdown() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  
  const user = {
    name: auth.user?.name || 'Admin',
    email: auth.user?.mail_id || 'admin@compliance.com',
    initials: (auth.user?.name || 'AD').substring(0, 2).toUpperCase()
  }

  const handleLogout = () => {
    auth.reset()
    toast.success('Logged out successfully')
    navigate({ to: '/sign-in', replace: true })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full hover:bg-primary/10 transition-colors'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='' alt={user.name} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{user.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className='cursor-pointer hover:bg-primary/5'>
              <User className='mr-2 h-4 w-4' />
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer hover:bg-primary/5' disabled>
              <CreditCard className='mr-2 h-4 w-4' />
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer hover:bg-primary/5' disabled>
              <Settings className='mr-2 h-4 w-4' />
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50 transition-colors' 
            onSelect={() => setShowLogoutDialog(true)}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will be ended and you will need to login again to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700'
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
