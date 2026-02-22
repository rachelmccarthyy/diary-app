import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Diary',
  description: 'A private diary for your thoughts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var dark={
    '--th-bg':'#181715','--th-card':'#221f1d','--th-toolbar':'#2a2826',
    '--th-border':'#3d3a36','--th-text':'#f0eeea','--th-muted':'#a8a29e',
    '--th-faint':'#57534e','--th-input':'#1c1917',
    '--th-header-bg':'rgba(24,23,21,0.92)'
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
