import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const target = orders.find(o => o._id.toLowerCase().endsWith('0a2372'));
  if (!target) {
    console.log("Order ending in 0a2372 not found. Found IDs:", orders.map(o => o._id));
    return;
  }
  
  console.log("FOUND TARGET ORDER:", JSON.stringify(target, null, 2));
}

run();
