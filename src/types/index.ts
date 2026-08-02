export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role_id: number;
  is_active: boolean;
  totp_enabled: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id?: number;
  product_id?: number;
  name: string;
  price?: number | null;
  image_url?: string | null;
  is_available: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category_id?: number;
  is_available: boolean;
  created_at?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id?: number;
  image_url: string;
  order: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
}

export interface Order {
  id: number;
  order_code: string;
  user_id?: number;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  wilaya: string;
  commune: string;
  address: string;
  note?: string;
  status: OrderStatus;
  total_price: number;
  delivery_fee?: number;
  created_at?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_order: number;
  product_name?: string;
  variant_id?: number;
  variant_name?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Chat {
  id: number;
  user_id?: number;
  user?: { name: string; email?: string; phone?: string };
  guest_identifier?: string;
  product_id?: number;
  is_active: boolean;
  created_at?: string;
  messages: Message[];
}

export interface Message {
  id: number;
  chat_id: number;
  sender_type: 'admin' | 'customer';
  content: string;
  is_read: boolean;
  created_at?: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  unread_messages: number;
  total_revenue: number;
  recent_orders: {
    id: number;
    order_code: string;
    customer: string;
    total_price: number;
    status: string;
    created_at?: string;
  }[];
}

export interface GeneralSettings {
  store_name: string;
  store_description: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
}

export interface DeliveryWilaya {
  code: string;
  ar_name: string;
  price: number;
}

export interface Notification {
  id: number;
  type: string;
  reference_id?: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  accepted: 'تم القبول',
  preparing: 'قيد التحضير',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};
