// insights/dto/insights-query.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CountryInsightsDto {
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class JobTitleInsightsDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  job_title: string;
}

export class TopEarnersDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}