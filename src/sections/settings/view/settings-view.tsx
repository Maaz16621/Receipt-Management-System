import Alert from '@mui/material/Alert';
import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { _myAccount } from 'src/_mock';
import { styled } from '@mui/material/styles';
import { DashboardContent } from 'src/layouts/dashboard';

const OverlayLabel = styled('label')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay background
  color: 'white',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    opacity: 1,
  },
}));

interface SettingViewProps {
  setAlert: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>>;
}

export function SettingView({ setAlert }: SettingViewProps) {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    username: '',
    userType: '',
    profilePicUrl: '',
  });

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false); // State to control modal visibility
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.id; // Assuming 'id' is the key for user ID

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdatePassword = async () => {
    // Validate password matching
    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    // Call the API to update the password
    try {
      const response = await axios.put(`https://api.brighttospecialhome.com/users/${userId}/password`, {
        oldPassword,
        newPassword,
      });

      // Check if the update was successful
      if (response.status === 200) {
        setAlert({ type: 'success', message: 'Password updated successfully!' });
        handleClose(); // Close the modal
      }
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);

      // Handle different error responses
      if (error.response) {
        const errorMessage = error.response.data.message || 'An error occurred while updating password.';
        setAlert({ type: 'error', message: errorMessage });
      } else {
        setAlert({ type: 'error', message: 'Network error. Please try again later.' });
      }
    }
  };

  useEffect(() => {
    
    const fetchUserData = async () => {
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      try {
        const response = await axios.get(`https://api.brighttospecialhome.com/users/${userId}`);
        setUserDetails({
          name: `${response.data.first_name || ''} ${response.data.last_name || ''}`,
          email: response.data.email || '',
          username: response.data.username || '',
          userType: response.data.userType || '',
          profilePicUrl: response.data.profilePic_url || _myAccount.photoURL,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleUpdateDetails = useCallback(async () => {
    const formData = new FormData();

    // Append the profile picture if it exists
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    // Append other user details
    formData.append('name', userDetails.name);
    formData.append('email', userDetails.email);
    formData.append('username', userDetails.username);
    formData.append('userType', userDetails.userType);

    try {
      // Send the PUT request to update user details
      const response = await axios.put(`https://api.brighttospecialhome.com/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if the update was successful
      if (response.status === 200) {
        const updatedUser = response.data; // Assuming the response contains the updated user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Merge updated user data with current user data
        const mergedUser = {
          ...currentUser, // Retain existing properties
          ...updatedUser, // Update with new values
        };

        // Store merged user info in localStorage
        localStorage.setItem('user', JSON.stringify(mergedUser));

        // Set success alert
        setAlert({ type: 'success', message: 'User details updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating user details:', error.response ? error.response.data : error.message);
      // Set error alert
      setAlert({ type: 'error', message: error.response?.data?.message || 'An error occurred while updating user details.' });
    }
  }, [profilePicFile, userDetails, userId, setAlert]);

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicFile(file); // Save the uploaded file in the state
      const reader = new FileReader();

      // Set the reader onload function to update the profile picture
      reader.onloadend = () => {
        setUserDetails(prev => ({ ...prev, profilePicUrl: reader.result as string }));
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardContent>
    <Box p={3} maxWidth="1000px" margin="0 auto">
    {/* Display Alert */}
 


    {/* Update Password Button */}
    <Box mb={2} textAlign="right">
    <Button variant="contained" color="primary" onClick={handleClickOpen}>
      Update Password
    </Button>
    </Box>

    {/* User Profile Card */}
    <Card>
      <CardContent>
     

        <Grid container>
          {/* Left Side: Profile Image with Upload Overlay */}
          <Grid item xs={4} sx={{ position: 'relative' }}>
            <Avatar
              src={userDetails.profilePicUrl || _myAccount.photoURL}
              alt={userDetails.name}
              sx={{ width: 150, height: 150, margin: '0 auto', borderRadius: '50%' }} // Circular image
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-pic-upload"
              type="file"
              title='profilepic'
              onChange={handleProfilePicUpload}
            />
            <OverlayLabel sx={{ width: 150, height: 150, margin: '0 auto', borderRadius: '50%' }} htmlFor="profile-pic-upload">
              <Typography variant="h6">Upload New Pic</Typography>
            </OverlayLabel>
          </Grid>

          {/* Right Side: Name and User Type */}
          <Grid item xs={8}>
            <Typography variant="h5" gutterBottom>
              {userDetails.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userDetails.username}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userDetails.userType}
            </Typography>
          </Grid>
        </Grid>

        {/* User Details Form */}
        <Box mt={4}>
          <TextField
            label="Name"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Username"
            name="username"
            value={userDetails.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />

          {/* Update Button */}
          <Box textAlign="right" mt={2}>
            <Button variant="contained" color="secondary" onClick={handleUpdateDetails}>
              Update Details
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Update Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Old Password"
          type="password"
          fullWidth
          variant="outlined"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Confirm New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdatePassword} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  </DashboardContent>
  );
}
