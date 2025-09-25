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
    // Buscar clientes reais do banco
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
      for (let i = 0; i < ficticios.length && added < numFaltando - 1; i++) {
        if (!allClients.find(c => c.name === ficticios[i])) {
          allClients.push({
            id: 1000 + i,
            name: ficticios[i],
          } as LatestInvoiceRaw);
          added++;
        }
      }

      // Último cliente fictício fixo
      allClients.push({
        id: 2000,
        name: 'Chloe Martins',
      } as LatestInvoiceRaw);
    }

    const latestInvoices: LatestInvoice[] = allClients.map((c) => ({
      id: c.id,
      name: c.name,
      amount: null,
      email: null,
      image_url: null,
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest clients.');
  }
}

// -------------------- Card Data --------------------
export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;
 
    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');

    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices: 'R$1000',   // exemplo
      totalPendingInvoices: 'R$500', // exemplo
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
// -------------------- Filtered Invoices --------------------
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.status,
        customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.id DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
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

    const invoice = data.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// -------------------- Customers --------------------
export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
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
      WHERE
        customers.name ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name
      ORDER BY customers.name ASC
    `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
