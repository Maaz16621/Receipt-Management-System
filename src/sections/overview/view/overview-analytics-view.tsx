// ----------------------------------------------------------------------
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'axios';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';




// Define the Receipt interface
interface Receipt {
  updated_at: string; // Assuming date is in string format (ISO 8601)
  rm: number; // Amount donated
  payment_method: string; // Payment method used
}

// Define the data structure for last six months data
interface MonthData {
  month: string;
  total: number;
}
export function OverviewAnalyticsView() {
  const [data, setData] = useState<Receipt[]>([]);
  const [todayDonations, setTodayDonations] = useState(0);
  const [thisMonthDonations, setThisMonthDonations] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [lastSixMonthsData, setLastSixMonthsData] = useState<MonthData[]>([]); // Update to hold month data
  const [donationsByPaymentMethod, setDonationsByPaymentMethod] = useState<{ label: string; value: number }[]>([]);

  // Fetch receipt data
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('https://api.brighttospecialhome.com/receipts');
        console.log('API Response:', response.data); // Log the response data
        const receipts: Receipt[] = response.data; // assuming the response data is an array of receipts
        setData(receipts);
        calculateDonations(receipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };
    

    fetchReceipts();
  }, []);

  const calculateDonations = (receipts: Receipt[]) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const paymentMethods: { label: string; value: number }[] = [];
    // Prepare the last six months data
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        total: 0,
      };
    }).reverse();
  
    let todayTotal: number = 0;
    let monthTotal: number = 0;
    let total: number = 0;
   
    receipts.forEach(receipt => {
      const receiptDate = new Date(receipt.updated_at);
      const amount = parseFloat(receipt.rm.toString()); // Convert to number safely
  
      console.log(`Receipt Date: ${receiptDate}, Amount: ${amount}`);
  
      // Total donations
      total += amount;
  
      // Today's donations
      if (receiptDate.toDateString() === today.toDateString()) {
        todayTotal += amount;
      }
  
      // This month's donations
      if (receiptDate >= startOfMonth) {
        monthTotal += amount;
      }
  
      // Donations by payment method
      const method = receipt.payment_method;
      if (paymentMethods.some(pm => pm.label === method)) {
        const index = paymentMethods.findIndex(pm => pm.label === method);
        paymentMethods[index].value += amount;
      } else {
        paymentMethods.push({ label: method, value: amount });
      }
      // Update last six months totals
      const monthIndex = lastSixMonths.findIndex(monthData => monthData.month === receiptDate.toLocaleString('default', { month: 'short' }));
      if (monthIndex !== -1) {
        lastSixMonths[monthIndex].total += amount;
      }
    });
    const chartData = lastSixMonths.map(monthData => monthData.total);
    setTodayDonations(todayTotal);
    setThisMonthDonations(monthTotal);
    setTotalDonations(total);
    setDonationsByPaymentMethod(paymentMethods);
    setLastSixMonthsData(lastSixMonths);
    
    console.log('Today\'s Donations:', todayTotal);
    console.log('This Month\'s Donations:', monthTotal);
    console.log('Total Donations:', total);
    console.log('Donations by Payment Method:', paymentMethods);
  };
  const cardData = [
    {
      title: "Today's Donations",
      total: todayDonations,
      icon: <img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />,
    },
    {
      title: "This Month's Donations",
      total: thisMonthDonations,
      icon: <img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />,
      color: "secondary" as const, // Ensure it's a valid type
    },
    {
      title: "Total Donations",
      total: totalDonations,
      icon: <img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />,
      color: "warning" as const, // Ensure it's a valid type
    },
   
  ];


  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container  gap={2} >
      {cardData.map((cards, index) => (
        <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: { xs: 3, md: 5 } }} > {/* Specify component prop if needed */}
          <AnalyticsWidgetSummary
            title={cards.title}
            total={cards.total}
            icon={cards.icon}
            color={cards.color} // Ensure this is a valid value
          />
        </Grid>
      ))}
{/* this is pie chart */}
        <Grid xs={12} md={6} lg={4} >
          <AnalyticsCurrentVisits
            title="Payment Methods"
            chart={{
              series: donationsByPaymentMethod, 
            }}
          />
        </Grid>
{/* this is bar chart */}
        <Grid xs={12} md={6} lg={7}>
          <AnalyticsWebsiteVisits
        title="Last 6 Month Report"
        subheader=""
        chart={{
          categories: lastSixMonthsData.map(monthData => monthData.month),
          series: [
            {
              name: 'Donations',
              data: lastSixMonthsData.map(monthData => monthData.total),
            },
          ],
        }}
      />
        </Grid>


   

      

      
      </Grid>
    </DashboardContent>
  );
}
