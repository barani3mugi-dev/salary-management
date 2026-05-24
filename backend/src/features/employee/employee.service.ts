import { Injectable, NotFoundException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create_employee.dto';
import { UpdateEmployeeDto } from './dto/update_employee.dto';
import { EmployeeQueryDto } from './dto/employee_query.dto';
import { CustomException } from '../../utils/http_response';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectPinoLogger(EmployeeService.name)
        private readonly logger: PinoLogger,

        @InjectRepository(Employee)
        private readonly repo: Repository<Employee>,
    ) { }

    async create(dto: CreateEmployeeDto): Promise<Employee> {
        try {
            this.logger.info({ full_name: dto.full_name }, 'Creating employee');
            const employee = this.repo.create(dto);
            return await this.repo.save(employee);
        } catch (error) {
            this.logger.error({ err: error, full_name: dto.full_name }, 'Failed to create employee');
            throw new CustomException(
                'Failed to create employee',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll(query: EmployeeQueryDto) {
        try {
            const { page = 1, limit = 20, search, country, department, job_title, employment_type } = query;

            const where: any = {};
            if (search) where.full_name = ILike(`%${search}%`);
            if (country) where.country = country;
            if (department) where.department = department;
            if (job_title) where.job_title = job_title;
            if (employment_type) where.employment_type = employment_type;

            const [data, total] = await this.repo.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { full_name: 'ASC' },
            });

            this.logger.info({ total, page, limit }, 'Fetched employees');
            return { data, total, page, limit };
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to fetch employees');
            throw new CustomException(
                'Failed to fetch employees',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: string): Promise<Employee> {
        try {
            const employee = await this.repo.findOne({ where: { id } });

            if (!employee) {
                this.logger.warn({ id }, 'Employee not found');
                throw new CustomException(
                    `Employee not found`,
                    'Not Found',
                    HttpStatus.NOT_FOUND,
                );
            }

            this.logger.info({ id }, 'Fetched employee');
            return employee;

        } catch (error) {
            if (error instanceof CustomException) throw error;
            this.logger.error({ err: error, id }, 'Failed to fetch employee');
            throw new CustomException(
                'Failed to fetch employee',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
        try {
            this.logger.info({ id }, 'Updating employee');
            const employee = await this.repo.findOne({ where: { id } });
            if (!employee) {
                this.logger.warn({ id }, 'Employee not found for update');
                throw new CustomException(
                    `Employee not found`,
                    'Not Found',
                    HttpStatus.NOT_FOUND,
                );
            }
            this.repo.merge(employee, dto);
            return await this.repo.save(employee);
        } catch (error) {
            if (error instanceof CustomException) throw error;
            this.logger.error({ err: error, id }, 'Failed to update employee');
            throw new CustomException(
                'Failed to update employee',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: string): Promise<void> {
        try {
            this.logger.info({ id }, 'Deleting employee');
            const result = await this.repo.delete(id);
            if (result.affected === 0) {
                this.logger.warn({ id }, 'Employee not found for deletion');
                throw new CustomException(
                    `Employee not found`,
                    'Not Found',
                    HttpStatus.NOT_FOUND,
                );
            }
        } catch (error) {
            if (error instanceof CustomException) throw error;
            this.logger.error({ err: error, id }, 'Failed to delete employee');
            throw new CustomException(
                'Failed to delete employee',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}