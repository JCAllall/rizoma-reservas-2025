import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <Component {...pageProps} />
    </>
  );
}