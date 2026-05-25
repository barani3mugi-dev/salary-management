import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeesPage from '../page';
import { employeeApi } from '@/lib/api';

jest.mock('@/lib/api');

const mockEmployees = {
  data: [
    {
      id: '1',
      full_name: 'Arun Kumar',
      job_title: 'Software Engineer',
      department: 'Engineering',
      country: 'India',
      salary: 85000,
      currency: 'INR',
      employment_type: 'FULL_TIME',
      performance_rating: 4.5,
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

const renderWithQuery = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('EmployeesPage', () => {
  beforeEach(() => {
    (employeeApi.getAll as jest.Mock).mockResolvedValue(mockEmployees);
    (employeeApi.remove as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  it('should render the employees page title', async () => {
    renderWithQuery(<EmployeesPage />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('should render Add Employee button', () => {
    renderWithQuery(<EmployeesPage />);
    expect(screen.getByText('Add Employee')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    renderWithQuery(<EmployeesPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render employee data after loading', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText('Arun Kumar')).toBeInTheDocument();
    });
  });

  it('should render employee job title', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('should render employee country', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText('India')).toBeInTheDocument();
    });
  });

it('should open dialog when Add Employee is clicked', async () => {
  renderWithQuery(<EmployeesPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Add Employee' })).toBeInTheDocument();
  });
});

  it('should call delete API when delete button clicked', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText('Arun Kumar')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(employeeApi.remove).toHaveBeenCalledWith('1');
    });
  });

  it('should show total employee count', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 1 employees/)).toBeInTheDocument();
    });
  });

  it('should disable previous button on first page', async () => {
    renderWithQuery(<EmployeesPage />);
    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeDisabled();
    });
  });
});