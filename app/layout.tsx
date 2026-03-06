import type {Metadata} from 'next';
import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const serif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: '拾光 14 | 极简个人成长管理',
  description: '一款为独立创造者、终身学习者打造的极简生活/学习目标管理 Web 应用。',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${serif.variable}`}>
      <body className="font-sans bg-[#F5F3EF] text-[#3A3731] antialiased selection:bg-[#E8E5DF] selection:text-[#3A3731] relative min-h-screen" suppressHydrationWarning>
        <div className="pointer-events-none fixed inset-0 z-50 bg-noise opacity-40 mix-blend-multiply"></div>
        {children}
      </body>
    </html>
  );
}
