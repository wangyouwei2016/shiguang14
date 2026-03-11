import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
  constantTimeEqual,
  createMultiUserAuthToken,
  createSingleAuthToken,
  readAuthConfig,
} from '@/lib/auth';

interface LoginPayload {
  username?: unknown;
  password?: unknown;
}

interface LoginResponse {
  error?: string;
}

interface ValidLoginPayload {
  username?: string;
  password: string;
}

function isValidPayload(payload: LoginPayload): payload is ValidLoginPayload {
  return typeof payload.password === 'string' && payload.password.length > 0;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    if (!isValidPayload(payload)) {
      return NextResponse.json<LoginResponse>(
        { error: 'Invalid payload: password is required' },
        { status: 400 },
      );
    }

    const config = readAuthConfig();
    const inputUsername = typeof payload.username === 'string' ? payload.username.trim() : '';
    const inputPassword = payload.password;

    if (config.mode === 'single') {
      if (!constantTimeEqual(inputPassword, config.password)) {
        return NextResponse.json<LoginResponse>({ error: '密码错误' }, { status: 401 });
      }

      const token = await createSingleAuthToken(config.password);
      const response = NextResponse.json({ ok: true }, { status: 200 });
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      });
      response.cookies.set({
        name: AUTH_USER_COOKIE_NAME,
        value: '',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    if (!inputUsername) {
      return NextResponse.json<LoginResponse>({ error: '多用户模式需要用户名' }, { status: 400 });
    }

    const expectedPassword = config.users.get(inputUsername);
    if (!expectedPassword || !constantTimeEqual(inputPassword, expectedPassword)) {
      return NextResponse.json<LoginResponse>({ error: '用户名或密码错误' }, { status: 401 });
    }

    const token = await createMultiUserAuthToken(inputUsername, expectedPassword);
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });
    response.cookies.set({
      name: AUTH_USER_COOKIE_NAME,
      value: inputUsername,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    const message = toErrorMessage(error);
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json<LoginResponse>({ error: message }, { status });
  }
}
