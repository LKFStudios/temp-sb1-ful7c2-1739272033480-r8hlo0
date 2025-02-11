import { supabase } from '../config/supabase';
import { analytics } from './analytics';

export async function signInWithApple(): Promise<void> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'https://stackblitz.com/auth/callback',
        queryParams: {
          response_type: 'id_token',
          response_mode: 'form_post',
          scope: 'name email'
        }
      }
    });

    if (error) {
      console.error('Supabase Apple auth error:', error);
      throw error;
    }

    analytics.track('Sign In Attempt', { provider: 'apple' });
  } catch (error) {
    console.error('Apple sign in failed:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Apple sign in failed'));
    throw new Error('Appleログインに失敗しました。時間をおいて再度お試しください。');
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('ログインに失敗しました');

    analytics.track('Sign In', { provider: 'email' });
  } catch (error) {
    console.error('Email sign in failed:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Email sign in failed'));
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    analytics.track('Sign Out');
  } catch (error) {
    console.error('Sign out failed:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Sign out failed'));
    throw new Error('ログアウトに失敗しました');
  }
}

export function onAuthStateChange(callback: (user: any | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}