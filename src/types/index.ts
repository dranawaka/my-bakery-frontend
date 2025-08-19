// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  id: string;
  customerId: string;
  customer?: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// Report types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'financial' | 'customer' | 'product' | 'operations';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dataSource: string[];
  format: 'chart' | 'table' | 'both';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportData {
  salesData: SalesDataPoint[];
  orderStatusData: OrderStatusData[];
  topProducts: ProductPerformance[];
  customerMetrics: CustomerMetric[];
  revenueByCategory: CategoryRevenue[];
  dailyOrders: DailyOrderData[];
  inventoryLevels: InventoryLevel[];
  financialMetrics: FinancialMetric[];
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  stockLevel: number;
}

export interface CustomerMetric {
  metric: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  previousValue?: number | string;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface DailyOrderData {
  date: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface InventoryLevel {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  status: 'low' | 'normal' | 'high' | 'out';
  lastUpdated: string;
}

export interface FinancialMetric {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  growthRate: number;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  reportType: string;
  category?: string;
  productId?: string;
  customerId?: string;
  status?: string;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  template: ReportTemplate;
  frequency: string;
  time: string;
  recipients: string[];
  isActive: boolean;
  lastGenerated?: string;
  nextGeneration?: string;
  createdAt: string;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  imageUrl?: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}
