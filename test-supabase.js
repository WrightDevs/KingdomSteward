const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xbkxjlhbeprxaebzcfwy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhia3hqbGhiZXByeGFlYnpjZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzE1MTQsImV4cCI6MjA5NjEwNzUxNH0._uW1IoWXCB42pR2o2nJftj6ICicQwOGFPWfOESLKrXI'
);

async function testSignUp() {
  console.log('Testing sign up...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test_' + Date.now() + '@example.com',
    password: 'Test123456',
    options: {
      data: {
        full_name: 'Test User',
        title: 'Brother',
        zone: 'Test Zone',
        church: 'Test Church',
        phone_number: '1234567890'
      }
    }
  });

  if (error) {
    console.error('Sign up error:', error);
  } else {
    console.log('Sign up success:', data);
  }
}

testSignUp();
