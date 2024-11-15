import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { EditReceiptView } from 'src/sections/editreceipt/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Edit Receipt - ${CONFIG.appName}`}</title>
      </Helmet>

      <EditReceiptView />
    </>
  );
}
