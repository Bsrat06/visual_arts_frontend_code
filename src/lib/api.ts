// src/lib/api.ts
import axios from "axios"

// const myBaseUrl = 'http://localhost:8000/api';

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY



const API = axios.create({
  baseURL: myBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
})

// ✅ Auto-attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["Authorization"] = `Token ${token}`
  }
  return config
})

export default API
