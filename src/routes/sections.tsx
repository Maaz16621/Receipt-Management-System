import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';


// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const SettingPage = lazy(() => import('src/pages/settings'));
export const ReceiptPage = lazy(() => import('src/pages/receipt'));
export const NewReceiptPage = lazy(() => import('src/pages/newReceipt'));
export const DeltedReceiptsPage = lazy(() => import('src/pages/deletedReceipts'));
export const EditReceiptPage = lazy(() => import('src/pages/editReceipt'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/sign-in" replace />, // Redirect root to "sign-in"
    },
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { path: 'home', element: <HomePage /> }, // Changed from index: true to explicit "home" path
        { path: 'user', element: <UserPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'receipts', element: <ReceiptPage /> },
        { path: 'newReceipt', element: <NewReceiptPage /> },
        { path: 'deletedReceipts', element: <DeltedReceiptsPage /> },
        { path: 'editReceipt/:id', element: <EditReceiptPage /> },

      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
