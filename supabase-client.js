// Initialize Supabase Client
const supabaseUrl = 'https://lihpifqcfhkjfmbijrme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaHBpZnFjZmhramZtYmlqcm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjY5NzEsImV4cCI6MjA4OTg0Mjk3MX0.3e3mP3ePUs4EsyAsymZz9x5ErjIwEUfasX_WtSNH1j4';

// Check if valid credentials are provided, otherwise client will fail on queries
let supabaseClient = null;

if (supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_PUBLIC_KEY') {
  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase credentials not configured yet. Please update supabaseClient in supabase-client.js");
  // We provide a mock object so the rest of the application doesn't completely break
  // but instead shows empty states or console warnings.
  supabaseClient = {
    from: (table) => ({
      select: async () => { console.warn('Supabase not configured'); return { data: [], error: { message: 'Supabase Not Configured' }}; },
      insert: async (data) => { console.warn('Supabase not configured: Insert', data); return { data: null, error: { message: 'Supabase Not Configured'} }; },
      delete: () => ({
        match: async () => { console.warn('Supabase not configured: Delete'); return { error: { message: 'Supabase Not Configured' }}; }
      })
    })
  };
}

window.supabaseClient = supabaseClient;
