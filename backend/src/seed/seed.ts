import { DataSource } from 'typeorm';
import { Employee } from '../features/employee/employee.entity';
import { EmploymentType } from '../features/employee/dto/create_employee.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: +(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'test',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'salary_mgmt',
  entities: [Employee],
  synchronize: false,
});

const JOB_TITLES = [
  'Software Engineer 1',
  'Software Engineer 2',
  'Senior Software Engineer',
  'Staff Engineer',
  'Principal Engineer',
  'Product Manager',
  'Senior Product Manager',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'QA Engineer',
  'UX Designer',
  'UI Designer',
  'Business Analyst',
  'HR Manager',
  'Finance Manager',
  'Marketing Manager',
  'Sales Manager',
  'Operations Manager',
  'Project Manager',
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Data',
  'DevOps',
  'QA',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
];

const COUNTRIES = [
  'India',
  'USA',
  'UK',
  'Germany',
  'Canada',
  'Australia',
  'Singapore',
  'UAE',
  'France',
  'Netherlands',
];

const CURRENCIES: Record<string, string> = {
  India: 'INR',
  USA: 'USD',
  UK: 'GBP',
  Germany: 'EUR',
  Canada: 'CAD',
  Australia: 'AUD',
  Singapore: 'SGD',
  UAE: 'AED',
  France: 'EUR',
  Netherlands: 'EUR',
};

const SALARY_RANGES: Record<string, [number, number]> = {
  'Software Engineer 1': [40000, 70000],
  'Software Engineer 2': [60000, 90000],
  'Senior Software Engineer': [90000, 140000],
  'Staff Engineer': [130000, 180000],
  'Principal Engineer': [160000, 220000],
  'Product Manager': [80000, 130000],
  'Senior Product Manager': [120000, 170000],
  'Data Analyst': [50000, 80000],
  'Data Scientist': [90000, 140000],
  'DevOps Engineer': [80000, 130000],
  'QA Engineer': [50000, 90000],
  'UX Designer': [60000, 100000],
  'UI Designer': [55000, 95000],
  'Business Analyst': [60000, 100000],
  'HR Manager': [60000, 100000],
  'Finance Manager': [80000, 130000],
  'Marketing Manager': [70000, 110000],
  'Sales Manager': [70000, 120000],
  'Operations Manager': [70000, 110000],
  'Project Manager': [75000, 120000],
};

// helper functions
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return date.toISOString().split('T')[0];
};

const randomSalary = (jobTitle: string): number => {
  const [min, max] = SALARY_RANGES[jobTitle] || [40000, 100000];
  return randomInt(min, max);
};

const generateEmail = (
  fullName: string,
  index: number,
): string => {
  const clean = fullName.toLowerCase().replace(/\s+/g, '.');
  return `${clean}.${index}@company.com`;
};

async function seed() {
  console.time('Seed completed in');

  // read name files
  const firstNames = fs
    .readFileSync(path.join(__dirname, 'first_names.txt'), 'utf-8')
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const lastNames = fs
    .readFileSync(path.join(__dirname, 'last_names.txt'), 'utf-8')
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  await dataSource.initialize();
  console.log('Database connected');

  await dataSource.getRepository(Employee).clear({});
  console.log('Existing employees cleared');

  const employees = Array.from({ length: 10000 }, (_, index) => {
    const firstName = random(firstNames);
    const lastName = random(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const country = random(COUNTRIES);
    const jobTitle = random(JOB_TITLES);

    return {
      full_name: fullName,
      job_title: jobTitle,
      department: random(DEPARTMENTS),
      gender: random(['Male', 'Female', 'Other']),
      date_of_birth: randomDate(new Date('1970-01-01'), new Date('2000-12-31')),
      phone_number: `+${randomInt(1, 99)} ${randomInt(1000000000, 9999999999)}`,
      full_address: `${randomInt(1, 999)} Main St, City ${randomInt(1, 100)}`,
      country,
      salary: randomSalary(jobTitle),
      currency: CURRENCIES[country],
      email: generateEmail(fullName, index),
      hire_date: randomDate(new Date('2015-01-01'), new Date('2024-12-31')),
      employment_type: random(Object.values(EmploymentType)),
      performance_rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
    };
  });

  // bulk insert in chunks of 500
  const CHUNK_SIZE = 500;
  const repo = dataSource.getRepository(Employee);

  for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
    const chunk = employees.slice(i, i + CHUNK_SIZE);
    await repo.insert(chunk);
    console.log(`Inserted ${Math.min(i + CHUNK_SIZE, employees.length)} / 10000`);
  }

  await dataSource.destroy();
  console.timeEnd('Seed completed in');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});