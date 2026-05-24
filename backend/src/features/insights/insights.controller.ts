import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { SuccessResponse } from '../../utils/http_response';
import { CountryInsight, DepartmentInsight, JobTitleInsight } from './interfaces/insights.interface';
import { Employee } from '../employee/employee.entity';

@Controller('api/v1/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('country/:country')
  async getCountryInsights(
    @Param('country') country: string,
  ): Promise<SuccessResponse<CountryInsight>> {
    const data = await this.insightsService.getCountryInsights(country);
    return {
      statusCode: HttpStatus.OK,
      message: 'Country insights fetched successfully',
      error: null,
      data,
    };
  }

  @Get('job-title')
  async getJobTitleInsights(
    @Query('title') title: string,
    @Query('country') country: string,
  ): Promise<SuccessResponse<JobTitleInsight>> {
    const data = await this.insightsService.getJobTitleInsights(title, country);
    return {
      statusCode: HttpStatus.OK,
      message: 'Job title insights fetched successfully',
      error: null,
      data,
    };
  }

  @Get('department')
  async getDepartmentInsights(
    @Query('country') country: string,
  ): Promise<SuccessResponse<DepartmentInsight[]>> {
    const data = await this.insightsService.getDepartmentInsights(country);
    return {
      statusCode: HttpStatus.OK,
      message: 'Department insights fetched successfully',
      error: null,
      data,
    };
  }

  @Get('top-earners')
  async getTopEarners(
    @Query('country') country: string,
    @Query('limit') limit: string = '5',
  ): Promise<SuccessResponse<Employee[]>> {
    const data = await this.insightsService.getTopEarners(country, +limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Top earners fetched successfully',
      error: null,
      data,
    };
  }
}