import { NextResponse } from 'next/server';

const positionsByDepartment = {
  engineering: [
    { id: '1', name: 'Software Engineer', value: 'software-engineer' },
    { id: '2', name: 'Frontend Developer', value: 'frontend-developer' },
    { id: '3', name: 'Backend Developer', value: 'backend-developer' },
    { id: '4', name: 'DevOps Engineer', value: 'devops-engineer' },
  ],
  hr: [
    { id: '5', name: 'HR Manager', value: 'hr-manager' },
    { id: '6', name: 'Recruiter', value: 'recruiter' },
    { id: '7', name: 'HR Specialist', value: 'hr-specialist' },
  ],
  marketing: [
    { id: '8', name: 'Marketing Manager', value: 'marketing-manager' },
    { id: '9', name: 'Content Writer', value: 'content-writer' },
    { id: '10', name: 'Social Media Manager', value: 'social-media-manager' },
  ],
  sales: [
    { id: '11', name: 'Sales Manager', value: 'sales-manager' },
    { id: '12', name: 'Account Executive', value: 'account-executive' },
    { id: '13', name: 'Sales Representative', value: 'sales-representative' },
  ],
  finance: [
    { id: '14', name: 'Finance Manager', value: 'finance-manager' },
    { id: '15', name: 'Accountant', value: 'accountant' },
    { id: '16', name: 'Financial Analyst', value: 'financial-analyst' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');

  if (!department) {
    return NextResponse.json(
      { error: 'Department is required' },
      { status: 400 }
    );
  }

  const positions =
    positionsByDepartment[department as keyof typeof positionsByDepartment] ||
    [];
  return NextResponse.json(positions);
}
