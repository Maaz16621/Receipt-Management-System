import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';
// ----------------------------------------------------------------------

export type ReceiptProps = {
  id: string;
  date: string;        // The date of the receipt
  rm: number;         // The amount associated with the receipt
  status: string;     // Status (e.g., "paid", "pending", "refunded")
  issuedBy: string;   // The name of the user or company that issued the receipt
  receipt_id: string; // Unique receipt identifier
  received_from: string; // Name or details of the entity from whom the receipt is received
  contact_number: string; // Contact number associated with the receipt
  sum_ringgit: string; // Total amount in Ringgit
  payment_method: string; // Payment method used
  updated_at: string;    // The last updated date
  generated_receipt: string;
  collectedBy: string;
  receipt_file?: string; // Optional field for receipt file
};

type ReceiptTableRowProps = {
  row: ReceiptProps;
  selected: boolean;
  onSelectRow: () => void;
  restoreReceipt: (id: string) => void; // New delete prop
};

export function ReceiptTableRow({ row, selected, onSelectRow, restoreReceipt }: ReceiptTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);


  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
       

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            {row.receipt_id}
          </Box>
        </TableCell>

        <TableCell>
          {row.received_from}
        </TableCell>

        <TableCell>
          {row.contact_number}
        </TableCell>

        <TableCell>
        {Math.floor(row.rm)}
        </TableCell>
        <TableCell>
          {row.payment_method}
        </TableCell>
        <TableCell>
          {row.collectedBy}
        </TableCell>
        <TableCell>
          {new Date(row.updated_at).toLocaleString()} {/* Format updated_at date */}
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
       

       {row.receipt_file ? ( // Check if receipt_file is not empty
  <MenuItem onClick={() => {
    // Replace 'receipt_id' with the actual receipt ID or use a property that holds the ID
   const receiptUrl = `https://api.brighttospecialhome.com/${row.receipt_file}`; // Adjust based on your route structure
    window.open(receiptUrl, '_blank'); // Open receipt in a new tab/window

  }}>
    <Iconify icon="solar:document-bold" />
    View Payment Proof
  </MenuItem>
) : null}


<MenuItem 
  onClick={() => {
    // Replace 'receipt_id' with the actual receipt ID or use a property that holds the ID
   const receiptUrl = `https://api.brighttospecialhome.com/${row.generated_receipt}`; // Adjust based on your route structure
    window.open(receiptUrl, '_blank'); // Open receipt in a new tab/window
  }}
>
  <Iconify icon="solar:document-bold" />
  View Receipt
</MenuItem>

<MenuItem onClick={() => restoreReceipt(row.receipt_id)}>
<Iconify icon="mdi:backup-restore" sx={{ color: 'green' }} />

  Restore
</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
