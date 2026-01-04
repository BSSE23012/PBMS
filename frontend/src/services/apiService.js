// src/services/apiService.js
import axios from 'axios';

// IMPORTANT: Replace this with the Public IP of your EC2 test server
const API_BASE_URL = 'http://pbhms-prod-alb-1448893203.us-east-1.elb.amazonaws.com:80/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
