import axios from "axios";
import { authClient } from "./auth-client";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const { data } = await authClient.token();

  if (data?.token) {
    config.headers.Authorization = `Bearer ${data.token}`;
  }

  return config;
});
