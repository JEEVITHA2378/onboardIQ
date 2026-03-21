const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ivlbchluuowhcoemiosn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGJjaGx1dW93aGNvZW1pb3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODg5NjUsImV4cCI6MjA4OTU2NDk2NX0.HCXZFsuavfbL02zhbs-hR3Chd_RiyYosfBGQYOx_lUw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findUser() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .limit(5);

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Existing users:', data);
  }
}

findUser();
