// src/lib/api.ts
import axios from "axios"

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY

console.log("Vite Mode:", import.meta.env.MODE);
console.log("Is Development:", isDevelopment);
console.log("Base URL being used:", myBaseUrl);


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
