import api from './api';

// Mock data for orders
let mockOrders: any[] = [
  {
    id: '1',
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1 (555) 123-4567',
    deliveryMethod: 'PICKUP',
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    totalAmount: 45.99,
    taxAmount: 3.91,
    shippingAmount: 0.00,
    notes: 'Please have ready by 2 PM',
    items: [
      {
        productId: '1',
        productName: 'Chocolate Cake',
        quantity: 1,
        price: 25.99,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
      },
      {
        productId: '2',
        productName: 'Vanilla Cupcakes',
        quantity: 2,
        price: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
      }
    ],
    shippingAddress: null,
    billingAddress: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '2',
    customerId: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 (555) 987-6543',
    deliveryMethod: 'DELIVERY',
    paymentMethod: 'CREDIT_CARD',
    status: 'PENDING',
    totalAmount: 78.50,
    taxAmount: 6.67,
    shippingAmount: 5.00,
    notes: 'Deliver to front door',
    items: [
      {
        productId: '3',
        productName: 'Wedding Cake',
        quantity: 1,
        price: 73.50,
        imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  }
];

let nextOrderId = 3;

export const ordersService = {
  // Get all orders
  getOrders: async (): Promise<any[]> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/orders');
      return response.data || [];
    } catch (error) {
      console.log('Using mock orders data');
      return mockOrders;
    }
  },

  // Get order by ID
  getOrder: async (id: string): Promise<any> => {
    try {
      // Try to fetch from API first
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock order data');
      return mockOrders.find(order => order.id === id);
    }
  },

  // Create new order
  createOrder: async (orderData: any): Promise<any> => {
    try {
      // Try to create via API first
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.log('Creating mock order');
      
      // Create mock order
      const newOrder = {
        id: String(nextOrderId++),
        customerId: orderData.customerId,
        customerName: 'Customer', // You could enhance this with actual user data
        customerEmail: 'customer@example.com',
        customerPhone: '+1 (555) 000-0000',
        deliveryMethod: orderData.deliveryMethod,
        paymentMethod: orderData.paymentMethod,
        status: 'PENDING',
        totalAmount: orderData.totalAmount,
        taxAmount: orderData.taxAmount,
        shippingAmount: orderData.shippingAmount,
        notes: orderData.notes,
        items: orderData.items.map((item: any) => ({
          productId: item.productId,
          productName: `Product ${item.productId}`, // You could enhance this with actual product data
          quantity: item.quantity,
          price: item.price,
          imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
        })),
        shippingAddress: orderData.shippingAddress || null,
        billingAddress: orderData.billingAddress || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockOrders.push(newOrder);
      return newOrder;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<any> => {
    try {
      // Try to update via API first
      const response = await api.put(`/orders/${orderId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.log('Updating mock order status');
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        mockOrders[orderIndex].updatedAt = new Date().toISOString();
        return mockOrders[orderIndex];
      }
      throw new Error('Order not found');
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<any> => {
    try {
      // Try to cancel via API first
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.log('Cancelling mock order');
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = 'CANCELLED';
        mockOrders[orderIndex].updatedAt = new Date().toISOString();
        return mockOrders[orderIndex];
      }
      throw new Error('Order not found');
    }
  },

  // Process payment
  processPayment: async (paymentData: any): Promise<any> => {
    try {
      // Try to process via API first
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.log('Processing mock payment');
      
      // Mock payment processing
      return {
        id: `payment_${Date.now()}`,
        orderId: paymentData.orderId,
        paymentMethod: paymentData.paymentMethod,
        amount: 0, // This would be calculated from the order
        status: 'COMPLETED',
        transactionId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
    }
  },

  // Get mock orders for development
  getMockOrders: (): any[] => {
    return mockOrders;
  }
};

export default ordersService;
