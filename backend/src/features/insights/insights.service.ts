import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Employee } from '../employee/employee.entity';
import {
    CountryInsight,
    JobTitleInsight,
    DepartmentInsight,
} from './interfaces/insights.interface';
import { toFloat, toInt } from '../../common/helpers/number.helper';
import { handleServiceError } from '../../common/helpers/error.helper';

@Injectable()
export class InsightsService {
    constructor(
        @InjectRepository(Employee)
        private readonly repo: Repository<Employee>,
        @InjectPinoLogger(InsightsService.name)
        private readonly logger: PinoLogger,
    ) { }

    async getCountryInsights(country: string): Promise<CountryInsight> {
        try {
            const result = await this.repo
                .createQueryBuilder('employee')
                .select('MIN(employee.salary)', 'min')
                .addSelect('MAX(employee.salary)', 'max')
                .addSelect('AVG(employee.salary)', 'avg')
                .addSelect('COUNT(*)', 'count')
                .where('LOWER(employee.country) = LOWER(:country)', { country })
                .getRawOne();

            this.logger.info({ country }, 'Fetched country insights');

            return {
                country,
                min_salary: toFloat(result.min),
                max_salary: toFloat(result.max),
                avg_salary: toFloat(result.avg),
                employee_count: toInt(result.count),
            };
        } catch (error) {
            handleServiceError(error, this.logger, { country }, 'Failed to fetch country insights');
        }
    }

    async getJobTitleInsights(
        title: string,
        country: string,
    ): Promise<JobTitleInsight> {
        try {
            const result = await this.repo
                .createQueryBuilder('employee')
                .select('AVG(employee.salary)', 'avg')
                .addSelect('COUNT(*)', 'count')
                .where('LOWER(employee.country) = LOWER(:country)', { country })
                .andWhere('LOWER(employee.job_title) = LOWER(:title)', { title })
                .getRawOne();

            this.logger.info({ title, country }, 'Fetched job title insights');

            return {
                job_title: title,
                country: country.trim(),
                avg_salary: parseFloat(result.avg) || 0,
                employee_count: parseInt(result.count) || 0,
            };
        } catch (error) {
            handleServiceError(error, this.logger, { title, country }, 'Failed to fetch job title insights');
        }
    }

    async getDepartmentInsights(country: string): Promise<DepartmentInsight[]> {
        try {
            const result = await this.repo
                .createQueryBuilder('employee')
                .select('employee.department', 'department')
                .addSelect('AVG(employee.salary)', 'avg')
                .addSelect('COUNT(*)', 'count')
                .where('LOWER(employee.country) = LOWER(:country)', { country })
                .groupBy('employee.department')
                .getRawMany();

            this.logger.info({ country }, 'Fetched department insights');

            return result.map((row) => ({
                department: row.department,
                avg_salary: parseFloat(row.avg) || 0,
                employee_count: parseInt(row.count) || 0,
            }));
        } catch (error) {
            handleServiceError(error, this.logger, { country }, 'Failed to fetch department insights');
        }
    }

    async getTopEarners(
        country: string,
        limit: number = 5,
    ): Promise<Employee[]> {
        try {
            const result = await this.repo
                .createQueryBuilder('employee')
                .where('LOWER(employee.country) = LOWER(:country)', { country })
                .orderBy('employee.salary', 'DESC')
                .limit(limit)
                .getMany();

            this.logger.info({ country, limit }, 'Fetched top earners');
            return result;
        } catch (error) {
            handleServiceError(error, this.logger, { country, limit }, 'Failed to fetch top earners');
        }
    }
}