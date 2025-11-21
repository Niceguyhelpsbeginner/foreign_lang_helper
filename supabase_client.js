/**
 * Supabase 클라이언트 설정
 * 
 * 사용 방법:
 * 1. Supabase 대시보드에서 API 키를 복사하세요
 * 2. 이 파일의 SUPABASE_URL과 SUPABASE_ANON_KEY를 실제 값으로 변경하세요
 * 3. index.html에서 이 파일을 로드하세요
 */

// Supabase 설정 (실제 값으로 변경하세요!)
const SUPABASE_URL = 'https://cvqdlrtfycqbtzekkmkv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cWRscnRmeWNxYnR6ZWtrbWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjMwOTAsImV4cCI6MjA3OTI5OTA5MH0.W38de0RfvjuFXeGEl8AlP_lrlLgo4VPQHr_uOsdb6AQ';

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역으로 사용 가능하도록 설정
window.supabaseClient = supabase;

