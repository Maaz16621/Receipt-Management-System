import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { SelectChangeEvent } from '@mui/material/Select';
// Your existing imports
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from '../table-no-data';
import { ReceiptTableRow, ReceiptProps } from '../receipt-table-row';
import { ReceiptTableHead } from '../receipt-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { ReceiptTableToolbar } from '../receipt-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export function DeletedReceiptView() {
  const table = useTable();
  const [receipts, setReceipts] = useState<ReceiptProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [startDate, setStartDate] = useState<string>('');
const [endDate, setEndDate] = useState<string>('');
// Define your state for paymentMethod
const [paymentMethod, setPaymentMethod] = useState<string>("");

const handlePaymentMethodChange = (event: SelectChangeEvent<string>) => {
  setPaymentMethod(event.target.value);
};

  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const fetchReceipts = async () => {
    try {
      const response = await axios.get<ReceiptProps[]>('https://api.brighttospecialhome.com/deletedReceipts');
      
      // Sort the receipts in descending order based on 'updated_at'
      const sortedReceipts = response.data.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setReceipts(sortedReceipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      // Consider setting an error state to notify the user
    }
  };
  useEffect(() => {


    fetchReceipts();
  }, []);
  const applyFilters = () => {
    let filteredReceipts = receipts;
  
    // Filter by name
    if (filterName) {
      filteredReceipts = filteredReceipts.filter((receipt) =>
        receipt.received_from.toLowerCase().includes(filterName.toLowerCase())
      );
    }
  
    // Filter by date range
    if (startDate) {
      filteredReceipts = filteredReceipts.filter((receipt) =>
        new Date(receipt.updated_at) >= new Date(startDate)
      );
    }
  
    if (endDate) {
      filteredReceipts = filteredReceipts.filter((receipt) =>
        new Date(receipt.updated_at) <= new Date(endDate)
      );
    }
  
    // Filter by payment method
    if (paymentMethod) {
      filteredReceipts = filteredReceipts.filter((receipt) =>
        receipt.payment_method && receipt.payment_method.toLowerCase() === paymentMethod.toLowerCase()
      );
    }
  
    return filteredReceipts;
  };
  
  
  const dataFiltered = applyFilters();
  const notFound = !dataFiltered.length && !!filterName;

  interface ExportableReceipt extends ReceiptProps {
    url?: string; // Add optional URL property
  }
  const restoreReceipt = async (receiptId: string) => {
    try {
      const response = await axios.post(`https://api.brighttospecialhome.com/receipts/${receiptId}/restore`);
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Receipt restored successfully', severity: 'success' });
       
    fetchReceipts();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      setSnackbar({ open: true, message: 'Failed to restore the receipt', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  return (
    <DashboardContent>
     <Snackbar 
  open={snackbar.open} 
  autoHideDuration={6000} 
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Align center at the top
>
  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
</Snackbar>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
         Deleted Receipts
        </Typography>
      

      </Box>

      <Card>
      <ReceiptTableToolbar
  numSelected={table.selected.length}
  filterName={filterName}
  onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    table.onResetPage();
  }}
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  paymentMethod={paymentMethod} // Make sure to include this
  onPaymentMethodChange={handlePaymentMethodChange} // Make sure to include this
  onFilter={() => table.onResetPage()} // Assuming you have this function defined
/>




        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ReceiptTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={receipts.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked: boolean) =>
                  table.onSelectAllRows(
                    checked,
                    receipts.map((receipt) => receipt.receipt_id)
                  )
                }
                headLabel={[
                  { id: 'receipt_id', label: 'Receipt ID' },
                  { id: 'received_from', label: 'Received From' },
                  { id: 'contact_number', label: 'Contact Number' },
                  { id: 'rn', label: 'RM' },
                  { id: 'payment_method', label: 'Payment Method' },
                  { id: 'collectedBy', label: 'Collected By' },
                  { id: 'updated_at', label: 'Last Updated' },
                  { id: '', label: '' },
                ]}
              />
              <TableBody>
               
{dataFiltered
  .slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  )
  .map((row: ReceiptProps) => (
    <ReceiptTableRow
      key={row.receipt_id}
      row={row}
      restoreReceipt={restoreReceipt} 
      selected={table.selected.includes(row.receipt_id)}
      onSelectRow={() => table.onSelectRow(row.receipt_id)}
    />
  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, receipts.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
  component="div"
  page={table.page}
  count={dataFiltered.length} // Updated to use filtered data count
  rowsPerPage={table.rowsPerPage}
  onPageChange={table.onChangePage}
  rowsPerPageOptions={[5, 10, 25]}
  onRowsPerPageChange={table.onChangeRowsPerPage}
/>
        
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('receipt_id');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      setSelected((prevSelected) => {
        const newSelected = prevSelected.includes(inputValue)
          ? prevSelected.filter((value) => value !== inputValue)
          : [...prevSelected, inputValue];
        return newSelected;
      });
    },
    []
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    page,
    orderBy,
    rowsPerPage,
    selected,
    order,
    onSort,
    onSelectAllRows,
    onSelectRow,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
  };
}
