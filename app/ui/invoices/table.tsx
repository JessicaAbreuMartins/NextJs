import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';

interface Invoice {
  id: number;
  name?: string;
  email?: string;
  amount?: number;
  date?: string;
  status?: string;
  image_url?: string;
}

interface InvoicesTableProps {
  invoicesData?: { invoices: Invoice[]; totalPages: number }; // invoicesData pode ser undefined
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function InvoicesTable({ invoicesData, currentPage, setCurrentPage }: InvoicesTableProps) {
  // fallback seguro caso invoicesData seja undefined
  const { invoices = [], totalPages = 0 } = invoicesData || {};

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">

          {/* Mobile */}
          <div className="md:hidden">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url ?? '/placeholder.png'}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name ?? 'Customer'}'s profile picture`}
                      />
                      <p>{invoice.name ?? '-'}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email ?? '-'}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">{formatCurrency(invoice.amount)}</p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Customer</th>
                <th className="px-3 py-5 font-medium">Email</th>
                <th className="px-3 py-5 font-medium">Amount</th>
                <th className="px-3 py-5 font-medium">Date</th>
                <th className="px-3 py-5 font-medium">Status</th>
                <th className="relative py-3 pl-6 pr-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="w-full border-b py-3 text-sm last-of-type:border-none">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 flex items-center gap-3">
                    <Image
                      src={invoice.image_url ?? '/placeholder.png'}
                      className="rounded-full"
                      width={28}
                      height={28}
                      alt={`${invoice.name ?? 'Customer'}'s profile picture`}
                    />
                    <p>{invoice.name ?? '-'}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{invoice.email ?? '-'}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatCurrency(invoice.amount)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatDateToLocal(invoice.date)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 flex justify-end gap-3">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação simples */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
