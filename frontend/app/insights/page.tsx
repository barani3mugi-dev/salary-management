'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryInsight, DepartmentInsight, JobTitleInsight } from '@/types/insights';
import { IEmployee } from '@/types/employee';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COUNTRIES = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Australia', 'Singapore', 'UAE', 'France', 'Netherlands'];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Data', 'DevOps', 'QA', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];
const JOB_TITLES = [
    'Software Engineer 1', 'Software Engineer 2', 'Senior Software Engineer',
    'Staff Engineer', 'Principal Engineer', 'Product Manager',
    'Senior Product Manager', 'Data Analyst', 'Data Scientist',
    'DevOps Engineer', 'QA Engineer', 'UX Designer', 'UI Designer',
    'Business Analyst', 'HR Manager', 'Finance Manager',
    'Marketing Manager', 'Sales Manager', 'Operations Manager', 'Project Manager',
];
export default function InsightsPage() {
    const [country, setCountry] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const countryQuery = useQuery<CountryInsight>({
        queryKey: ['insights', 'country', country],
        queryFn: () =>
            insightsApi.getCountry(country),
        enabled: !!country,
    });

    const jobTitleQuery = useQuery<JobTitleInsight>({
        queryKey: ['insights', 'jobTitle', jobTitle],
        queryFn: () =>
            insightsApi.getJobTitle(jobTitle, country),
        enabled: !!jobTitle && !!country,
    });

    const departmentQuery = useQuery<DepartmentInsight[]>({
        queryKey: ['insights', 'department', country],
        queryFn: () =>
            insightsApi.getDepartment(country),
        enabled: !!country,
    });

    const topEarnerQuery = useQuery<IEmployee[]>({
        queryKey: ['insights', 'topEarner', country],
        queryFn: () =>
            insightsApi.getTopEarners(country),
        enabled: !!country,
    });


    return (
        <div className="p-10 space-y-6">
            <h1 className="text-2xl font-bold">Salary Insights</h1>
            <Select value={country} onValueChange={(v) => setCountry(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="country" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Min Salary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {countryQuery?.isLoading ? '...' : countryQuery?.data?.min_salary?.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Max Salary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {countryQuery?.isLoading ? '...' : countryQuery?.data?.max_salary?.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Avg Salary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {countryQuery?.isLoading ? '...' : Math.round(countryQuery?.data?.avg_salary ?? 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {countryQuery?.isLoading ? '...' : countryQuery?.data?.employee_count?.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Job Title Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Job Title Insights</h2>
                <div className="flex gap-4 items-center">
                    <select
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="">Select job title</option>
                        {JOB_TITLES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {jobTitle && (
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground">Avg Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {jobTitleQuery.isLoading ? '...' : Math.round(jobTitleQuery.data?.avg_salary ?? 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground">Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {jobTitleQuery.isLoading ? '...' : (jobTitleQuery.data?.employee_count ?? 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Department Chart */}
   <div className="space-y-4">
  <h2 className="text-lg font-semibold">
    Avg Salary by Department
  </h2>

  {departmentQuery.isLoading ? (
    <p>Loading...</p>
  ) : (
    <div className="border rounded-lg p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={DEPARTMENTS.map((dept) => {
            const found = departmentQuery.data?.find(
              (item) => item.department === dept
            );

            return {
              department: dept,
              avg_salary: found?.avg_salary ?? 0,
            };
          })}
        >
          <XAxis dataKey="department" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="avg_salary" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</div>
            {/* Top Earners */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Top Earners</h2>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-3">#</th>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Job Title</th>
                                <th className="text-left p-3">Department</th>
                                <th className="text-left p-3">Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topEarnerQuery.isLoading ? (
                                <tr><td colSpan={5} className="text-center p-6">Loading...</td></tr>
                            ) : (
                                (topEarnerQuery.data ?? []).map((emp, index) => (
                                    <tr key={emp.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3 text-muted-foreground">{index + 1}</td>
                                        <td className="p-3 font-medium">{emp.full_name}</td>
                                        <td className="p-3">{emp.job_title}</td>
                                        <td className="p-3">{emp.department}</td>
                                        <td className="p-3 font-medium">
                                            {Number(emp.salary).toLocaleString()} {emp.currency}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


    )


}
