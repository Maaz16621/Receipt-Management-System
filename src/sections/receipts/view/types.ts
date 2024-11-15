// In receipt-view.tsx
export type ReceiptProps = {
    id: string;
    date: string;        // The date of the receipt
    rm: number;         // The amount associated with the receipt
    status: string;     // Status (e.g., "paid", "pending", "refunded")
    issuedBy: string;   // The name of the user or company that issued the receipt
    receipt_id: string; // Unique receipt identifier
    received_from: string; // Name or details of the entity from whom the receipt is received
    contact_number: string; // Contact number associated with the receipt
    sum_ringgit: number; // Total amount in Ringgit
    payment_method: string; // Payment method used
    updated_at: Date;    // The last updated date
    receipt_file?: string; // Optional field for receipt file
  };
  