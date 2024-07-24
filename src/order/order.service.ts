import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderSchema } from 'src/schema';

@Injectable()
export class OrderService {

  constructor( private prisma: PrismaService ) {}

  async findAll( userRole: string, branchId: string, ownedRestaurantId: string ): Promise<Order[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.order.findMany({
        where: {
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        },
        include: {
          orderProducts: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              fullName: true,
              branch: {
                select: {
                  name: true,
                }
              },
              branchId: true
            }
          }
        },
        orderBy: {
          id: 'asc',
        },
      });
    } else {
      return await this.prisma.order.findMany({
        where: {
          user: {
            branchId: branchId,
          },
        },
        include: {
          orderProducts: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              fullName: true,
              branch: {
                select: {
                  name: true,
                }
              },
              branchId: true
            }
          }
        },
        orderBy: {
          id: 'asc',
        },
      });
    }
  }

  async findOne( userRole: string, branchId: string, ownedRestaurantId: string, id: string ): Promise<Order> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.order.findFirst({
        where: {
          id,
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        }
      })
    } else {
      return await this.prisma.order.findFirst({
        where: {
          id,
          user: {
            branchId: branchId,
          },
        }
      })
    }
  }

  async findByStatus( userRole: string, branchId: string, ownedRestaurantId: string, status: OrderStatus ): Promise<Order[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.order.findMany({
        where: {
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          },
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
    } else {
      return await this.prisma.order.findMany({
        where: {
          user: {
            branchId: branchId,
          },
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
  }

  async create( userId: string, data: Order ): Promise<any> {
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
          userId: userId,
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
          user: {
            branchId
          },
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
        user: {
          branchId
        },
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
        user: {
          branchId
        },
        id
      }
    })
  }
}