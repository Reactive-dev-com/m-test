import { NextResponse } from 'next/server';

const departments = [
  { id: '1', name: 'Engineering', value: 'engineering' },
  { id: '2', name: 'Human Resources', value: 'hr' },
  { id: '3', name: 'Marketing', value: 'marketing' },
  { id: '4', name: 'Sales', value: 'sales' },
  { id: '5', name: 'Finance', value: 'finance' },
];

export async function GET() {
  return NextResponse.json(departments);
}
