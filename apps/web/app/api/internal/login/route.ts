import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: response.status });
  }

  const payload = await response.json();
  return NextResponse.json(payload);
}
