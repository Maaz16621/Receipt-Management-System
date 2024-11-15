import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select'; // Import Select component
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem for options
import { Iconify } from 'src/components/iconify';
import { SelectChangeEvent } from '@mui/material'; // Single import for SelectChangeEvent

type ReceiptTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  paymentMethod: string; // New prop for selected payment method
  onPaymentMethodChange: (event: SelectChangeEvent<string>) => void; // Change type to SelectChangeEvent<string>
  onFilter: () => void; // New prop for the filter button click handler
};

export function ReceiptTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  paymentMethod,
  onPaymentMethodChange,
  onFilter,
}: ReceiptTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search receipt..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320 }}
        />
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>

      {/* Dropdown for Payment Method */}
      <Select
        value={paymentMethod}
        onChange={onPaymentMethodChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Payment Method' }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">
          All
        </MenuItem>
        <MenuItem value="cash">Cash</MenuItem>
    <MenuItem value="touchngo">Touch &apos;n Go</MenuItem>
    <MenuItem value="cdm">CDM</MenuItem>
    <MenuItem value="rhbbank">RHB Bank</MenuItem>
    <MenuItem value="ambank">AMBank</MenuItem>
    <MenuItem value="maybank">May Bank</MenuItem>
      </Select>

    
    </Toolbar>
  );
}
