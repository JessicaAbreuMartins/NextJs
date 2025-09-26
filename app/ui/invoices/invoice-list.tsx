'use client';
import { useEffect, useState } from 'react';
import { getInvoices, Invoice } from '@/app/lib/localInvoices';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoices(getInvoices());
    const handler = () => setInvoices(getInvoices());
    window.addEventListener('invoicesUpdated', handler);
    return () => window.removeEventListener('invoicesUpdated', handler);
  }, []);

  if (!invoices.length) return <p>Nenhuma fatura ainda.</p>;

  return (
    <table className="table-auto w-full border-collapse mt-4">
      <thead>
        <tr>
          <th className="p-2 text-left">Date</th>
          <th className="p-2 text-left">Customer</th>
          <th className="p-2 text-right">Amount</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{inv.date}</td>
            <td className="p-2">{inv.customerId}</td>
            <td className="p-2 text-right">${inv.amount.toFixed(2)}</td>
            <td className="p-2">{inv.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
