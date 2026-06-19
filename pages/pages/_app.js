export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html, body {
          background: #0a0a0f;
          margin: 0;
          padding: 0;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
