import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://marketplace-backend-q87b.onrender.com',
  withCredentials: true, // Crucial: ensures cookies (refresh token) are sent across origins
});

// A variable to hold the in-memory access token
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// 1. Intercept requests to inject the Access Token dynamically
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// 2. Intercept responses to handle 401s automatically via Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is an authentication failure (401) and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        /* * 🚀 PRODUCTION FIX: Using our base instance handles the production 
         * URL prefixing and safely passes your cookie tracking payloads automatically.
         */
        const { data } = await apiClient.post('/auth/refresh', {});
        
        setAccessToken(data.accessToken);
        
        // Retry the original network call with the newly updated token header
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed completely (cookie missing or invalid session window). Clear memory pointer.
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);