import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderSchema } from 'src/schema';

@Injectable()
export class OrderService {

  constructor( private prisma: PrismaService ) {}

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    })
  }

  async findOne( id: number ): Promise<Order> {
    return this.prisma.order.findUnique({
      where: {
        id
      }
    })
  }

  async findByStatus( status: string ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    })
  }

  async create( data ): Promise<any> {
    const result = OrderSchema.safeParse( data )
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      };
    }
    try {
      await this.prisma.order.create({
        data: {
          table: result.data.table,
          delivery: result.data.delivery,
          total: result.data.total,
          orderProducts: {
            create: result.data.order.map( product => ({
              productId: product.id,
              quantity: product.quantity,
              spicyLevelNumber: product.spicyLevelNumber
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

  async update( id: number, data ): Promise<any> {
    if( data.status == "ready" ){
      return this.prisma.order.update({
        where: {
          id: +id
        },
        data: {
          status: data.status,
          orderReadyAt: new Date( Date.now() )
        }
      })
    }
    return this.prisma.order.update({
      where: {
        id: +id
      },
      data: {
        status: data.status
      }
    })
  }

  async remove( id: number ): Promise<Order> {
    return this.prisma.order.delete({
      where: {
        id
      }
    })
  }
}