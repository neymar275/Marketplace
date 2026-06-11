import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// In-memory access token
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// Request Interceptor - Attach Bearer Token
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Response Interceptor - Auto Refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ FIXED: Correct path + correct response key
        const { data } = await apiClient.post('/api/auth/refresh', {}, {
          withCredentials: true
        });

        if (data.token) {
          setAccessToken(data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
        setAccessToken(null);
        // Optional: redirect to login page
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;