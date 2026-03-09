import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  createExpectedAuthToken,
  isPasswordValid,
} from '@/lib/auth';

interface LoginPayload {
  password?: unknown;
}

interface LoginResponse {
  error?: string;
}

interface ValidLoginPayload {
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

    if (!(await isPasswordValid(payload.password))) {
      return NextResponse.json<LoginResponse>({ error: '密码错误' }, { status: 401 });
    }

    const token = await createExpectedAuthToken();
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
    return response;
  } catch (error) {
    const message = toErrorMessage(error);
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json<LoginResponse>({ error: message }, { status });
  }
}
