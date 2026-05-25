export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export interface IEmployee {
  id: string;
  full_name: string;
  job_title: string;
  department: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  full_address: string;
  country: string;
  salary: number;
  currency: string;
  email: string;
  hire_date: string;
  employment_type: EmploymentType;
  performance_rating: number;
  created_at: string;
}

export interface IEmployeeList {
  data: IEmployee[];
  total: number;
  page: number;
  limit: number;
}