import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create_employee.dto';
import { UpdateEmployeeDto } from './dto/update_employee.dto';
import { EmployeeQueryDto } from './dto/employee_query.dto';
import { PaginatedResult, SuccessResponse } from '../../utils/http_response';
import { Employee } from './employee.entity';

@Controller('api/v1/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEmployeeDto): Promise<SuccessResponse<Employee>> {
    const employee = await this.employeeService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee created successfully',
      error: null,
      data: employee,
    };
  }

@Get()
async findAll(
  @Query() query: EmployeeQueryDto,
): Promise<SuccessResponse<Employee[]>> {
  const result = await this.employeeService.findAll(query);
  return {
    statusCode: HttpStatus.OK,
    message: 'Employees fetched successfully',
    error: null,
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponse<Employee>> {
    const employee = await this.employeeService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee fetched successfully',
      error: null,
      data: employee,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<SuccessResponse<Employee>> {
    const employee = await this.employeeService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee updated successfully',
      error: null,
      data: employee,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse<null>> {
    await this.employeeService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee deleted successfully',
      error: null,
      data: null,
    };
  }
}