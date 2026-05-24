import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { NotFoundException } from '@nestjs/common';
import { EmploymentType } from './dto/create_employee.dto';

const mockEmployee = {
  id: '1',
  full_name: 'Arun Kumar',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 85000,
  currency: 'INR',
  email: 'arun@example.com',
  hire_date: '2024-01-01',
  employment_type: EmploymentType.FULL_TIME,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
};

describe('EmployeesService', () => {
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => jest.clearAllMocks());


  describe('create', () => {
    it('should create and return an employee', async () => {
      mockRepository.create.mockReturnValue(mockEmployee);
      mockRepository.save.mockResolvedValue(mockEmployee);

      const result = await service.create({
        full_name: 'Arun Kumar',
        job_title: 'Software Engineer',
        department: 'Engineering',
        country: 'India',
        salary: 85000,
        currency: 'INR',
        email: 'arun@example.com',
        hire_date: '2024-01-01',
        employment_type: EmploymentType.FULL_TIME,
      });

      expect(result.full_name).toBe('Arun Kumar');
      expect(result.salary).toBe(85000);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });


  describe('findAll', () => {
    it('should return paginated list with total count', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter employees by country', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      const result = await service.findAll({ page: 1, limit: 10, country: 'India' });

      expect(result.data[0].country).toBe('India');
    });

    it('should search employees by name', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      const result = await service.findAll({ page: 1, limit: 10, search: 'Arun' });

      expect(result.data[0].full_name).toContain('Arun');
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(result.full_name).toBe('Arun Kumar');
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });


  describe('update', () => {
    it('should update and return employee', async () => {
      const updated = { ...mockEmployee, salary: 95000 };
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.merge.mockReturnValue(updated);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update('1', { salary: 95000 });

      expect(result.salary).toBe(95000);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent employee', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { salary: 95000 }))
        .rejects.toThrow(NotFoundException);
    });
  });


  describe('remove', () => {
    it('should delete employee by id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('1')).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when deleting non-existent employee', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});