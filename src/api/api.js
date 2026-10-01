import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URI,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

export default api;
