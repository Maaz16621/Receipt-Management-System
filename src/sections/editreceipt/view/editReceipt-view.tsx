import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { DashboardContent } from 'src/layouts/dashboard';

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

export function EditReceiptView() {
  const { id: receiptId } = useParams(); // Get receipt ID from the URL
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
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [generatedReceiptUrl, setGeneratedReceiptUrl] = useState('');
  const [isReceiptGenerated, setIsReceiptGenerated] = useState(false); // Track if receipt is generated
  const navigate = useNavigate();

  // Fetch receipt details
  useEffect(() => {
    const fetchReceiptDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.brighttospecialhome.com/receipts/${receiptId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch receipt details');
        }
        const data = await response.json();
        setFormData({
          receivedFrom: data.received_from || '',
          contactNumber: data.contact_number || '',
          sumRinggit: data.sum_ringgit || '',
          rm: data.rm || '',
          remarks: data.remarks || '',
          collectedBy: data.collectedBy || '',
          paymentMethod: data.payment_method || 'cash',
          receiptFile: null,
        });
      } catch (error) {
        console.error('Error fetching receipt details:', error);
        setSnackbarMessage('Failed to load receipt details.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (receiptId) {
      fetchReceiptDetails();
    }
  }, [receiptId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleGoToReceiptsPage = () => {
    navigate('/receipts'); // Navigate to the receipts page
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('receivedFrom', formData.receivedFrom);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('sumRinggit', formData.sumRinggit);
      formDataToSend.append('rm', formData.rm);
      formDataToSend.append('remarks', formData.remarks);
      formDataToSend.append('collectedBy', formData.collectedBy);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      if (formData.receiptFile) {
        formDataToSend.append('receiptFile', formData.receiptFile);
      }

      const response = await fetch(`https://api.brighttospecialhome.com/updateReceipt/${receiptId}`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to update receipt');
      }

      const data = await response.json();
      setSnackbarMessage(data.message || 'Receipt updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Assuming the response contains the updated receipt URL:
      if (data.generatedReceiptUrl) {
        setGeneratedReceiptUrl(data.generatedReceiptUrl);
        setIsReceiptGenerated(true); // Mark receipt as generated
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      setSnackbarMessage('Failed to update receipt.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!generatedReceiptUrl) return;

    const url = `https://api.brighttospecialhome.com/${generatedReceiptUrl}`;
    saveAs(url, generatedReceiptUrl);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleNewReceipt = () => {
    navigate('/create-receipt');
  };

  return (
    <DashboardContent>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Edit Receipt
        </Typography>
      </Box>

      <Card sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : isReceiptGenerated ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">Receipt Created Successfully!</Typography>
            <img
              src={`https://api.brighttospecialhome.com/${generatedReceiptUrl}`}
              alt="Generated Receipt"
              style={{ maxWidth: '100%', margin: '20px 0' }}
            />
            <Button variant="contained" color="primary" onClick={downloadFile} sx={{ mr: 2 }}>
              Download
            </Button>
            <Button variant="contained" color="secondary" onClick={handleGoToReceiptsPage}>
              View All Reciepts
            </Button>
          </Box>
        ) : (
          <>
            {/* Form Fields */}
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
              value={formData.remarks}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Collected by"
              name="collectedBy"
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
                <FormControlLabel value="touchngo" control={<Radio />} label="Touch n Go" />
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

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </>
        )}
      </Card>
    </DashboardContent>
  );
}
