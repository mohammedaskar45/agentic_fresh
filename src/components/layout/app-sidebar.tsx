import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { useAuthStore } from '@/stores/auth-store'
import { ShieldCheck } from 'lucide-react'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { navGroups } = useSidebarData()
  const { auth } = useAuthStore()

  const teams = [
    {
      name: 'Agentic Compliance',
      logo: ShieldCheck,
      plan: 'Enterprise OS',
    },
  ]

  const user = {
    name: auth.user?.name || 'Guest User',
    email: auth.user?.mail_id || '',
    avatar: '',
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
