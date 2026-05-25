'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IEmployee } from '@/types/employee';
import EmployeeForm from '@/app/components/employees/employee-form';

const COUNTRIES = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Australia', 'Singapore', 'UAE', 'France', 'Netherlands'];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Data', 'DevOps', 'QA', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<IEmployee | null>(null);

const { data, isLoading, isPending, error, status, fetchStatus } = useQuery({
  queryKey: ['employees', page, search, country, department],
  queryFn: () => employeeApi.getAll({ page, limit: 20, search, country, department }),
});

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const handleEdit = (employee: IEmployee) => {
    setEditEmployee(employee);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditEmployee(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  return (
    <div className="p-10 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleAdd}>Add Employee</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={country} onValueChange={v => { setCountry(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={department} onValueChange={v => { setDepartment(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Job Title</th>
              <th className="text-left p-3">Department</th>
              <th className="text-left p-3">Country</th>
              <th className="text-left p-3">Salary</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isPending ? (
              <tr><td colSpan={8} className="text-center p-6">Loading...</td></tr>
            ) : (Array.isArray(data?.data) ? data.data : []).map((emp: IEmployee) => (
              <tr key={emp.id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{emp.full_name}</td>
                <td className="p-3">{emp.job_title}</td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">{emp.country}</td>
                <td className="p-3">{emp.salary.toLocaleString()} {emp.currency}</td>
                <td className="p-3">
                  <Badge variant={emp.employment_type === 'FULL_TIME' ? 'default' : 'secondary'}>
                    {emp.employment_type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-3">{emp.performance_rating}/5</td>
                <td className="p-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(emp)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(emp.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total: {data?.total ?? 0} employees
          Page {page} of {Math.ceil((data?.total ?? 0) / 20)}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm py-2">Page {page} of {Math.ceil((data?.total ?? 0) / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil((data?.total ?? 0) / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm employee={editEmployee} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}