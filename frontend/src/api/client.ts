import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Tenant-ID": import.meta.env.VITE_TENANT_ID || "1",
  },
});

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

export default apiClient;
