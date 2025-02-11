import React from 'react';
import { signInWithApple } from '../../services/auth/apple';
import { Button } from '../common/Button';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithApple();
      onSuccess?.();
    } catch (error) {
      console.error('Apple sign in error:', error);
      onError?.(error instanceof Error ? error : new Error('Sign in failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant="outline"
      className="w-full bg-black text-white hover:bg-gray-900 border-gray-700"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
      <span className="ml-2">Appleでログイン</span>
    </Button>
  );
}