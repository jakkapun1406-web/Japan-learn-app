// ============================================================
// IMPORTS
// ============================================================
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// AXIOS INSTANCE — base URL จาก env
// ============================================================
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================================
// REQUEST INTERCEPTOR — แนบ Bearer token ทุก request อัตโนมัติ
// ============================================================
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ============================================================
// EXPORTS
// ============================================================
export default apiClient;
