// app/employee/page.tsx
'use client';
import { useState } from 'react';
import ReusableForm from '../components/reusable-form';
import axios from 'axios';

export default function EmployeeForm() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'select', required: true },
    { name: 'position', label: 'Position', type: 'select', required: true },
    { name: 'hireDate', label: 'Hire Date', type: 'date', required: true },
    { name: 'salary', label: 'Salary', type: 'number', required: true },
  ];

  const handleSubmit = async (data: any) => {
    try {
      const response = await axios.post('/api/employees', data);
      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to create employee. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      <ReusableForm
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Add Employee"
      />
    </main>
  );
}
