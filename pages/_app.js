import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.documentElement.style.background = '#0a0a0f';
    document.body.style.background = '#0a0a0f';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return <Component {...pageProps} />;
}
