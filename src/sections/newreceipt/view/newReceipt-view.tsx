import { useState } from 'react';
import {
  Box,
  Card,
  Button,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
  CircularProgress, // Import CircularProgress for the loader
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';

type FormDataType = {
  receivedFrom: string;
  contactNumber: string;
  sumRinggit: string;
  rm: string;
  collectedBy: string;
  remarks: string;
  paymentMethod: string;
  receiptFile: File | null;
};

export function NewReceiptView() {
  const [formData, setFormData] = useState<FormDataType>({
    receivedFrom: '',
    contactNumber: '',
    sumRinggit: '',
    rm: '',
    remarks: '',
    collectedBy: '',
    paymentMethod: 'cash',
    receiptFile: null,
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [generatedReceiptUrl, setGeneratedReceiptUrl] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prevData) => ({
        ...prevData,
        receiptFile: file,
      }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true); // Set loading to true before API call
    const formDataToSend = new FormData();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData ? userData.id : null;

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value as string | Blob);
      }
    });

    if (userId) {
      formDataToSend.append('userId', userId);
    }

    try {
      const response = await fetch('https://api.brighttospecialhome.com/receipts', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error response:', errorMessage);
        throw new Error(`Error submitting receipt: ${response.status}`);
      }

      const { generatedReceiptUrl: newGeneratedReceiptUrl } = await response.json();
      setGeneratedReceiptUrl(newGeneratedReceiptUrl);
      setFormSubmitted(true);

      setSnackbarMessage('Receipt submitted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setFormData({
        receivedFrom: '',
        contactNumber: '',
        sumRinggit: '',
        rm: '',
        collectedBy: '',
        remarks: '',
        paymentMethod: 'cash',
        receiptFile: null,
      });

      setTimeout(() => {
        handleSnackbarClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting receipt:', error);
      setSnackbarMessage('An error occurred while submitting the receipt.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);

      setTimeout(() => {
        handleSnackbarClose();
      }, 3000);
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  const downloadFile = () => {
    if (!generatedReceiptUrl) return;

    const url = `https://api.brighttospecialhome.com/${generatedReceiptUrl}`;
    saveAs(url, generatedReceiptUrl);
  };

  const handleNewReceipt = () => {
    setGeneratedReceiptUrl(null);
    setFormSubmitted(false);
    setFormData({
      receivedFrom: '',
      contactNumber: '',
      sumRinggit: '',
      rm: '',
      collectedBy: '',
      remarks: '',
      paymentMethod: 'cash',
      receiptFile: null,
    });
  };

  return (
    <DashboardContent>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          New Receipt
        </Typography>
      </Box>

      <Card sx={{ p: 4 }}>
        {/* Conditionally render loading spinner or the form or success message */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : !formSubmitted ? (
          <>
            <TextField
              fullWidth
              label="Received From"
              name="receivedFrom"
              value={formData.receivedFrom}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Sum in Ringgit"
              name="sumRinggit"
              value={formData.sumRinggit}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="RM"
              name="rm"
              type="number"
              value={formData.rm}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              type="text"
              value={formData.remarks}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Collected by"
              name="collectedBy"
              type="text"
              value={formData.collectedBy}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="cdm" control={<Radio />} label="CDM" />
                <FormControlLabel value="maybank" control={<Radio />} label="May Bank" />
                <FormControlLabel value="rhbbank" control={<Radio />} label="RHB Bank" />
                <FormControlLabel value="ambank" control={<Radio />} label="AMBank" />
                <FormControlLabel value="touchngo" control={<Radio />} label="Touch n Go/ DuitNow" />
              </RadioGroup>
            </FormControl>

            {formData.paymentMethod !== 'cash' && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    display: 'block',
                    mb: 2,
                    textAlign: 'center',
                    backgroundColor: '#f0f0f0',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  Upload Receipt
                  <input
                    type="file"
                    hidden
                    accept=".jpg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.receiptFile && (
                  <Typography variant="body2">
                    File: {formData.receiptFile.name}
                  </Typography>
                )}
              </Box>
            )}

            <Box textAlign="right">
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </>
        ) : (
          // Display the success message and buttons if the form has been submitted
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">Receipt Created Successfully!</Typography>
            <img src={`https://api.brighttospecialhome.com/${generatedReceiptUrl}`} alt="Generated Receipt" style={{ maxWidth: '100%', margin: '20px 0' }} />
            <Button
  variant="contained"
  color="primary"
  onClick={downloadFile}
  sx={{ mr: 2 }}
>
  Download
</Button>


            <Button
              variant="outlined"
              onClick={handleNewReceipt}
            >
              Create New
            </Button>
          </Box>
        )}
      </Card>
    </DashboardContent>
  );
}
