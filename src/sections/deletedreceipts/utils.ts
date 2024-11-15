import { parseISO, isWithinInterval } from 'date-fns';
import type { ReceiptProps } from './receipt-table-row';

// ----------------------------------------------------------------------

// Visually hidden styles for accessibility
export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

// Calculate the number of empty rows based on pagination
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

// Comparator for sorting in descending order
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// ----------------------------------------------------------------------

// Get the comparator function based on sort order and property
export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (
  a: {
    [key in Key]: number | string;
  },
  b: {
    [key in Key]: number | string;
  }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

// Apply filter to the receipt data
type ApplyFilterProps = {
  inputData: ReceiptProps[];
  filterName: string;
  comparator: (a: any, b: any) => number;
  startDate?: string; // Optional start date
  endDate?: string;   // Optional end date
  paymentMethod?: string; // Optional payment method for filtering
};
export function applyFilter({
  inputData,
  comparator,
  filterName,
  startDate,
  endDate,
  paymentMethod,
}: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // Apply text-based filtering
  if (filterName) {
    const lowerCaseFilterName = filterName.toLowerCase(); // Normalize filter name

    inputData = inputData.filter((receipt) => {
      const received_from = receipt.received_from && receipt.received_from.toLowerCase().includes(lowerCaseFilterName);
      const sum_ringgit = receipt.sum_ringgit && receipt.sum_ringgit.toString().toLowerCase().includes(lowerCaseFilterName);
      const payment_method = receipt.payment_method && receipt.payment_method.toLowerCase().includes(lowerCaseFilterName);

      return sum_ringgit || received_from || payment_method; // Return true if any match
    });
  }

  // Apply payment method filtering
  if (paymentMethod) {
    const lowerCasePaymentMethod = paymentMethod.toLowerCase();
    inputData = inputData.filter((receipt) => 
      receipt.payment_method && receipt.payment_method.toLowerCase() === lowerCasePaymentMethod
    );
  }

  // Apply date range filtering
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    inputData = inputData.filter((receipt) => {
      const receiptDate = parseISO(receipt.updated_at);
      return isWithinInterval(receiptDate, { start, end });
    });
  }

  return inputData;
}
