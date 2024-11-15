import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DeletedReceiptView } from 'src/sections/deletedreceipts/view';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Deleted Receipts - ${CONFIG.appName}`}</title>
      </Helmet>

      <DeletedReceiptView />
    </>
  );
}
