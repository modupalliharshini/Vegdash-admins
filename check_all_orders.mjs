import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    console.log(`Found ${data.length} orders in total:`);
    if (data.length > 0) {
      console.log('KEYS:', Object.keys(data[0]));
      console.log('FIRST ORDER:', JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
