import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  LatestInvoice,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const ITEMS_PER_PAGE = 6;

// -------------------- Revenue --------------------
export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    const data: Revenue[] = [
      { month: 'Jan', revenue: 500 },
      { month: 'Feb', revenue: 700 },
      { month: 'Mar', revenue: 900 },
      { month: 'Apr', revenue: 1200 },
      { month: 'May', revenue: 800 },
      { month: 'Jun', revenue: 1500 },
      { month: 'Jul', revenue: 1700 },
      { month: 'Aug', revenue: 1300 },
      { month: 'Sep', revenue: 1100 },
      { month: 'Oct', revenue: 1600 },
      { month: 'Nov', revenue: 1400 },
      { month: 'Dec', revenue: 1800 },
    ];
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// -------------------- Latest Invoices --------------------
export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  try {
    const realClients = await sql<LatestInvoiceRaw[]>`
      SELECT id, name
      FROM customers
      ORDER BY id ASC
      LIMIT 5
    `;

    const allClients: LatestInvoiceRaw[] = [...realClients];
    const numFaltando = 5 - allClients.length;

    if (numFaltando > 0) {
      const ficticios = ['Ana Silva', 'Carlos Souza', 'Beatriz Lima', 'Daniel Oliveira'];
      let added = 0;
      for (let i = 0; i < ficticios.length && added < numFaltando; i++) {
        if (!allClients.find(c => c.name === ficticios[i])) {
          allClients.push({ id: 1000 + i, name: ficticios[i] } as LatestInvoiceRaw);
          added++;
        }
      }
      if (added < numFaltando) {
        allClients.push({ id: 2000, name: 'Chloe Martins' } as LatestInvoiceRaw);
      }
    }

    return allClients.map(c => ({
      id: c.id,
      name: c.name,
      amount: null,
      email: null,
      image_url: null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest clients.');
  }
}

// -------------------- Card Data --------------------
export async function fetchCardData() {
  try {
    const data = await sql<{
      invoice_count: string;
      customer_count: string;
      total_amount: string | null;
    }[]>`
      SELECT 
        COUNT(*) AS invoice_count,
        (SELECT COUNT(*) FROM customers) AS customer_count,
        SUM(amount) AS total_amount
      FROM invoices
    `;
    const result = data[0] ?? {};

    return {
      numberOfInvoices: Number(result.invoice_count ?? 0),
      numberOfCustomers: Number(result.customer_count ?? 0),
      totalCollected: formatCurrency(Number(result.total_amount ?? 0)),
      totalPending: '$8.00',
    };
  } catch (error) {
    console.error('Database Error in fetchCardData:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// -------------------- Filtered Invoices --------------------
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${query}%`;

  try {
    // Verifica se a coluna 'status' existe
    const columnCheck = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'invoices' AND column_name = 'status'
      LIMIT 1
    `;
    const statusColumnExists = columnCheck.length > 0;

    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        ${
          statusColumnExists
            ? sql`invoices.status`
            : sql`'unknown'::text AS status`
        },
        customers.name,
        invoices.created_at AS date,
        COUNT(*) OVER() AS total_count
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${searchQuery} OR
        invoices.amount::text ILIKE ${searchQuery} OR
        ${
          statusColumnExists
            ? sql`invoices.status ILIKE ${searchQuery}`
            : sql`'unknown' ILIKE ${searchQuery}`
        }
      ORDER BY invoices.id DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    const totalCount = Number(invoices[0]?.total_count ?? 0);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return { invoices, totalPages };
  } catch (error) {
    console.error('Database Error in fetchFilteredInvoices:', error);
    return { invoices: [], totalPages: 0 }; // fallback seguro
  }
}


// -------------------- Invoice by ID --------------------
export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;
    return data[0]
      ? { ...data[0], amount: data[0].amount != null ? Number(data[0].amount) / 100 : null }
      : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// -------------------- Customers --------------------
export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT id, name
      FROM customers
      ORDER BY name ASC
    `;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
      SELECT
        customers.id,
        customers.name,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE customers.name ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name
      ORDER BY customers.name ASC
    `;

    return data.map(customer => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending ?? 0)),
      total_paid: formatCurrency(Number(customer.total_paid ?? 0)),
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
