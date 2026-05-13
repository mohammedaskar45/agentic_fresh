import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'access_token'
const SELECTED_COMPANY = 'selected_company'
const AUTH_USER = 'auth_user'

interface Company {
  company_id: string
  company_name: string
  is_primary: boolean
}

interface AuthUser {
  user_id: string
  name: string
  mail_id: string
  role_id: string
  role_name: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    companies: Company[]
    setCompanies: (companies: Company[]) => void
    selectedCompany: Company | null
    setSelectedCompany: (company: Company | null) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieToken = getCookie(ACCESS_TOKEN)
  const cookieCompany = getCookie(SELECTED_COMPANY)
  const cookieUser = getCookie(AUTH_USER)
  
  const initToken = cookieToken || ''
  const initCompany = cookieCompany ? JSON.parse(cookieCompany) : null
  const initUser = cookieUser ? JSON.parse(cookieUser) : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(AUTH_USER, JSON.stringify(user))
          } else {
            removeCookie(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          if (accessToken) {
            setCookie(ACCESS_TOKEN, accessToken)
          } else {
            removeCookie(ACCESS_TOKEN)
          }
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      companies: [],
      setCompanies: (companies) =>
        set((state) => ({ ...state, auth: { ...state.auth, companies } })),
      selectedCompany: initCompany,
      setSelectedCompany: (company) =>
        set((state) => {
          if (company) {
            setCookie(SELECTED_COMPANY, JSON.stringify(company))
          } else {
            removeCookie(SELECTED_COMPANY)
          }
          return { ...state, auth: { ...state.auth, selectedCompany: company } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(SELECTED_COMPANY)
          removeCookie(AUTH_USER)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              accessToken: '', 
              companies: [], 
              selectedCompany: null 
            },
          }
        }),
    },
  }
})
