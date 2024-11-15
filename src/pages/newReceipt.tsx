import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NewReceiptView } from 'src/sections/newreceipt/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`New Receipt - ${CONFIG.appName}`}</title>
      </Helmet>

      <NewReceiptView />
    </>
  );
}
