import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create_employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}