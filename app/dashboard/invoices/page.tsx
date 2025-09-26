import CreateInvoiceForm from '@/app/ui/invoices/create-form';
import InvoiceList from '@/app/ui/invoices/invoice-list';

const demoCustomers = [
  { id: 'cust_1', name: 'Ana Silva' },
  { id: 'cust_2', name: 'Carlos Souza' },
  { id: 'cust_3', name: 'Beatriz Lima' },
  { id: 'cust_4', name: 'Daniel Oliveira' },
  { id: 'cust_5', name: 'Cliente X' },
];

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <CreateInvoiceForm customers={demoCustomers} />
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Invoices</h2>
          <InvoiceList />
        </div>
      </div>
    </div>
  );
}

