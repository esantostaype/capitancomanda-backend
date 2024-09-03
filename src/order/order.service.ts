import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderSchema } from 'src/schema';

@Injectable()
export class OrderService {

  constructor( private prisma: PrismaService ) {}

  async findAll( userRole: Role, branchId: string, ownedRestaurantId: string ): Promise<Order[]> {
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
          },
          client: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
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
          user: {
            select: {
              fullName: true,
              branchId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  }

  async findOne( userRole: Role, branchId: string, ownedRestaurantId: string, id: string ): Promise<Order> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.order.findFirst({
        where: {
          id,
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        },
        include: {
          orderProducts: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  variations: true
                }
              }
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
        }
      })
    } else {
      return await this.prisma.order.findFirst({
        where: {
          id,
          user: {
            branchId: branchId,
          },
        },
        include: {
          orderProducts: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  variations: true
                }
              }
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
        }
      })
    }
  }

  async findByStatus( userRole: Role, branchId: string, ownedRestaurantId: string, status: OrderStatus ): Promise<Order[]> {
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
              product: {
                select: {
                  name: true,
                  price: true,
                  variations: true
                }
              }
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
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      })
    }
  }

  async findLastOrder( userId: string ): Promise<{ orderNumber: string | null }> {
    return await this.prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { userId },
      select: {
        orderNumber: true
      }
    })
  }

  async generateOrderNumber( userId: string ): Promise<string> {
    const lastOrder = await this.prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { userId }
    })
  
    let orderIncrement = '00001'
    if ( lastOrder && lastOrder.orderNumber ) {
      const lastNumber = parseInt( lastOrder.orderNumber, 10 )
      orderIncrement = ( lastNumber + 1 ).toString().padStart( 5, '0' )
    }
  
    return orderIncrement
  }

  async create( userId: string, data: Order ): Promise<any> {
    const result = OrderSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      }
    }

    let clientId = null

    if ( result.data.client && ( result.data.client.dni || result.data.client.fullName )) {
      const existingClient = await this.prisma.client.findUnique({
        where: {
          dni: result.data.client.dni
        }
      })

      if ( existingClient ) {
        clientId = existingClient.id
      } else {
        const newClient = await this.prisma.client.create({
          data: {
            fullName: result.data.client.fullName,
            dni: result.data.client.dni,
            phone: result.data.client.phone,
            email: result.data.client.email,
            role: Role.CLIENT,
            userId
          },
        })
        clientId = newClient.id
      }
    }
  
    try {
      const orderNumber = await this.generateOrderNumber( userId )
      
      await this.prisma.order.create({
        data: {
          userId: userId,
          clientId: clientId,
          floor: result.data.floor,
          table: result.data.table,
          orderType: result.data.orderType,
          total: result.data.total,
          status: OrderStatus.RECEIVED,
          orderNumber: orderNumber,
          orderProducts: {
            create: result.data.order.map((product) => ({
              productId: product.id,
              quantity: product.quantity,
              uniqueId: product.uniqueId,
              variationPrice: product.variationPrice || null,
              selectedVariants: product.selectedVariants || {},
              selectedAdditionals: product.selectedAdditionals || {},
              notes: product.notes || null
            })),
          },
          notes: result.data.notes
        }
      })
  
      return { success: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }
      throw error;
    }
  }

  async createOrder( userId: string, data: any ): Promise<any> {

    const orderNumber = await this.generateOrderNumber( userId )

    let clientId = null

    if ( data.client && ( data.client.dni || data.client.fullName )) {
      const existingClient = await this.prisma.client.findUnique({
        where: {
          dni: data.client.dni
        }
      })

      if ( existingClient ) {
        clientId = existingClient.id
      } else {
        const newClient = await this.prisma.client.create({
          data: {
            fullName: data.client.fullName,
            dni: data.client.dni,
            phone: data.client.phone,
            email: data.client.email,
            role: Role.CLIENT,
            userId
          },
        })
        clientId = newClient.id
      }
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        total: data.total,
        floor: data.floor,
        table: data.table,
        orderType: data.orderType,
        notes: data.notes,
        status: OrderStatus.RECEIVED,
        userId: userId,
        clientId: clientId,
        orderProducts: {
          create: data.order.map(( item: any ) => ({
            productId: item.id,
            quantity: item.quantity,
            uniqueId: item.uniqueId,
            selectedVariants: item.selectedVariations,
            selectedAdditionals: item.selectedAdditionals,
            variationPrice: item.variationPrice,
            notes: item.notes
          }))
        }
      }
    })

    return { success: true, order }
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