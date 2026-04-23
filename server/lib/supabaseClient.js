// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ============================================================
// SUPABASE CLIENT (Service Role — full access for server)
// ============================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
