export enum EmploymentType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACT = 'CONTRACT',
    INTERN = 'INTERN',
}

export class CreateEmployeeDto {
    full_name: string;
    job_title: string;
    department: string;
    gender: string;
    age: number;
    phone_number: string;
    full_address: string;
    country: string;
    salary: number;
    currency: string;
    email: string;
    hire_date: string;
    employment_type: EmploymentType;
    performance_rating: number;
}