import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

// Props for the receipts table header
type ReceiptTableHeadProps = {
  orderBy: string; // Current sorting attribute
  rowCount: number; // Total number of rows
  numSelected: number; // Number of selected rows
  order: 'asc' | 'desc'; // Sort order
  onSort: (id: string) => void; // Function to handle sorting
  headLabel: { id: string; label: string; align?: 'left' | 'center' | 'right'; width?: number; minWidth?: number }[]; // Header labels
  onSelectAllRows: (checked: boolean) => void; // Function to select/deselect all rows
};

export function ReceiptTableHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
}: ReceiptTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
       
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
