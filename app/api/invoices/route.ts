import { NextRequest, NextResponse } from 'next/server';
import { fetchFilteredInvoices } from '@/app/lib/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const page = Number(searchParams.get('page') || 1);

  const data = await fetchFilteredInvoices(query, page);

  return NextResponse.json(data);
}
