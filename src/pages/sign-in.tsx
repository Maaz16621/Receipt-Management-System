// src/pages/sign-in.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Alert from '@mui/material/Alert';

import { CONFIG } from 'src/config-global';

import { SignInView } from 'src/sections/auth';

// Define the Alert type
interface AlertState {
  type: 'success' | 'error' | 'info' | 'warning'; // You can add more types if needed
  message: string;
}

export default function Page() {
  const [alert, setAlert] = useState<AlertState | null>(null); // State to manage the alert

  return (
    <>
      <Helmet>
        <title>{`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <SignInView setAlert={setAlert} />
    </>
  );
}
