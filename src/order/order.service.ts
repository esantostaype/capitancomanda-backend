import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderSchema } from 'src/schema';

@Injectable()
export class OrderService {

  constructor( private prisma: PrismaService ) {}

  async findAll( branchId: string ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        branchId
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        },
        branch: true
      },
      orderBy: {
        date: 'asc'
      }
    })
  }

  async findOne( branchId: string, id: string ): Promise<Order> {
    return this.prisma.order.findUnique({
      where: {
        branchId,
        id
      }
    })
  }

  async findByStatus( branchId: string, status: OrderStatus ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        branchId,
        status
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        },
        branch: true
      },
      orderBy: {
        date: 'asc'
      }
    })
  }

  async create( branchId: string, data: any ): Promise<any> {
    const result = OrderSchema.safeParse( data )
    console.log( result )
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      };
    }
    try {
      await this.prisma.order.create({
        data: {
          branchId: branchId,
          table: result.data.table,
          delivery: result.data.delivery,
          total: result.data.total,
          status: OrderStatus.RECEIVED,
          orderProducts: {
            create: result.data.order.map( product => ({
              productId: product.id,
              quantity: product.quantity
            }))
          }
        }
      })
      return { success: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.message)
      } else {
        console.error('Unknown error occurred:', error)
      }
      throw error
    }
  }

  async update( branchId: string, id: string, data: Order ): Promise<any> {
    if( data.status === OrderStatus.READY ){
      return this.prisma.order.update({
        where: {
          branchId,
          id: id
        },
        data: {
          status: data.status,
          orderReadyAt: new Date( Date.now() )
        }
      })
    }
    return this.prisma.order.update({
      where: {
        id: id
      },
      data: {
        status: data.status
      }
    })
  }

  async remove( branchId: string, id: string ): Promise<Order> {
    await this.prisma.orderProduct.deleteMany({
      where: {
        orderId: id
      }
    })
    return this.prisma.order.delete({
      where: {
        branchId,
        id
      }
    })
  }
}