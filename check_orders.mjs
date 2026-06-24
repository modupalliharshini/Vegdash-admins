import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    console.log(`Found ${data.length} orders:`);
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const order = data[i];
      console.log(`--- Order #${order._id} (status: ${order.status} / ${order.orderStatus}) ---`);
      console.log(`createdAt: ${order.createdAt}`);
      console.log(`created_at: ${order.created_at}`);
      console.log(`placed_at: ${order.placed_at}`);
      console.log(`preparing_at: ${order.preparing_at}`);
      console.log(`ready_for_pickup_at: ${order.ready_for_pickup_at}`);
      console.log(`rider_assigned_at: ${order.rider_assigned_at}`);
      console.log(`out_for_delivery_at: ${order.out_for_delivery_at}`);
      console.log(`arriving_at: ${order.arriving_at}`);
      console.log(`delivered_at: ${order.delivered_at}`);
      console.log(`statusHistory:`, JSON.stringify(order.statusHistory, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
