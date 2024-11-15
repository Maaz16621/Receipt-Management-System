import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';

interface SignInViewProps {
  setAlert: (alert: { type: 'success' | 'error'; message: string } | null) => void;
}

export function SignInView({ setAlert }: SignInViewProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      router.push('/home');
    }
  }, [router]);

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await fetch('https://api.brighttospecialhome.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        setAlert({ type: 'success', message: 'Login successful' });
        router.push('/home');
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', message: errorData.message || 'An error occurred, please try again' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Server is not responding' });
    } finally {
      setLoading(false);
    }
  }, [email, password, router, setAlert]);

  const handleSendOtp = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await axios.post('https://api.brighttospecialhome.com/sendotp', { email });
      if (response.data.success) {
        setOtpSent(true);
        setAlert({ type: 'success', message: 'OTP sent to your email' });
      } else {
        setAlert({ type: 'error', message: response.data.message || 'Unable to send OTP' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error sending OTP' });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to reset password
  const handleResetPassword = async () => {
    setLoading(true);
    setAlert(null);
    try {
      if (newPassword !== confirmPassword) {
        setAlert({ type: 'error', message: 'Passwords do not match' });
        return;
      }
  
      const response = await axios.post('https://api.brighttospecialhome.com/reset-password', {
        email,
        otp,
        newPassword,
      });
      if (response.data.success) {
        setAlert({ type: 'success', message: 'Password reset successfully' });
        setIsForgotPassword(false);
        setOtpSent(false);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setAlert({ type: 'error', message: response.data.message || 'Error resetting password' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Unable to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{isForgotPassword ? 'Forgot Password' : 'Sign in'}</Typography>

      {!isForgotPassword ? (
        <>
          <TextField
            fullWidth
            label="Email address or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <LoadingButton
            fullWidth
            size="large"
            loading={loading}
            color="inherit"
            variant="contained"
            onClick={handleSignIn}
          >
            Sign in
          </LoadingButton>

          <Button onClick={() => setIsForgotPassword(true)} sx={{ mt: 2 }}>
            Forgot Password?
          </Button>
        </>
      ) : !otpSent ? (
        <>
          <TextField
            fullWidth
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <LoadingButton
            fullWidth
            size="large"
            loading={loading}
            color="inherit"
            variant="contained"
            onClick={handleSendOtp}
          >
            Send OTP
          </LoadingButton>

          <Button onClick={() => setIsForgotPassword(false)} sx={{ mt: 2 }}>
            Back to Sign In
          </Button>
        </>
      ) : (
        <>
          <TextField
            fullWidth
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <LoadingButton
            fullWidth
            size="large"
            loading={loading}
            color="inherit"
            variant="contained"
            onClick={handleResetPassword}
          >
            Reset Password
          </LoadingButton>

          <Button onClick={() => setIsForgotPassword(false)} sx={{ mt: 2 }}>
            Back to Sign In
          </Button>
        </>
      )}
    </Box>
  );
}
