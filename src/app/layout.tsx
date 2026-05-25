import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free English Level Test | Pro English BD',
  description: 'মাত্র ৭–১০ মিনিটে জানুন আপনার English Level, Weakness এবং ৭৫ দিনের Fluency Roadmap। No payment required.',
  keywords: 'English level test, spoken English, IELTS, freelancer English, Pro English BD',
  openGraph: {
    title: 'Free English Level Test | Pro English BD',
    description: 'মাত্র ৭–১০ মিনিটে জানুন আপনার English Level, Weakness এবং Fluency Roadmap',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
