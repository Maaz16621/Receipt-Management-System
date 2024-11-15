import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  added_by?: string; // Make this optional
  id?: string; // Make this optional
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
  deleteReceipt: (id: string) => void; // New delete prop
};

export function ReceiptTableRow({ row, selected, onSelectRow, deleteReceipt }: ReceiptTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleDelete = (id: string) => {
    deleteReceipt(id);  // Call deleteReceipt function
    handleClosePopover();  // Close the popover after deletion
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            {row.receipt_id}
          </Box>
        </TableCell>

        <TableCell>{row.received_from}</TableCell>

        <TableCell>{row.contact_number}</TableCell>

        <TableCell>{Math.floor(row.rm)}</TableCell>

        <TableCell>{row.payment_method}</TableCell>

        <TableCell>{row.collectedBy}</TableCell>

        <TableCell>{new Date(row.updated_at).toLocaleString()}</TableCell>

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
          <Link to={`/editReceipt/${row.receipt_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
  <MenuItem>
    <Iconify icon="uil:edit" />
    Edit
  </MenuItem>
</Link>

          {row.receipt_file ? (
            <MenuItem onClick={() => {
              const receiptUrl = `https://api.brighttospecialhome.com/${row.receipt_file}`;
              window.open(receiptUrl, '_blank');
            }}>
              <Iconify icon="solar:document-bold" />
              View Payment Proof
            </MenuItem>
          ) : null}

          <MenuItem onClick={() => {
            const receiptUrl = `https://api.brighttospecialhome.com/${row.generated_receipt}`;
            window.open(receiptUrl, '_blank');
          }}>
            <Iconify icon="solar:document-bold" />
            View Receipt
          </MenuItem>

          <MenuItem onClick={() => handleDelete(row.receipt_id)}>
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'red' }} />
            Delete
          </MenuItem>
        </MenuList>

      </Popover>
    </>
  );
}
