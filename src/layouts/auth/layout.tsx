import { useState, useEffect } from 'react';
import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import Alert from '@mui/material/Alert';

import { stylesMode } from 'src/theme/styles';

import { Logo } from 'src/components/logo';

import { Main } from './main';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';

// ----------------------------------------------------------------------

export type AuthLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function AuthLayout({ sx, children, header }: AuthLayoutProps) {
  const layoutQuery: Breakpoint = 'sm';
  const [marginTop, setMarginTop] = useState('50px'); // Default margin

  const handleResize = () => {
    if (window.innerWidth <= 600) {
      setMarginTop('0px'); // Set margin for mobile
    } else {
      setMarginTop('50px'); // Set margin for larger screens
    }
  };

  useEffect(() => {
    handleResize(); // Set initial margin on mount
    window.addEventListener('resize', handleResize); // Add event listener for resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup event listener
    };
  }, []);
  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: { maxWidth: false },
            toolbar: { sx: { bgcolor: 'transparent', backdropFilter: 'unset' } },
          }}
          sx={{
            position: { [layoutQuery]: 'fixed' },

            ...header?.sx,
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
        
           
          }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{ '--layout-auth-content-width': '420px' }}
      sx={{
        '&::before': {
          width: 1,
          height: 1,
          zIndex: -1,
          content: "''",
          opacity: 0.24,
          position: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundImage: `url(/assets/background/overlay.jpg)`,
          [stylesMode.dark]: { opacity: 0.08 },
        },
        ...sx,
      }}
    >    
   <img
      src="/assets/Jiong.png" // Replace with the actual path to Jiong.png
      alt="Jiong"
      style={{
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop, // Use dynamic margin with shorthand notation
        marginBottom: '16px', // Adjust spacing as needed
        width: '300px', // Set the width as required
        height: 'auto',
      }}
    />
     
      <Main layoutQuery={layoutQuery}>
      <Logo sx={{ marginLeft:'auto',  marginRight:'auto', marginBottom: 1, display: 'flex', justifyContent: 'center' , width:100, height:100}} />

        {children}</Main>
    </LayoutSection>
  );
}
