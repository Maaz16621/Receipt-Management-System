import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ReceiptView } from 'src/sections/receipts/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Receipts - ${CONFIG.appName}`}</title>
      </Helmet>

      <ReceiptView />
    </>
  );
}
