import axios from 'axios'
import { env } from './env'
import { useAuthStore } from '@/store/auth-store'

export const api = axios.create({
  baseURL: env.API_GATEWAY_URL,
  withCredentials: true,
})

export async function tryBootRefresh() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (user) {
    try {
      await api.post('/auth/refresh', {})
      return true
    } catch (error) {
      logout()
      return false
    }
  }
  return false
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;

      if (originalRequest?.url?.includes("/auth/refresh")) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (!originalRequest?._retry) {
        originalRequest._retry = true;
        try {
          await api.post("/auth/refresh", {});
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);