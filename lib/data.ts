// lib/data.ts
export interface LatestInvoice {
  amount: number;
  name: string;
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  return [
    { amount: 200, name: 'Alice' },
    { amount: 150, name: 'Bob' },
    { amount: 300, name: 'Charlie' },
    { amount: 450, name: 'Diana' },
    { amount: 120, name: 'Eve' },
  ];
}

export async function fetchRevenue() {
  return [
    { month: 'Jan', revenue: 2000 },
    { month: 'Feb', revenue: 1500 },
    { month: 'Mar', revenue: 2200 },
    { month: 'Apr', revenue: 2500 },
    { month: 'May', revenue: 3200 },
    { month: 'Jun', revenue: 3500 },
    { month: 'Jul', revenue: 3700 },
    { month: 'Aug', revenue: 3600 },
    { month: 'Sep', revenue: 2400 },
    { month: 'Oct', revenue: 2800 },
    { month: 'Nov', revenue: 3000 },
    { month: 'Dec', revenue: 5000 },
  ];
}
