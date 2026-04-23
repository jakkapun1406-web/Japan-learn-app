// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// useAuth — จัดการ session และ user state
// ============================================================
export function useAuth() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- EFFECTS ---
  useEffect(() => {
    // ดึง session ปัจจุบันเมื่อ app โหลด
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ฟัง auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- AUTH FUNCTIONS ---
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, session, loading, login, register, logout };
}
