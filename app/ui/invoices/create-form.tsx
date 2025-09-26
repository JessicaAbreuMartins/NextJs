'use client';
import { FormEvent, useState } from 'react';
import { saveInvoice } from '@/app/lib/localInvoices';
import { Button } from '@/app/ui/button';

type Customer = { id: string; name: string };

export default function CreateInvoiceForm({ customers }: { customers: Customer[] }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const customerId = (formData.get('customerId') || '') as string;
    const amount = Number(formData.get('amount'));
    const status = (formData.get('status') || '') as 'pending' | 'paid' | '';

    if (!customerId || !status || isNaN(amount) || amount <= 0) {
      setMessage('Preencha todos os campos corretamente.');
      setSaving(false);
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    saveInvoice({ customerId, amount, status, date });

    setMessage('Fatura criada com sucesso!');
    form.reset();
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select name="customerId" required className="w-full rounded border px-3 py-2">
        <option value="">Select customer</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input name="amount" type="number" step="0.01" min="0.01" placeholder="Amount" className="w-full rounded border px-3 py-2" required />
      <div className="flex gap-4 items-center">
        <label><input type="radio" name="status" value="pending" required /> Pending</label>
        <label><input type="radio" name="status" value="paid" /> Paid</label>
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Invoice'}</Button>
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </form>
  );
}
