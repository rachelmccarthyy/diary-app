import type { Metadata } from 'next';
import { Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-editorial',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'My Diary',
  description: 'A private diary for your thoughts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var dark={
    '--th-bg':'#0a0a0a','--th-card':'#0a0a0a','--th-toolbar':'#141414',
    '--th-border':'#222222','--th-border-strong':'#333333',
    '--th-text':'#f0f0f0','--th-muted':'#888888',
    '--th-faint':'#444444','--th-input':'#0a0a0a',
    '--th-header-bg':'rgba(10,10,10,0.97)',
    '--th-accent':'#d4587a','--th-accent-hover':'#e06e8c',
    '--th-rule':'#f0f0f0','--th-inv-bg':'#f0f0f0','--th-inv-text':'#0a0a0a'
  };
  var t=localStorage.getItem('theme');
  var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(t==='dark'||(t!=='light'&&sys)){
    var r=document.documentElement;
    Object.keys(dark).forEach(function(k){r.style.setProperty(k,dark[k]);});
    r.setAttribute('data-theme','dark');
  }
})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
