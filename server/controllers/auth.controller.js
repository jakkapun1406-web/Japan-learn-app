// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ============================================================
// REGISTER — สร้าง account ใหม่
// ============================================================
const register = async (req, res) => {
  // --- VALIDATION ---
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // --- SIGN UP ---
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || '' } }
    });

    if (error) throw error;

    // --- RESPONSE ---
    return res.status(201).json({ user: data.user, session: data.session });

  } catch (err) {
    console.error('[register]', err.message);
    return res.status(400).json({ error: err.message });
  }
};

// ============================================================
// LOGIN — เข้าสู่ระบบ
// ============================================================
const login = async (req, res) => {
  // --- VALIDATION ---
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // --- SIGN IN ---
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    // --- RESPONSE ---
    return res.status(200).json({ user: data.user, session: data.session });

  } catch (err) {
    console.error('[login]', err.message);
    return res.status(401).json({ error: err.message });
  }
};

// ============================================================
// LOGOUT — ออกจากระบบ
// ============================================================
const logout = async (req, res) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return res.status(200).json({ message: 'Logged out' });

  } catch (err) {
    console.error('[logout]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, logout };
