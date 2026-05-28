import axios from 'axios';
import appConfig from '../config/appConfig';
import { getAccessToken } from '../services/authService';

// Centralized axios client for API calls
const axiosClient = axios.create({
  baseURL: appConfig.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token if available
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore - request will proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
