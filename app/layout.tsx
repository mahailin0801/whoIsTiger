import type { Metadata } from 'next';
import 'antd-mobile/es/global';
import './globals.css';

export const metadata: Metadata = {
  title: '谁是卧底',
  description: '谁是卧底 H5 游戏',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

