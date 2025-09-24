import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Função que garante que o banco tem os dados de teste
async function ensureTestData() {
  // Cria tabelas se não existirem
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES customers(id),
      amount INT NOT NULL
    );
  `;

  // Insere cliente de teste se não existir
  let [customer] = await sql`
    SELECT * FROM customers WHERE name = 'Cliente X'
  `;

  if (!customer) {
    const inserted = await sql`
      INSERT INTO customers (name) VALUES ('Cliente X') RETURNING *
    `;
    customer = inserted[0];
  }

  // Insere fatura de teste se não existir
  const invoiceExists = await sql`
    SELECT * FROM invoices WHERE customer_id = ${customer.id} AND amount = 666
  `;

  if (invoiceExists.length === 0) {
    await sql`
      INSERT INTO invoices (customer_id, amount) VALUES (${customer.id}, 666)
    `;
  }
}

// Função que retorna as faturas
async function listInvoices() {
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666
  `;
  return data;
}

// Handler GET
export async function GET() {
  try {
    await ensureTestData(); // garante que os dados existem
    const invoices = await listInvoices();
    return Response.json(invoices);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
