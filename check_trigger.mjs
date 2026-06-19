import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data, error } = await supabase.rpc('get_triggers');
    if (error) {
      // If RPC doesn't exist, query pg_trigger directly via SQL? We can't run arbitrary SQL unless we have a function or query a view.
      // Let's query a system view if allowed, or check if we can execute a simple query.
      console.log('RPC get_triggers failed, trying to query pg_class/pg_trigger...');
    }
    
    // Let's run a query to check database tables and triggers
    const { data: triggerData, error: triggerError } = await supabase
      .from('orders') // dummy table to check connection
      .select('*')
      .limit(1);
      
    console.log('Trigger/Connection check:');
    if (triggerError) {
      console.error(triggerError);
    } else {
      console.log('Connected to orders successfully!');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
