
import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/home',
    icon: icon('ic-analytics'),
  },

  {
    title: 'Receipts',
    path: '/receipts',
    icon:  <Iconify width={24} icon="fa:list-alt" />,
  },
  {
    title: 'Create Receipt',
    path: '/newReceipt',
    icon:  <Iconify width={24} icon="oui:list-add" />,
  },
  {
    title: 'Deleted Receipts',
    path: '/deletedReceipts',
    icon:  <Iconify width={24} icon="ion:trash-bin-sharp" />,
  },

];
