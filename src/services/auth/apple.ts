import { supabase } from '../../config/supabase';
import { analytics } from '../analytics';

export async function signInWithApple() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          response_type: 'code id_token',
          scope: 'name email',
          response_mode: 'fragment'
        }
      }
    });

    if (error) throw error;
    
    analytics.track('Sign In', { provider: 'apple' });
    return data;
  } catch (error) {
    console.error('Apple sign in failed:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Apple sign in failed'));
    throw new Error('Appleログインに失敗しました。時間をおいて再度お試しください。');
  }
}