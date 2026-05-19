import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        const priceAtPurchase = Number(product.price);
        totalAmount += priceAtPurchase * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase,
        });
      }

      const order = await tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          phone: createOrderDto.phone,
          address: createOrderDto.address,
          note: createOrderDto.note,
          paymentMethod: createOrderDto.paymentMethod,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }
}
