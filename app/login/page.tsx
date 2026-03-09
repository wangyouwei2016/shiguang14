'use client';

import { FormEvent, ReactNode, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginApiResponse {
  error?: string;
}

interface LoginPanelProps {
  password: string;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onPasswordChange: (nextPassword: string) => void;
}

function getSafeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/';
  }
  return nextPath;
}

async function submitPassword(password: string): Promise<string | null> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const payload = (await response.json()) as LoginApiResponse;
  if (response.ok) {
    return null;
  }
  return payload.error ?? '登录失败';
}

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-6">
      <section className="w-full max-w-md rounded-2xl border border-[#E0DDD6] bg-white/90 p-8 shadow-sm">
        {children}
      </section>
    </main>
  );
}

function LoginPanel({ password, error, isSubmitting, onSubmit, onPasswordChange }: LoginPanelProps) {
  return (
    <>
      <h1 className="font-serif text-2xl text-[#3A3731] mb-2">拾光 14</h1>
      <p className="text-sm text-[#7A7772] mb-6">请输入访问密码</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          className="w-full rounded-md border border-[#D9D5CD] bg-white px-3 py-2 text-sm text-[#3A3731] outline-none focus:border-[#BFB9AF]"
          placeholder="密码"
          autoFocus
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#3A3731] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '验证中...' : '进入应用'}
        </button>
      </form>
    </>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => getSafeNextPath(searchParams.get('next')), [searchParams]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim().length === 0) {
      setError('请输入密码');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const submitError = await submitPassword(password);
      if (submitError) {
        setError(submitError);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch (requestError) {
      console.error('Login request failed:', requestError);
      setError('登录请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginShell>
      <LoginPanel
        password={password}
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onPasswordChange={setPassword}
      />
    </LoginShell>
  );
}

function LoginFallback() {
  return (
    <LoginShell>
      <h1 className="font-serif text-2xl text-[#3A3731] mb-2">拾光 14</h1>
      <p className="text-sm text-[#7A7772] mb-6">加载中...</p>
    </LoginShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
