import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Catatin - Catat Keuangan Lewat Chat',
  description: 'Catatin adalah aplikasi pencatat pengeluaran cerdas yang memungkinkan kamu mencatat transaksi hanya dengan satu kalimat bebas. Powered by AI.',
  keywords: 'catatan keuangan, pengeluaran, literasi finansial, AI, mahasiswa',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Catatin - Catat Keuangan Lewat Chat',
    description: 'Catat pengeluaran harian cukup dengan satu kalimat. AI yang bekerja untuk finansialmu.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
