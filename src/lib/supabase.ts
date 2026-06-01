import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Key, fallback to hardcoded defaults if missing or invalid
const rawUrl = (((import.meta as any).env?.VITE_SUPABASE_URL || '') as string).trim();
const rawKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '') as string).trim();

const defaultUrl = 'https://migoneergdczlksgzggo.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ29uZWVyZ2Rjemxrc2d6Z2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Mzk2NzQsImV4cCI6MjA5NDIxNTY3NH0.CkCPFw8Uacslvd1TnnqXBK9pJlzxmUlK4Gkff42tUeo';

// Check if the URL is valid HTTP/HTTPS and not a standard placeholder
const isUrlValid = rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) && !rawUrl.includes('your-') && !rawUrl.includes('placeholder');
const activeUrl = isUrlValid ? rawUrl : defaultUrl;

// Check if the Key looks valid (reasonably long and not a placeholder)
const isKeyValid = rawKey && rawKey.length > 50 && !rawKey.includes('your-') && !rawKey.includes('placeholder');
const activeKey = isKeyValid ? rawKey : defaultKey;

// Clean up trailing /rest/v1/ or /rest/v1 if present in the URL string
const cleanUrl = activeUrl.endsWith('/rest/v1/') 
  ? activeUrl.slice(0, -9) 
  : activeUrl.endsWith('/rest/v1') 
    ? activeUrl.slice(0, -8) 
    : activeUrl;

export const supabase = createClient(cleanUrl, activeKey);

