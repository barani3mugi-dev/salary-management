import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEmail, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  job_title: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDateString()
  date_of_birth: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  full_address: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsPositive()
  salary: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEmail()
  email: string;

  @IsDateString()
  hire_date: string;

  @IsEnum(EmploymentType)
  employment_type: EmploymentType;

  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  performance_rating: number;
}