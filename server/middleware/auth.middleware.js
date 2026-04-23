// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ============================================================
// AUTH MIDDLEWARE — ตรวจ JWT token จาก Supabase
// ============================================================
const requireAuth = async (req, res, next) => {
  // --- GET TOKEN ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // --- VERIFY TOKEN กับ Supabase ---
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized — invalid token' });
    }

    // --- ATTACH USER TO REQUEST ---
    req.user = user;
    next();

  } catch (err) {
    console.error('[requireAuth]', err.message);
    return res.status(500).json({ error: 'Auth check failed' });
  }
};

module.exports = { requireAuth };
