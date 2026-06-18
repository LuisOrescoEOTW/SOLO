import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const Api = axios.create({
  baseURL: apiUrl,
});

// Enviar el token
Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
