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
import { successResponse } from '../../common/helpers/response.helper';

@Controller('api/v1/employees')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateEmployeeDto): Promise<SuccessResponse<Employee>> {
        const employee = await this.employeeService.create(dto);
        return successResponse(employee, 'Employee created successfully', HttpStatus.CREATED);

    }

    @Get()
    async findAll(
        @Query() query: EmployeeQueryDto,
    ): Promise<SuccessResponse<PaginatedResult<Employee>>> {
        const result = await this.employeeService.findAll(query);
        return successResponse(result, 'Employees fetched successfully');
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<SuccessResponse<Employee>> {
        const employee = await this.employeeService.findOne(id);
        return successResponse(employee, 'Employee fetched successfully');
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateEmployeeDto,
    ): Promise<SuccessResponse<Employee>> {
        const employee = await this.employeeService.update(id, dto);
        return successResponse(employee, 'Employee updated successfully');
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<SuccessResponse<null>> {
        await this.employeeService.remove(id);
        return successResponse(null, 'Employee deleted successfully');
    }
}