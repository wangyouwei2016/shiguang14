import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  PASSWORD_ENV_NAME,
  constantTimeEqual,
  createExpectedAuthToken,
} from '@/lib/auth';

const LOGIN_PAGE_PATH = '/login';
const LOGIN_API_PATH = '/api/auth/login';
const ROOT_PATH = '/';
const STATIC_ASSET_PATTERN = /\.[^/]+$/;

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname === LOGIN_PAGE_PATH ||
    pathname === LOGIN_API_PATH ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    STATIC_ASSET_PATTERN.test(pathname)
  );
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return `Missing required environment variable: ${PASSWORD_ENV_NAME}`;
}

function buildLoginUrl(request: NextRequest): URL {
  const loginUrl = new URL(LOGIN_PAGE_PATH, request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (requestedPath !== ROOT_PATH) {
    loginUrl.searchParams.set('next', requestedPath);
  }
  return loginUrl;
}

async function hasValidAuthToken(request: NextRequest): Promise<boolean> {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return false;
  }
  const expectedToken = await createExpectedAuthToken();
  return constantTimeEqual(cookieToken, expectedToken);
}

function buildConfigError(pathname: string, message: string): NextResponse {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return new NextResponse(`Server configuration error: ${message}`, {
    status: 500,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    if (await hasValidAuthToken(request)) {
      return NextResponse.next();
    }
  } catch (error) {
    return buildConfigError(pathname, toErrorMessage(error));
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(buildLoginUrl(request));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
