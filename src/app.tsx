import 'src/global.css';

import { Router } from 'src/routes/sections';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { ThemeProvider } from 'src/theme/theme-provider';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from './Loader'; // Ensure the case matches

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  const [loading, setLoading] = useState(false);
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null);

  // Set up Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      setLoading(true);
      setRequestStartTime(Date.now());
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      async (response) => {
        const duration = Date.now() - (requestStartTime ?? Date.now());
        const showLoaderFor = Math.max(2000 - duration, 0);

        await new Promise((resolve) => setTimeout(resolve, showLoaderFor));

        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [requestStartTime]);

  return (
    <ThemeProvider>
      {loading && <Loader />}
      <Router />
    </ThemeProvider>
  );
}
