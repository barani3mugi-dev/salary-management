export interface CountryInsight {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  employee_count: number;
}

export interface JobTitleInsight {
  job_title: string;
  country: string;
  avg_salary: number;
  employee_count: number;
}

export interface DepartmentInsight {
  department: string;
  avg_salary: number;
  employee_count: number;
}