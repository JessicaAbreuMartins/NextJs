// app/lib/connect.ts
import postgres from 'postgres';

export const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require', // ou false se estiver rodando localmente sem SSL
});
