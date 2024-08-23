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
            userId: userId
          },
        })
        clientId = newClient.id
      }
    }
  
    try {
      const lastOrder = await this.prisma.order.findFirst({
        orderBy: {
          createdAt: 'desc'
        }
      })
  
      let orderIncrement = '00001'
      if ( lastOrder && lastOrder.orderNumber ) {
        const lastNumber = parseInt( lastOrder.orderNumber, 10 );
        orderIncrement = ( lastNumber + 1 ).toString().padStart( 5, '0' )
      }
  
      const orderNumber = orderIncrement
      
      await this.prisma.order.create({
        data: {
          userId: userId,
          clientId: clientId,
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