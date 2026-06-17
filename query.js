import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDb() {
  const { data: food, error: foodErr } = await supabase.from('food_items').select('*');
  if (foodErr) {
    console.error(foodErr);
  } else {
    console.log('ALL FOOD ITEMS:', JSON.stringify(food.map(f => ({ _id: f._id, name: f.name, restaurant: f.restaurant, price: f.price })), null, 2));
  }
}

checkDb();
