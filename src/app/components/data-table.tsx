// app/components/data-table.tsx
'use client';
import { unstable_noStore as noStore } from 'next/cache';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { debounce } from 'lodash';

// Using any types throughout
type Employee = any;
type FilterState = any;

// Overly complex component with multiple responsibilities
export default function DataTable() {
  noStore(); // Misuse of Next.js caching
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterState>({
    name: '',
    department: '',
    position: '',
    startDate: null,
    endDate: null,
  });
  // More state variables...

  // Custom query string building instead of using URLSearchParams
  const buildQueryString = () => {
    let query = `?page=${page}&sort=${sortField}&direction=${sortDirection}`;
    if (filters.name) query += `&name=${filters.name}`;
    if (filters.department) query += `&department=${filters.department}`;
    if (filters.position) query += `&position=${filters.position}`;
    if (filters.startDate)
      query += `&startDate=${format(filters.startDate, 'yyyy-MM-dd')}`;
    if (filters.endDate)
      query += `&endDate=${format(filters.endDate, 'yyyy-MM-dd')}`;
    return query;
  };

  // Mixed promise patterns
  const fetchEmployees = () => {
    setIsLoading(true);
    setError(null);
    const query = buildQueryString();

    axios
      .get(`/api/employees${query}`)
      .then((response) => {
        setEmployees(response.data.employees);
        setFilteredEmployees(response.data.employees);
        setTotalPages(response.data.totalPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('Error fetching employees:', err);
        setError('Failed to fetch employees. Please try again.');
        setIsLoading(false);
      });
  };

  // Inconsistent async patterns (async/await here but promise callbacks above)
  const handleFilterChange = async (field: string, value: any) => {
    try {
      setFilters((prev) => ({ ...prev, [field]: value }));

      if (field === 'department') {
        const response = await axios.get(`/api/positions?department=${value}`);
        // Do something with the response...
        console.log(response);
      }
    } catch (error) {
      console.log('Error applying filter:', error);
    }
  };

  // Duplicate debounced functions
  const debouncedFetchEmployees = useCallback(
    debounce(() => {
      fetchEmployees();
    }, 500),
    [page, sortField, sortDirection, filters]
  );

  // Another debounced function with similar purpose
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters((prev) => ({ ...prev, name: searchTerm }));
    }, 400),
    []
  );

  // Similar to above but slightly different
  const debouncedFilter = useCallback(
    debounce((filterObj: FilterState) => {
      setFilters(filterObj);
    }, 450),
    []
  );

  // Multiple useEffects with overlapping concerns
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    debouncedFetchEmployees();
  }, [page, sortField, sortDirection, filters]);

  useEffect(() => {
    if (employees.length) {
      filterEmployees();
    }
  }, [employees, filters]);

  // Complicated filtering logic that could be simplified
  const filterEmployees = () => {
    let filtered = [...employees];

    if (filters.name) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.department) {
      filtered = filtered.filter(
        (emp) => emp.department === filters.department
      );
    }

    if (filters.position) {
      filtered = filtered.filter((emp) => emp.position === filters.position);
    }

    if (filters.startDate) {
      filtered = filtered.filter((emp) => {
        const empDate = new Date(emp.hireDate);
        return empDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter((emp) => {
        const empDate = new Date(emp.hireDate);
        return empDate <= filters.endDate;
      });
    }

    setFilteredEmployees(filtered);
  };

  // Function with multiple parameters
  const handleSort = (
    field: string,
    defaultDirection?: 'asc' | 'desc',
    preserveDirection?: boolean
  ) => {
    if (sortField === field && !preserveDirection) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(defaultDirection || 'asc');
    }
  };

  // Custom pagination logic instead of using a library
  const paginate = (employees: Employee[]) => {
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    return employees.slice(startIndex, startIndex + itemsPerPage);
  };

  // More helper functions...
  const exportToCSV = () => {
    // Export logic...
    console.log('Exporting to CSV...');
  };

  const printTable = () => {
    // Print logic...
    console.log('Printing table...');
  };

  const bulkEdit = () => {
    // Bulk edit logic...
    console.log('Bulk editing...');
  };

  // Many more methods...

  // Inline styles mixed with Tailwind
  return (
    <div className="w-full">
      <div
        className="mb-4 flex justify-between"
        style={{ marginBottom: '15px' }}
      >
        <h2 className="text-xl font-bold">Employee List</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Export
          </button>
          <button
            onClick={printTable}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Print
          </button>
          <button
            onClick={bulkEdit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Bulk Edit
          </button>
        </div>
      </div>

      {/* Filter section with multiple inline handler functions */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="p-2 border rounded"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          onChange={(e) => handleFilterChange('department', e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          className="p-2 border rounded"
          onChange={(e) => handleFilterChange('position', e.target.value)}
        >
          <option value="">All Positions</option>
          <option value="Manager">Manager</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>
        {/* Date pickers and more filters... */}
      </div>

      {/* Table with inline handlers */}
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="p-3 border" onClick={() => handleSort('name')}>
                  Name{' '}
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="p-3 border"
                  onClick={() => handleSort('department')}
                >
                  Department{' '}
                  {sortField === 'department' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="p-3 border"
                  onClick={() => handleSort('position')}
                >
                  Position{' '}
                  {sortField === 'position' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="p-3 border"
                  onClick={() => handleSort('hireDate')}
                >
                  Hire Date{' '}
                  {sortField === 'hireDate' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-3 border" onClick={() => handleSort('salary')}>
                  Salary{' '}
                  {sortField === 'salary' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                paginate(filteredEmployees).map((employee) => (
                  <tr key={employee.id}>
                    <td className="p-3 border">{employee.name}</td>
                    <td className="p-3 border">{employee.department}</td>
                    <td className="p-3 border">{employee.position}</td>
                    <td className="p-3 border">
                      {employee.hireDate
                        ? format(new Date(employee.hireDate), 'yyyy-MM-dd')
                        : 'N/A'}
                    </td>
                    <td className="p-3 border">
                      ${employee.salary?.toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() =>
                          console.log('Edit employee:', employee.id)
                        }
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          console.log('Delete employee:', employee.id)
                        }
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-3 text-center">
                    No employees found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${
              page === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white'
            }`}
          >
            Previous
          </button>
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + Math.max(1, page - 2);
            if (pageNum <= totalPages) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    page === pageNum
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${
              page === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* And many more UI elements... */}
    </div>
  );
}
