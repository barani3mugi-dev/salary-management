'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { employeeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IEmployee } from '@/types/employee';

const COUNTRIES = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Australia', 'Singapore', 'UAE', 'France', 'Netherlands'];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Data', 'DevOps', 'QA', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];
const CURRENCIES: Record<string, string> = {
  India: 'INR', USA: 'USD', UK: 'GBP', Germany: 'EUR',
  Canada: 'CAD', Australia: 'AUD', Singapore: 'SGD',
  UAE: 'AED', France: 'EUR', Netherlands: 'EUR',
};

interface Props {
  employee?: IEmployee | null;
  onSuccess: () => void;
}

export default function EmployeeForm({ employee, onSuccess }: Props) {
  const isEdit = !!employee;

  const [form, setForm] = useState({
    full_name: employee?.full_name ?? '',
    job_title: employee?.job_title ?? '',
    department: employee?.department ?? '',
    gender: employee?.gender ?? '',
    date_of_birth: employee?.date_of_birth ?? '',
    phone_number: employee?.phone_number ?? '',
    full_address: employee?.full_address ?? '',
    country: employee?.country ?? '',
    salary: employee?.salary ?? '',
    currency: employee?.currency ?? '',
    email: employee?.email ?? '',
    hire_date: employee?.hire_date ?? '',
    employment_type: employee?.employment_type ?? '',
    performance_rating: employee?.performance_rating ?? '',
  });

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? employeeApi.update(employee!.id, data) : employeeApi.create(data),
    onSuccess,
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Something went wrong');
    },
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'country' ? { currency: CURRENCIES[value] ?? '' } : {}),
    }));
  };

const handleSubmit = () => {
  setError('');

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(form.email)) {
    setError('Please enter a valid email address');
    return;
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(form.phone_number)) {
    setError('Phone number must be exactly 10 digits');
    return;
  }

  // DOB validation
  const dob = new Date(form.date_of_birth);

  if (isNaN(dob.getTime())) {
    setError('Date of birth must be a valid date');
    return;
  }

  // Hire date validation
  const hireDate = new Date(form.hire_date);

  if (isNaN(hireDate.getTime())) {
    setError('Hire date must be a valid date');
    return;
  }

  // Age validation
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  if (age < 18) {
    setError('Employee must be at least 18 years old');
    return;
  }

  mutation.mutate({
    ...form,
    date_of_birth: dob.toISOString(),
    hire_date: hireDate.toISOString(),
    salary: Number(form.salary),
    performance_rating: Number(form.performance_rating),
  });
};

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Full Name</label>
          <Input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input value={form.email} onChange={e => handleChange('email', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Job Title</label>
          <Input value={form.job_title} onChange={e => handleChange('job_title', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Department</label>
          <Select value={form.department} onValueChange={v => handleChange('department', v)}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Country</label>
          <Select value={form.country} onValueChange={v => handleChange('country', v)}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Currency</label>
          <Input value={form.currency} readOnly className="bg-muted" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Salary</label>
          <Input type="number" value={form.salary} onChange={e => handleChange('salary', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Gender</label>
          <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input type="date" value={form.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone Number</label>
          <Input value={form.phone_number} maxLength={10} onChange={e => {
            const value = e.target.value.replace(/\D/g, '');
            handleChange('phone_number', value);
          }} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Hire Date</label>
          <Input type="date" value={form.hire_date} onChange={e => handleChange('hire_date', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Employment Type</label>
          <Select value={form.employment_type} onValueChange={v => handleChange('employment_type', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERN">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Performance Rating (1-5)</label>
          <Input type="number" min={1} max={5} value={form.performance_rating} onChange={e => handleChange('performance_rating', e.target.value)} />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium">Full Address</label>
          <Input value={form.full_address} onChange={e => handleChange('full_address', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}