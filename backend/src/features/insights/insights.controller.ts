import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { SuccessResponse } from '../../utils/http_response';
import { CountryInsight, DepartmentInsight, JobTitleInsight } from './interfaces/insights.interface';
import { Employee } from '../employee/employee.entity';
import { successResponse } from '../../common/helpers/response.helper';

@Controller('api/v1/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('country/:country')
  async getCountryInsights(
    @Param('country') country: string,
  ): Promise<SuccessResponse<CountryInsight>> {
    const data = await this.insightsService.getCountryInsights(country);
   return successResponse(data, 'Country insights fetched successfully');
  }

  @Get('job-title')
  async getJobTitleInsights(
    @Query('title') title: string,
    @Query('country') country: string,
  ): Promise<SuccessResponse<JobTitleInsight>> {
    const data = await this.insightsService.getJobTitleInsights(title, country);
    return successResponse(data, 'Job title insights fetched successfully');
  }

  @Get('department')
  async getDepartmentInsights(
    @Query('country') country: string,
  ): Promise<SuccessResponse<DepartmentInsight[]>> {
    const data = await this.insightsService.getDepartmentInsights(country);
    return successResponse(data, 'Department insights fetched successfully');
  }

  @Get('top-earners')
  async getTopEarners(
    @Query('country') country: string,
    @Query('limit') limit: string = '5',
  ): Promise<SuccessResponse<Employee[]>> {
    const data = await this.insightsService.getTopEarners(country, +limit);
    return successResponse(data, 'Top earners fetched successfully');
  }
}