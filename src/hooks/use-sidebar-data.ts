import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export function useSidebarData() {
  const { auth } = useAuthStore();
  const [navGroups, setNavGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.user?.role_id) {
      fetchMenus(auth.user.role_id);
    }
  }, [auth.user?.role_id]);

  const fetchMenus = async (roleId: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/menus/role/${roleId}`);
      if (response.data.success) {
        const formattedGroups = formatMenus(response.data.data);
        setNavGroups(formattedGroups);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMenus = (menus: any[]) => {
    // Backend tree structure has 'children'
    // Frontend NavGroup expects 'items' with 'title', 'url', 'icon', etc.
    
    // Filter out "Access Matrix" from top-level menus
    const filteredMenus = menus.filter(menu => menu.menu_name !== 'Access Matrix');

    return [
      {
        title: 'Compliance Platform',
        items: filteredMenus.map(menu => transformMenuItem(menu))
      }
    ];
  };

  const transformMenuItem = (menu: any): any => {
    // Map string icon name to Lucide component
    const IconComponent = (LucideIcons as any)[menu.icon] || LucideIcons.HelpCircle;

    const filteredChildren = (menu.children || []).filter((child: any) => child.menu_name !== 'Access Matrix');

    return {
      title: menu.menu_name,
      url: menu.url,
      icon: IconComponent,
      items: filteredChildren.length > 0 
        ? filteredChildren.map((child: any) => transformMenuItem(child))
        : undefined
    };
  };

  return { navGroups, isLoading };
}
