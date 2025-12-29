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

// Supabase 라이브러리가 로드될 때까지 기다리는 함수
let retryCount = 0;
const MAX_RETRIES = 50; // 최대 5초 대기 (50 * 100ms)

function initializeSupabaseClient() {
    // Supabase 라이브러리가 이미 로드되어 있는지 확인
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역으로 사용 가능하도록 설정
window.supabaseClient = supabase;
            
            console.log('Supabase 클라이언트가 성공적으로 초기화되었습니다.');
            return supabase;
        } catch (error) {
            console.error('Supabase 클라이언트 초기화 중 오류 발생:', error);
            window.supabaseClient = null;
            alert('Supabase 클라이언트 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
            return null;
        }
    } else {
        // 최대 재시도 횟수 확인
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            // 라이브러리가 아직 로드되지 않았으면 잠시 후 다시 시도
            setTimeout(initializeSupabaseClient, 100);
            return null;
        } else {
            // 최대 재시도 횟수 초과
            console.error('Supabase 라이브러리를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.');
            window.supabaseClient = null;
            alert('Supabase 라이브러리를 로드할 수 없습니다. 네트워크 연결을 확인하고 페이지를 새로고침해주세요.');
            return null;
        }
    }
}

// DOM이 로드된 후 초기화 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabaseClient);
} else {
    // DOM이 이미 로드된 경우 즉시 초기화 시도
    initializeSupabaseClient();
}

