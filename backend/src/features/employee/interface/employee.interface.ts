export interface IEmployeeResponse {
    id: string;
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
    employment_type: string;
    performance_rating: number;
}

export interface IEmployeeList {
    data: IEmployeeResponse[];
    total: number;
    page: number;
    limit: number;
}