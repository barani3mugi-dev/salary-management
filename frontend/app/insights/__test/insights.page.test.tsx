import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InsightsPage from '../page';
import { insightsApi } from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}));

const mockCountryInsight = {
  country: 'India',
  min_salary: 40000,
  max_salary: 220000,
  avg_salary: 95000,
  employee_count: 1043,
};

const mockTopEarners = [
  {
    id: '1',
    full_name: 'Arjun Sharma',
    job_title: 'Principal Engineer',
    department: 'Engineering',
    country: 'India',
    salary: '220000',
    currency: 'INR',
  },
];

const mockDepartments = [
  { department: 'Engineering', avg_salary: 120000, employee_count: 100 },
  { department: 'Product', avg_salary: 100000, employee_count: 50 },
];

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

describe('InsightsPage', () => {
  beforeEach(() => {
    (insightsApi.getCountry as jest.Mock).mockResolvedValue(mockCountryInsight);
    (insightsApi.getTopEarners as jest.Mock).mockResolvedValue(mockTopEarners);
    (insightsApi.getDepartment as jest.Mock).mockResolvedValue(mockDepartments);
    (insightsApi.getJobTitle as jest.Mock).mockResolvedValue({
      job_title: 'Software Engineer',
      country: 'India',
      avg_salary: 85000,
      employee_count: 45,
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('should render insights page title', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('Salary Insights')).toBeInTheDocument();
  });

  it('should render country selector', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('country')).toBeInTheDocument();
  });

  it('should render stat card titles', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('Min Salary')).toBeInTheDocument();
    expect(screen.getByText('Max Salary')).toBeInTheDocument();
    expect(screen.getByText('Avg Salary')).toBeInTheDocument();
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
  });

  it('should render job title insights section', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('Job Title Insights')).toBeInTheDocument();
  });

  it('should render department chart section', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('Avg Salary by Department')).toBeInTheDocument();
  });

  it('should render top earners section', () => {
    renderWithQuery(<InsightsPage />);
    expect(screen.getByText('Top Earners')).toBeInTheDocument();
  });

 it('should not show top earner table when no country selected', () => {
  renderWithQuery(<InsightsPage />);
  expect(screen.queryByText('Arjun Sharma')).not.toBeInTheDocument();
});

  it('should not call country API when no country selected', () => {
    renderWithQuery(<InsightsPage />);
    expect(insightsApi.getCountry).not.toHaveBeenCalled();
  });
});