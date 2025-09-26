export type Invoice = {
  customerId: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
};

export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('invoices') || '[]') as Invoice[];
  } catch {
    return [];
  }
}

export function saveInvoice(invoice: Invoice) {
  if (typeof window === 'undefined') return;
  const invoices = getInvoices();
  invoices.unshift(invoice); // coloca a nova no topo
  localStorage.setItem('invoices', JSON.stringify(invoices));
  window.dispatchEvent(new CustomEvent('invoicesUpdated'));
}

export function clearInvoices() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('invoices');
  window.dispatchEvent(new CustomEvent('invoicesUpdated'));
}
