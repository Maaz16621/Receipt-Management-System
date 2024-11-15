import type { TableRowProps } from '@mui/material/TableRow';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

// Props for rendering empty rows in a receipts table
type TableEmptyRowsProps = TableRowProps & {
  emptyRows: number;  // Number of empty rows to render
  height?: number;    // Optional height for the rows
};

export function TableEmptyRows({ emptyRows, height, sx, ...other }: TableEmptyRowsProps) {
  // If there are no empty rows, do not render anything
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        ...(height && {
          height: height * emptyRows,  // Set height based on the number of empty rows
        }),
        ...sx,
      }}
      {...other}
    >
      <TableCell colSpan={5} /> {/* Adjust colSpan if needed based on the number of receipt columns */}
    </TableRow>
  );
}
