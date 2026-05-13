import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token and Selected Company ID
axiosInstance.interceptors.request.use(
  (config) => {
    let token = Cookies.get('access_token');
    const selectedCompany = Cookies.get('selected_company');
    
    // Safety: if token is still stringified, parse it
    if (token && token.startsWith('"')) {
        try { token = JSON.parse(token); } catch(e) {}
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (selectedCompany) {
        try {
            const company = JSON.parse(selectedCompany);
            config.headers['x-company-id'] = company.company_id;
        } catch (e) {
            config.headers['x-company-id'] = selectedCompany;
        }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('selected_company');
      Cookies.remove('auth_user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
