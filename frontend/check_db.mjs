import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://ivlbchluuowhcoemiosn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGJjaGx1dW93aGNvZW1pb3NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4ODk2NSwiZXhwIjoyMDg5NTY0OTY1fQ.E3FIBD9fTX-c2HhCRxdxInWGGotDk6-oURAlrvfFiVQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('onboarding_sessions').select('id, status, user_id, role_title')
  const { data: profiles } = await supabase.from('profiles').select('*')
  fs.writeFileSync('db_out.json', JSON.stringify({ sessions: data, error, profiles }, null, 2))
}

check()
