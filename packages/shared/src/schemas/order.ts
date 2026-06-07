import { z } from 'zod';

/** Payment methods: COD (cash on delivery) or BANK_TRANSFER */
export const PaymentMethodSchema = z.enum(['COD', 'BANK_TRANSFER']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/** Phone number: Vietnamese mobile numbers (10 digits starting with 0) */
const PhoneNumberSchema = z.string().regex(
  /^(0[3|5|7|8|9])[0-9]{8}$/,
  'Số điện thoại không đúng định dạng.',
);

/** A single order line item */
export const OrderItemSchema = z.object({
  productId: z.string().uuid('productId không hợp lệ.'),
  quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1.').max(99, 'Tối đa 99 sản phẩm mỗi dòng.'),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

/** Create order request */
export const CreateOrderSchema = z.object({
  customerName: z.string().min(1, 'Vui lòng nhập họ tên.').max(200, 'Họ tên quá dài.'),
  phone: PhoneNumberSchema,
  address: z.string().min(1, 'Vui lòng nhập địa chỉ.').max(500, 'Địa chỉ quá dài.'),
  note: z.string().max(1000, 'Ghi chú quá dài.').optional(),
  paymentMethod: PaymentMethodSchema,
  items: z.array(OrderItemSchema).min(1, 'Giỏ hàng trống.').max(50, 'Tối đa 50 dòng sản phẩm.'),
  checkoutAttemptId: z.string().uuid('Mã checkout không hợp lệ.').optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/** Public order tracking request */
export const TrackOrderSchema = z.object({
  publicCode: z.string().min(1, 'Vui lòng nhập mã đơn hàng.'),
  phone: PhoneNumberSchema,
});
export type TrackOrderInput = z.infer<typeof TrackOrderSchema>;

/** Order status enum */
export const OrderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/** Payment status enum */
export const PaymentStatusSchema = z.enum(['UNPAID', 'PAID', 'REFUNDED']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/** Public order summary (what the customer sees) */
export interface PublicOrderSummary {
  publicCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  /** Only included when paymentMethod is BANK_TRANSFER and paymentStatus is UNPAID */
  bankTransfer?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    transferContent: string;
    instructions: string | null;
    qrImageUrl: string | null;
  };
}
