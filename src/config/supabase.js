require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

/**
 * The Supabase client for interacting with the Supabase API.
 * @type {SupabaseClient}
 */
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
