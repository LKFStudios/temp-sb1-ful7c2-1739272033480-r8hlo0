import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { signInWithApple, signInWithEmail } from '../services/auth';
import { validateEmail, validatePassword } from '../utils/auth';

interface LoginScreenProps {
  onLogin: () => void;
  step: number;
}

export function LoginScreen({ onLogin, step }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (!validatePassword(password)) {
      setError('パスワードは6文字以上にしてください');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signInWithEmail(email, password);
        setError('確認メールを送信しました。メールを確認してください。');
      } else {
        await signInWithEmail(email, password);
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithApple();
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Appleログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md flex gap-2 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s === step ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center font-gothic">
          {isSignUp ? 'アカウントを作成' : 'ログイン'}
        </h1>

        {error && (
          <div className="w-full max-w-md bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="example@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="6文字以上"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '処理中...' : isSignUp ? '新規登録' : 'ログイン'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            {isSignUp ? 'アカウントをお持ちの方はこちら' : '新規登録はこちら'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.2 0-.83.38-1.71.89-3.1.41-1.47-.51-2.54-2.07-3.37-4.14-1.89-4.52-.5-10.23 2.8-11.89 1.34-.67 2.62-.45 3.66-.27.77.14 1.49.27 2.24-.27 1.12-.81 2.36-.69 3.39-.13.67.37 1.23.91 1.67 1.58-4.11 2.38-3.51 8.07.85 9.91-.65 1.45-1.48 2.93-2.86 4.4zm-1.33-17.6c.03 1.84-1.56 3.26-3.07 3.35-1.41-.17-2.65-1.67-2.49-3.38 1.24-.18 2.88-1.39 3.2-3.26 1.39-.11 2.33 1.45 2.36 3.29z"/>
            </svg>
            Appleでログイン
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="w-full bg-gray-50 text-gray-900 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            スキップしてはじめる
          </button>
        </form>
      </div>
    </div>
  );
}