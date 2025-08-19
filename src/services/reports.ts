import api from './api';
import { 
  ReportData, 
  ReportTemplate, 
  ScheduledReport, 
  ReportFilter,
  SalesDataPoint,
  OrderStatusData,
  ProductPerformance,
  CustomerMetric,
  CategoryRevenue,
  DailyOrderData,
  InventoryLevel,
  FinancialMetric
} from '../types';

export const reportsService = {
  // Get all report templates
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    try {
      const response = await api.get('/reports/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }
  },

  // Get report data based on filters
  getReportData: async (filters: ReportFilter): Promise<ReportData> => {
    try {
      const response = await api.get('/reports/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Return mock data as fallback
      return generateMockReportData(filters);
    }
  },

  // Get specific report type data
  getSalesReport: async (filters: ReportFilter): Promise<SalesDataPoint[]> => {
    try {
      const response = await api.get('/reports/sales', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      return generateMockSalesData(filters);
    }
  },

  getOrderStatusReport: async (filters: ReportFilter): Promise<OrderStatusData[]> => {
    try {
      const response = await api.get('/reports/orders/status', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching order status report:', error);
      return generateMockOrderStatusData();
    }
  },

  getProductPerformanceReport: async (filters: ReportFilter): Promise<ProductPerformance[]> => {
    try {
      const response = await api.get('/reports/products/performance', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching product performance report:', error);
      return generateMockProductPerformance();
    }
  },

  getCustomerMetricsReport: async (filters: ReportFilter): Promise<CustomerMetric[]> => {
    try {
      const response = await api.get('/reports/customers/metrics', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer metrics report:', error);
      return generateMockCustomerMetrics();
    }
  },

  getCategoryRevenueReport: async (filters: ReportFilter): Promise<CategoryRevenue[]> => {
    try {
      const response = await api.get('/reports/categories/revenue', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching category revenue report:', error);
      return generateMockCategoryRevenue();
    }
  },

  getInventoryReport: async (filters: ReportFilter): Promise<InventoryLevel[]> => {
    try {
      const response = await api.get('/reports/inventory', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      return generateMockInventoryLevels();
    }
  },

  getFinancialReport: async (filters: ReportFilter): Promise<FinancialMetric[]> => {
    try {
      const response = await api.get('/reports/financial', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      return generateMockFinancialMetrics();
    }
  },

  // Schedule a report
  scheduleReport: async (scheduleData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    try {
      const response = await api.post('/reports/schedule', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  },

  // Get scheduled reports
  getScheduledReports: async (): Promise<ScheduledReport[]> => {
    try {
      const response = await api.get('/reports/scheduled');
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return [];
    }
  },

  // Update scheduled report
  updateScheduledReport: async (id: string, updateData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    try {
      const response = await api.put(`/reports/scheduled/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw error;
    }
  },

  // Delete scheduled report
  deleteScheduledReport: async (id: string): Promise<void> => {
    try {
      await api.delete(`/reports/scheduled/${id}`);
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  },

  // Export report
  exportReport: async (filters: ReportFilter, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/export/${format}`, { 
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
};

// Mock data generators for development/testing
const generateMockReportData = (filters: ReportFilter): ReportData => ({
  salesData: generateMockSalesData(filters),
  orderStatusData: generateMockOrderStatusData(),
  topProducts: generateMockProductPerformance(),
  customerMetrics: generateMockCustomerMetrics(),
  revenueByCategory: generateMockCategoryRevenue(),
  dailyOrders: generateMockDailyOrders(filters),
  inventoryLevels: generateMockInventoryLevels(),
  financialMetrics: generateMockFinancialMetrics()
});

const generateMockSalesData = (filters: ReportFilter): SalesDataPoint[] => {
  const data: SalesDataPoint[] = [];
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const revenue = Math.floor(Math.random() * 1000) + 200;
    const orders = Math.floor(Math.random() * 20) + 5;
    data.push({
      date: d.toISOString().split('T')[0],
      revenue,
      orders,
      customers: Math.floor(Math.random() * 15) + 3,
      averageOrderValue: Math.round(revenue / orders)
    });
  }
  return data;
};

const generateMockOrderStatusData = (): OrderStatusData[] => [
  { status: 'Pending', count: 15, percentage: 25, revenue: 750 },
  { status: 'Confirmed', count: 12, percentage: 20, revenue: 600 },
  { status: 'Preparing', count: 18, percentage: 30, revenue: 900 },
  { status: 'Ready', count: 8, percentage: 13, revenue: 400 },
  { status: 'Delivered', count: 7, percentage: 12, revenue: 350 }
];

const generateMockProductPerformance = (): ProductPerformance[] => [
  {
    id: '1',
    name: 'Chocolate Cake',
    category: 'Cakes',
    sales: 45,
    revenue: 1350,
    profit: 675,
    profitMargin: 50,
    stockLevel: 12
  },
  {
    id: '2',
    name: 'Croissant',
    category: 'Pastries',
    sales: 38,
    revenue: 380,
    profit: 190,
    profitMargin: 50,
    stockLevel: 25
  },
  {
    id: '3',
    name: 'Bread Loaf',
    category: 'Bread',
    sales: 32,
    revenue: 160,
    profit: 80,
    profitMargin: 50,
    stockLevel: 8
  }
];

const generateMockCustomerMetrics = (): CustomerMetric[] => [
  { metric: 'Total Customers', value: 1250, change: '+12%', trend: 'up' },
  { metric: 'New Customers', value: 89, change: '+8%', trend: 'up' },
  { metric: 'Repeat Customers', value: 456, change: '+15%', trend: 'up' },
  { metric: 'Avg Order Value', value: '$45.20', change: '+5%', trend: 'up' }
];

const generateMockCategoryRevenue = (): CategoryRevenue[] => [
  { category: 'Cakes', revenue: 4500, percentage: 35, orderCount: 120, averageOrderValue: 37.50 },
  { category: 'Pastries', revenue: 3200, percentage: 25, orderCount: 200, averageOrderValue: 16.00 },
  { category: 'Bread', revenue: 2800, percentage: 22, orderCount: 350, averageOrderValue: 8.00 },
  { category: 'Pies', revenue: 1800, percentage: 14, orderCount: 90, averageOrderValue: 20.00 },
  { category: 'Cookies', revenue: 800, percentage: 4, orderCount: 160, averageOrderValue: 5.00 }
];

const generateMockDailyOrders = (filters: ReportFilter): DailyOrderData[] => {
  const data: DailyOrderData[] = [];
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const orders = Math.floor(Math.random() * 30) + 10;
    const revenue = Math.floor(Math.random() * 800) + 300;
    data.push({
      date: d.toISOString().split('T')[0],
      orders,
      revenue,
      averageOrderValue: Math.round(revenue / orders)
    });
  }
  return data;
};

const generateMockInventoryLevels = (): InventoryLevel[] => [
  {
    productId: '1',
    productName: 'Chocolate Cake',
    category: 'Cakes',
    currentStock: 12,
    reorderPoint: 15,
    maxStock: 50,
    status: 'low',
    lastUpdated: new Date().toISOString()
  },
  {
    productId: '2',
    productName: 'Croissant',
    category: 'Pastries',
    currentStock: 25,
    reorderPoint: 20,
    maxStock: 100,
    status: 'normal',
    lastUpdated: new Date().toISOString()
  }
];

const generateMockFinancialMetrics = (): FinancialMetric[] => [
  {
    period: 'January 2024',
    revenue: 45000,
    expenses: 27000,
    profit: 18000,
    profitMargin: 40,
    growthRate: 12
  },
  {
    period: 'December 2023',
    revenue: 42000,
    expenses: 26000,
    profit: 16000,
    profitMargin: 38,
    growthRate: 8
  }
];

export default reportsService;
