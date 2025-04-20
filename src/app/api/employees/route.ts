// app/api/employees/route.ts
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Mocked data - in real app, this would be a DB call
let employees = [
  {
    id: '1',
    name: 'John Doe',
    department: 'Engineering',
    position: 'Developer',
    hireDate: '2022-01-15',
    salary: 85000,
  },
  {
    id: '2',
    name: 'Jane Smith',
    department: 'HR',
    position: 'Manager',
    hireDate: '2021-05-10',
    salary: 95000,
  },
  {
    id: '3',
    name: 'Michael Johnson',
    department: 'Marketing',
    position: 'Specialist',
    hireDate: '2023-02-20',
    salary: 75000,
  },
  // More employees...
];

// Misuse of experimental features
// The cache issue mentioned in the report
export async function GET(request: NextRequest) {
  noStore(); // Prevents caching unnecessarily in an API route

  try {
    const { searchParams } = request?.nextUrl;

    // Using searchParams incorrectly
    const page = searchParams.get('page') || '1';
    const sort = searchParams.get('sort') || 'name';
    const direction = searchParams.get('direction') || 'asc';
    const name = searchParams.get('name');
    const department = searchParams.get('department');
    const position = searchParams.get('position');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Artificial delay to simulate slow API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter employees based on query parameters
    // Duplicate filtering logic from frontend
    if (name) {
      employees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (department) {
      employees = employees.filter((emp) => emp.department === department);
    }

    if (position) {
      employees = employees.filter((emp) => emp.position === position);
    }

    if (startDate) {
      employees = employees.filter((emp) => {
        const empDate = new Date(emp.hireDate);
        const filterDate = new Date(startDate);
        return empDate >= filterDate;
      });
    }

    if (endDate) {
      employees = employees.filter((emp) => {
        const empDate = new Date(emp.hireDate);
        const filterDate = new Date(endDate);
        return empDate <= filterDate;
      });
    }

    // Sort employees
    employees.sort((a, b) => {
      const aValue = a[sort as keyof typeof a];
      const bValue = b[sort as keyof typeof b];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    // Pagination
    const pageNumber = parseInt(page, 10);
    const pageSize = 10;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmployees = employees.slice(startIndex, endIndex);

    return NextResponse.json({
      employees: paginatedEmployees,
      totalEmployees: employees.length,
      totalPages: Math.ceil(employees.length / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.log('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST handler with inconsistent error handling
export async function POST(request: NextRequest) {
  noStore(); // Unnecessary for POST

  try {
    const data = await request.json();

    employees.push(data);

    // Here you would typically save the data to a database
    // For now, we'll just return the received data

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
