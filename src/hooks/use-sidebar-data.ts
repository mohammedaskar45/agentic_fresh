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
    
    // We'll group them into one 'Main Menu' group or follow the hierarchy
    return [
      {
        title: 'Compliance Platform',
        items: menus.map(menu => transformMenuItem(menu))
      }
    ];
  };

  const transformMenuItem = (menu: any): any => {
    // Map string icon name to Lucide component
    const IconComponent = (LucideIcons as any)[menu.icon] || LucideIcons.HelpCircle;

    return {
      title: menu.menu_name,
      url: menu.url,
      icon: IconComponent,
      items: menu.children && menu.children.length > 0 
        ? menu.children.map((child: any) => transformMenuItem(child))
        : undefined
    };
  };

  return { navGroups, isLoading };
}
