import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // Crucial: ensures cookies (refresh token) are sent
});

// A variable to hold the in-memory token
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// 1. Intercept requests to inject the Access Token
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// 2. Intercept responses to handle 401s (Silent Refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this specific request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt silent refresh
        const { data } = await axios.post(
          'http://localhost:4000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        
        setAccessToken(data.accessToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired/missing). Clear memory token.
        setAccessToken(null);
        // We do NOT redirect to login here automatically to avoid redirect loops on public pages.
        // The AuthContext will handle state cleanup.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);