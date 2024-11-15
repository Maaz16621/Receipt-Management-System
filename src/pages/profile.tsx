import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ProfileView } from 'src/sections/profile/view';
import Alert from '@mui/material/Alert';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [alert]);

  return (
    <>
      <Helmet>
        <title> {`Profile - ${CONFIG.appName}`}</title>
      </Helmet>

      {/* Display Alert at the top of the page */}
      {alert && (
        <Alert
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            marginTop:'50px',
            transform: 'translateX(-50%)',
            zIndex: '1400 !important',
            marginBottom: 2,
            width: 'auto', // Adjust width as needed
          }}
          severity={alert.type}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Pass alert state and setAlert function to ProfileView */}
      <ProfileView setAlert={setAlert} />
    </>
  );
}
