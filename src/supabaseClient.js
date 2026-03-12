import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwdkjufdgkvjycmvefxn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZGtqdWZkZ2t2anljbXZlZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDU1ODgsImV4cCI6MjA4ODkyMTU4OH0._4pUXmrekpDx7TKaHdDsr2srEIZ2XDKNYxP9yupfIz4'

// ОЧЕНЬ ВАЖНО: здесь должно быть слово export перед const
export const supabase = createClient(supabaseUrl, supabaseKey)