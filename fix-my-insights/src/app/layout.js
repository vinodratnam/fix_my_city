import './globals.css';

export const metadata = {
  title: 'Fix My Insights - Smart Civic Intelligence Platform',
  description: 'Empowering Citizens Through Smart Civic Intelligence. Report, track, and resolve civic issues with AI-powered analytics and real-time municipal dispatch.',
  keywords: 'civic tech, pothole reporting, municipal issues, smart city, AI analytics, Fix My City',
  authors: [{ name: 'Fix My Insights' }],
  openGraph: {
    title: 'Fix My Insights - Smart Civic Intelligence Platform',
    description: 'AI-powered civic tech platform that connects citizens, government, and data.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
