import axiosInstance from '@/lib/axios'

export const accessControlService = {
  // Roles
  getRoles: async () => {
    const response = await axiosInstance.get('/v1/master/access-control/roles')
    return response.data
  },
  createRole: async (data: any) => {
    const response = await axiosInstance.post('/v1/master/access-control/roles', data)
    return response.data
  },
  updateRole: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/v1/master/access-control/roles/${id}`, data)
    return response.data
  },
  deleteRole: async (id: string) => {
    const response = await axiosInstance.delete(`/v1/master/access-control/roles/${id}`)
    return response.data
  },

  // Users
  getUsers: async () => {
    const response = await axiosInstance.get('/v1/master/access-control/users')
    return response.data
  },
  createUser: async (data: any) => {
    const response = await axiosInstance.post('/v1/master/access-control/users', data)
    return response.data
  },
  updateUser: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/v1/master/access-control/users/${id}`, data)
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/v1/master/access-control/users/${id}`)
    return response.data
  },

  // Menus & Permissions
  getMenus: async () => {
    const response = await axiosInstance.get('/v1/master/access-control/menus')
    return response.data
  },
  getPermissions: async (roleId: string) => {
    const response = await axiosInstance.get(`/v1/master/access-control/permissions/${roleId}`)
    return response.data
  },
  updatePermissions: async (roleId: string, mappings: any[]) => {
    const response = await axiosInstance.patch(`/v1/master/access-control/permissions/${roleId}`, mappings)
    return response.data
  },
}
