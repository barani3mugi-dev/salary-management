import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Employee } from '../employee/employee.entity';
import { CustomException } from '../../utils/http_response';
import {
    CountryInsight,
    JobTitleInsight,
    DepartmentInsight,
} from './interfaces/insights.interface';

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
                .where('LOWER(employee.country) = :country', { country })
                .getRawOne();

            this.logger.info({ country }, 'Fetched country insights');

            return {
                country,
                min_salary: parseFloat(result.min) || 0,
                max_salary: parseFloat(result.max) || 0,
                avg_salary: parseFloat(result.avg) || 0,
                employee_count: parseInt(result.count) || 0,
            };
        } catch (error) {
            this.logger.error({ err: error, country }, 'Failed to fetch country insights');
            throw new CustomException(
                'Failed to fetch country insights',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
                .where('LOWER(employee.country) = :country', { country })
                .andWhere('employee.job_title = :title', { title })
                .getRawOne();

            this.logger.info({ title, country }, 'Fetched job title insights');

            return {
                job_title: title,
                country: country.trim(),
                avg_salary: parseFloat(result.avg) || 0,
                employee_count: parseInt(result.count) || 0,
            };
        } catch (error) {
            this.logger.error(
                { err: error, title, country },
                'Failed to fetch job title insights',
            );
            throw new CustomException(
                'Failed to fetch job title insights',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getDepartmentInsights(country: string): Promise<DepartmentInsight[]> {
        try {
            const result = await this.repo
                .createQueryBuilder('employee')
                .select('employee.department', 'department')
                .addSelect('AVG(employee.salary)', 'avg')
                .addSelect('COUNT(*)', 'count')
                .where('LOWER(employee.country) = :country', { country })
                .groupBy('employee.department')
                .getRawMany();

            this.logger.info({ country }, 'Fetched department insights');

            return result.map((row) => ({
                department: row.department,
                avg_salary: parseFloat(row.avg) || 0,
                employee_count: parseInt(row.count) || 0,
            }));
        } catch (error) {
            this.logger.error(
                { err: error, country },
                'Failed to fetch department insights',
            );
            throw new CustomException(
                'Failed to fetch department insights',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
            this.logger.error(
                { err: error, country },
                'Failed to fetch top earners',
            );
            throw new CustomException(
                'Failed to fetch top earners',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}