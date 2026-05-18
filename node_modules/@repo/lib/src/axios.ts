import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => config);
apiClient.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error),
);
