'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

type FormField = {
  name: string;
  label: string;
  type: string;
  value?: any;
  options?: any[];
  required?: boolean;
  validation?: any;
  errorMessage?: string;
};

type FormProps = {
  fields: FormField[];
  onSubmit?: (data: any) => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  initialData?: any;
};

export default function ReusableForm({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onCancel,
  initialData = {},
}: FormProps) {
  const [formValues, setFormValues] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const initialValues: any = {};
      fields.forEach((field) => {
        if (initialData[field.name] !== undefined) {
          initialValues[field.name] = initialData[field.name];
        } else {
          switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
              initialValues[field.name] = '';
              break;
            case 'number':
              initialValues[field.name] = 0;
              break;
            case 'checkbox':
              initialValues[field.name] = false;
              break;
            case 'date':
              initialValues[field.name] = null;
              break;
            case 'select':
              initialValues[field.name] =
                field.options && field.options.length > 0
                  ? field.options[0].value
                  : '';
              break;
            default:
              initialValues[field.name] = '';
          }
        }
      });
      setFormValues(initialValues);
    }
  }, [initialData, fields]);

  useEffect(() => {
    axios
      .get('/api/departments')
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.log('Error fetching departments:', error);
      });
  }, []);

  useEffect(() => {
    if (formValues.department) {
      axios
        .get(`/api/positions?department=${formValues.department}`)
        .then((response) => {
          setPositions(response.data);
        })
        .catch((error) => {
          console.log('Error fetching positions:', error);
        });
    }
  }, [formValues.department]);

  useEffect(() => {
    validateForm();
  }, [formValues, touchedFields]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    } else if (type === 'date') {
      try {
        newValue = value ? new Date(value) : null;
      } catch (error) {
        console.log('Invalid date:', error);
        newValue = null;
      }
    }

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: newValue,
    }));

    if (!touchedFields.includes(name)) {
      setTouchedFields((prev) => [...prev, name]);
    }
  };

  const validateForm = () => {
    let newErrors: any = {};
    let formIsValid = true;

    fields.forEach((field) => {
      if (!touchedFields.includes(field.name)) {
        return;
      }

      const value = formValues[field.name];
      let fieldError = '';

      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        fieldError = `${field.label} is required`;
        formIsValid = false;
      }

      if (!fieldError && field.validation) {
        switch (field.validation.type) {
          case 'email':
            if (value && !/\S+@\S+\.\S+/.test(value)) {
              fieldError = field.validation.message || 'Invalid email format';
              formIsValid = false;
            }
            break;
          case 'minLength':
            if (value && value.length < field.validation.value) {
              fieldError =
                field.validation.message ||
                `Minimum length is ${field.validation.value}`;
              formIsValid = false;
            }
            break;
          case 'maxLength':
            if (value && value.length > field.validation.value) {
              fieldError =
                field.validation.message ||
                `Maximum length is ${field.validation.value}`;
              formIsValid = false;
            }
            break;
          case 'pattern':
            if (value && !new RegExp(field.validation.pattern).test(value)) {
              fieldError = field.validation.message || 'Invalid format';
              formIsValid = false;
            }
            break;
          case 'min':
            if (value && Number(value) < field.validation.value) {
              fieldError =
                field.validation.message ||
                `Minimum value is ${field.validation.value}`;
              formIsValid = false;
            }
            break;
          case 'max':
            if (value && Number(value) > field.validation.value) {
              fieldError =
                field.validation.message ||
                `Maximum value is ${field.validation.value}`;
              formIsValid = false;
            }
            break;
          case 'custom':
            if (
              field.validation.validate &&
              !field.validation.validate(value, formValues)
            ) {
              fieldError = field.validation.message || 'Invalid value';
              formIsValid = false;
            }
            break;
        }
      }

      if (fieldError) {
        newErrors[field.name] = fieldError;
      }
    });

    setFormErrors(newErrors);
    setIsValid(formIsValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allFields = fields.map((field) => field.name);
    setTouchedFields(allFields);

    let submitErrors: any = {};
    let formIsValid = true;

    fields.forEach((field) => {
      const value = formValues[field.name];
      let fieldError = '';

      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        fieldError = `${field.label} is required`;
        formIsValid = false;
      }

      if (fieldError) {
        submitErrors[field.name] = fieldError;
      }
    });

    setFormErrors(submitErrors);

    if (!formIsValid) {
      return;
    }

    setIsSubmitting(true);

    if (onSubmit) {
      const formattedValues = { ...formValues };
      fields.forEach((field) => {
        if (field.type === 'date' && formValues[field.name]) {
          formattedValues[field.name] = format(
            formValues[field.name],
            'yyyy-MM-dd'
          );
        }
      });

      // Simulate async submission
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(formattedValues);
        }, 1000);
      })
        .then((data) => {
          onSubmit(data);
          setIsSubmitting(false);
        })
        .catch((error) => {
          console.log('Submission error:', error);
          setIsSubmitting(false);
        });
    }
  };

  const handleCancel = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.log('Cancel error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const error = formErrors[field.name];

        let inputElement;
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'number':
            inputElement = (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required={field.required}
              />
            );
            break;
          case 'textarea':
            inputElement = (
              <textarea
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required={field.required}
              />
            );
            break;
          case 'select':
            let options = field.options || [];
            if (field.name === 'position') {
              options = positions;
            } else if (field.name === 'department') {
              options = departments;
            }

            inputElement = (
              <select
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {options.map((option: any) => (
                  <option
                    key={option.value || option.id}
                    value={option.value || option.id}
                  >
                    {option.label || option.name}
                  </option>
                ))}
              </select>
            );
            break;
          case 'checkbox':
            inputElement = (
              <input
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={formValues[field.name] || false}
                onChange={handleInputChange}
                className={`h-5 w-5 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            );
            break;
          case 'date':
            inputElement = (
              <input
                type="date"
                id={field.name}
                name={field.name}
                value={
                  formValues[field.name]
                    ? format(new Date(formValues[field.name]), 'yyyy-MM-dd')
                    : ''
                }
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required={field.required}
              />
            );
            break;
          default:
            inputElement = (
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required={field.required}
              />
            );
        }

        return (
          <div key={field.name} className="form-group">
            <label
              htmlFor={field.name}
              className={`block mb-1 ${field.required ? 'font-semibold' : ''}`}
            >
              {field.label}{' '}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'checkbox' ? (
              <div className="flex items-center">
                {inputElement}
                <span className="ml-2">{field.label}</span>
              </div>
            ) : (
              inputElement
            )}

            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          </div>
        );
      })}

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 rounded ${
            isValid
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
