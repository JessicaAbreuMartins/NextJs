'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

// Conexão com PostgreSQL
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Schema base
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// Schema para criar fatura (omit id e date)
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Valida e converte dados do form
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Executa insert no banco
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  // Revalida a rota e redireciona
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
