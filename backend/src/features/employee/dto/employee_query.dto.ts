// employee/dto/employee-query.dto.ts
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType } from './create_employee.dto';

export class EmployeeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;  

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  job_title?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employment_type?: EmploymentType;
}