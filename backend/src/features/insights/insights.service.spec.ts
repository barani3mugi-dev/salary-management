import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';
import { getLoggerToken } from 'nestjs-pino';

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};


const mockEmployees = [
  {
    id: '1',
    full_name: 'Arun Kumar',
    job_title: 'Software Engineer',
    department: 'Engineering',
    country: 'India',
    salary: 85000,
    currency: 'INR',
  },
  {
    id: '2',
    full_name: 'Priya Singh',
    job_title: 'Product Manager',
    department: 'Product',
    country: 'India',
    salary: 120000,
    currency: 'INR',
  },
  {
    id: '3',
    full_name: 'John Smith',
    job_title: 'Software Engineer',
    department: 'Engineering',
    country: 'USA',
    salary: 150000,
    currency: 'USD',
  },
];

const mockRepository = {
  createQueryBuilder: jest.fn(),
};

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
        {
          provide: getLoggerToken(InsightsService.name),
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  afterEach(() => jest.clearAllMocks());


  describe('getCountryInsights', () => {
    it('should return min, max, average salary for a country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          min: '85000',
          max: '120000',
          avg: '102500',
          count: '2',
        }),
      });

      const result = await service.getCountryInsights('India');

      expect(result.min_salary).toBe(85000);
      expect(result.max_salary).toBe(120000);
      expect(result.avg_salary).toBe(102500);
      expect(result.employee_count).toBe(2);
    });

    it('should return zeros when no employees in country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          min: null,
          max: null,
          avg: null,
          count: '0',
        }),
      });

      const result = await service.getCountryInsights('Antarctica');

      expect(result.min_salary).toBe(0);
      expect(result.max_salary).toBe(0);
      expect(result.avg_salary).toBe(0);
      expect(result.employee_count).toBe(0);
    });
  });


  describe('getJobTitleInsights', () => {
    it('should return average salary for a job title in a country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          avg: '85000',
          count: '1',
        }),
      });

      const result = await service.getJobTitleInsights('Software Engineer', 'India');

      expect(result.avg_salary).toBe(85000);
      expect(result.employee_count).toBe(1);
    });

    it('should return zero when job title not found in country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          avg: null,
          count: '0',
        }),
      });

      const result = await service.getJobTitleInsights('CEO', 'Antarctica');

      expect(result.avg_salary).toBe(0);
      expect(result.employee_count).toBe(0);
    });
  });


  describe('getDepartmentInsights', () => {
    it('should return salary breakdown by department for a country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { department: 'Engineering', avg: '85000', count: '1' },
          { department: 'Product', avg: '120000', count: '1' },
        ]),
      });

      const result = await service.getDepartmentInsights('India');

      expect(result).toHaveLength(2);
      expect(result[0].department).toBe('Engineering');
      expect(result[0].avg_salary).toBe(85000);
    });
  });


  describe('getTopEarners', () => {
    it('should return top 5 highest paid employees in a country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockEmployees.slice(0, 2)),
      });

      const result = await service.getTopEarners('India');

      expect(result).toHaveLength(2);
      getMany: jest.fn().mockResolvedValue([
  mockEmployees[1],
  mockEmployees[0],
    ]);});

    it('should return empty array when no employees in country', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getTopEarners('Antarctica');

      expect(result).toHaveLength(0);
    });
  });
});