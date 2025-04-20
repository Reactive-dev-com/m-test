import axios from 'axios';
import { format } from 'date-fns';

export type Employee = any;
export type Department = any;
export type Position = any;
export type Salary = any;

export const fetchEmployees = async (
  page: number = 1,
  sort: string = 'name',
  direction: 'asc' | 'desc' = 'asc',
  filters: any = {}
) => {
  try {
    let query = `?page=${page}&sort=${sort}&direction=${direction}`;

    if (filters.name) query += `&name=${filters.name}`;
    if (filters.department) query += `&department=${filters.department}`;
    if (filters.position) query += `&position=${filters.position}`;

    if (filters.startDate) {
      query += `&startDate=${format(
        new Date(filters.startDate),
        'yyyy-MM-dd'
      )}`;
    }

    if (filters.endDate) {
      query += `&endDate=${format(new Date(filters.endDate), 'yyyy-MM-dd')}`;
    }

    const response = await axios.get(`/api/employees${query}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching employees:', error);
    throw new Error('Failed to fetch employees');
  }
};

export const fetchDepartments = () => {
  return axios
    .get('/api/departments')
    .then((response) => response.data)
    .catch((error) => {
      console.log('Error fetching departments:', error);
      return [];
    });
};

export const fetchPositions = (
  department: string,
  callback: (positions: Position[]) => void
) => {
  axios
    .get(`/api/positions?department=${department}`)
    .then((response) => {
      callback(response.data);
    })
    .catch((error) => {
      console.log('Error fetching positions:', error);
      callback([]);
    });
};

export const createEmployee = async (employee: Employee) => {
  try {
    const response = await axios.post('/api/employees', employee);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log('Server error:', error.response.data);
      return { error: error.response.data };
    } else {
      console.log('Request error:', error.message);
      throw error;
    }
  }
};

export const updateEmployee = async (id: string, data: any) => {
  try {
    const response = await axios.put(`/api/employees/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'Failed to update employee' };
  }
};

export const deleteEmployee = async (id: string) => {
  const response = await axios.delete(`/api/employees/${id}`);
  return response.data;
};

export const formatDate = (date: any) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    console.log('Date formatting error:', error);
    return '';
  }
};

export const formatDateForDisplay = (date: any) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch (error) {
    console.log('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const fetchSalaryHistory = (employeeId: string) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/api/salary-history/${employeeId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        console.log('Error fetching salary history:', error);
        reject(error);
      });
  });
};

export const fetchEmployeeById = async (id: string) => {
  return axios.get(`/api/employees/${id}`).then((res) => res.data);
};

// More duplicated functionality
export const searchEmployees = async (searchTerm: string) => {
  try {
    const response = await axios.get(
      `/api/employees/search?term=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.log('Search error:', error);
    return [];
  }
};

export const generatePayrollReport = async (
  startDate: Date,
  endDate: Date,
  departments: string[],
  includeBonus: boolean,
  includeOvertime: boolean,
  includePTO: boolean,
  format: 'pdf' | 'excel' | 'csv' = 'pdf',
  email?: string
) => {
  try {
    const response = await axios.post('/api/reports/payroll', {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      departments,
      includeBonus,
      includeOvertime,
      includePTO,
      format,
      email,
    });
    return response.data;
  } catch (error) {
    console.log('Report generation error:', error);
    throw new Error('Failed to generate payroll report');
  }
};

// Many more functions...

export const calculateNetSalary = (
  gross: number,
  tax: number,
  deductions: number
) => {
  return gross - (gross * tax) / 100 - deductions;
};

export const calculateTax = (salary: number, taxBracket: string) => {
  switch (taxBracket) {
    case 'A':
      return salary * 0.1;
    case 'B':
      return salary * 0.2;
    case 'C':
      return salary * 0.3;
    default:
      return salary * 0.15;
  }
};
