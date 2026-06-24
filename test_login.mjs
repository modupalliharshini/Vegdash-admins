import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwdvvplizodfqaadzkoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHZ2cGxpem9kZnFhYWR6a29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY3MjEsImV4cCI6MjA5NzA3MjcyMX0.i0exihijo72rvMtEB6lMa2BzGw1uYCc8QnZznIOvrhM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email) {
  console.log(`Testing login for ${email}...`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    });
    if (error) {
      console.log('Login failed:', error.message, JSON.stringify(error, null, 2));
    } else {
      console.log('Login succeeded:', data.user.id, data.user.email);
    }
  } catch (err) {
    console.error('Exception during login:', err);
  }
}

async function testSignUp(email, name) {
  console.log(`Testing signup for ${email}...`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'password123',
      options: { data: { name, role: 'rider' } }
    });
    if (error) {
      console.log('Signup failed:', error.message, JSON.stringify(error, null, 2));
    } else {
      console.log('Signup succeeded:', data.user.id, data.user.email);
    }
  } catch (err) {
    console.error('Exception during signup:', err);
  }
}

async function run() {
  await testLogin('rohan@vegdash.com');
  await testSignUp('rohan@vegdash.com', 'Rohan Sharma');
}

run();
