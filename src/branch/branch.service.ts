import { Injectable } from '@nestjs/common';
import { Branch, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwUnauthorizedException } from 'src/utils';

export interface CreateBranch extends Branch {
  floors: {
    name: string;
    tables: {
      name: string;
    }[];
  }[];
}

@Injectable()
export class BranchService {

  constructor( private prisma: PrismaService ) {}

  async findAll( ownedRestaurantId: string ): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: {
        restaurantId: ownedRestaurantId
      },
      include: {
        users: {
          select: {
            fullName: true
          }
        },
        floors: {
          include: {
            tables: {
              orderBy: [
                {
                  number: 'asc'
                }
              ]
            }
          }
        }
      }
    })
  }

  async findOne( userRole: string, ownedRestaurantId: string, id: string ): Promise<Branch> {
    if ( userRole === Role.OWNER ) {
      return this.prisma.branch.findUnique({
        where: {
          restaurantId: ownedRestaurantId,
          id
        },
        include: {
          floors: {
            include: {
              tables: true
            }
          }
        }
      })
    } else if ( userRole === Role.MANAGER || userRole === Role.WAITER ) {
      return this.prisma.branch.findUnique({
        where: {
          id
        },
        include: {
          floors: {
            include: {
              tables: true
            }
          }
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async create(ownedRestaurantId: string, data: any): Promise<Branch> {
    return this.prisma.branch.create({
      data: {
        ...data,
        restaurantId: ownedRestaurantId,
        floors: {
          create: data.floors.map(floor => ({
            ...floor,
            tables: {
              create: floor.tables.map(table => ({
                ...table,
                number: table.number
              })),
            },
          })),
        },
      },
      include: {
        floors: {
          include: {
            tables: true,
          },
        },
      },
    });
  }

  async update(userRole: string, ownedRestaurantId: string, id: string, data: any): Promise<Branch> {
    if (userRole === Role.OWNER || userRole === Role.MANAGER) {
      const existingBranch = await this.prisma.branch.findUnique({
        where: { id },
        include: {
          floors: {
            include: {
              tables: true,
              orders: true, // Incluir órdenes asociadas al piso
            }
          }
        }
      });
  
      if (!existingBranch) {
        throw new Error('Branch not found');
      }
  
      const existingFloorIds = existingBranch.floors.map(floor => floor.id);
      const existingTableIds = existingBranch.floors.flatMap(floor => floor.tables.map(table => table.id));
  
      const newFloorIds = data.floors.map(floor => floor.id).filter(id => id);
      const newTableIds = data.floors.flatMap(floor => floor.tables.map(table => table.id)).filter(id => id);
  
      // Eliminar OrderProduct asociados a las Orders que se eliminarán
      const ordersToDelete = await this.prisma.order.findMany({
        where: {
          tableId: {
            in: existingTableIds.filter(id => !newTableIds.includes(id))
          }
        }
      });
      const orderIdsToDelete = ordersToDelete.map(order => order.id);
  
      await this.prisma.orderProduct.deleteMany({
        where: {
          orderId: {
            in: orderIdsToDelete
          }
        }
      });
  
      // Eliminar Orders asociadas a los tables
      await this.prisma.order.deleteMany({
        where: {
          tableId: {
            in: existingTableIds.filter(id => !newTableIds.includes(id))
          }
        }
      });
  
      // Eliminar Orders asociadas a los floors
      const floorOrdersToDelete = await this.prisma.order.findMany({
        where: {
          floorId: {
            in: existingFloorIds.filter(id => !newFloorIds.includes(id))
          }
        }
      });
      const floorOrderIdsToDelete = floorOrdersToDelete.map(order => order.id);
  
      await this.prisma.orderProduct.deleteMany({
        where: {
          orderId: {
            in: floorOrderIdsToDelete
          }
        }
      });
  
      await this.prisma.order.deleteMany({
        where: {
          floorId: {
            in: existingFloorIds.filter(id => !newFloorIds.includes(id))
          }
        }
      });
  
      // Eliminar tables y floors como se hizo antes
      await this.prisma.table.deleteMany({
        where: {
          id: {
            in: existingTableIds.filter(id => !newTableIds.includes(id))
          }
        }
      });
  
      await this.prisma.floor.deleteMany({
        where: {
          id: {
            in: existingFloorIds.filter(id => !newFloorIds.includes(id))
          }
        }
      });
  
      return this.prisma.branch.update({
        where: { id },
        data: {
          ...data,
          floors: {
            upsert: data.floors.map(floor => ({
              where: { id: floor.id ?? '' },
              create: {
                name: floor.name,
                tables: {
                  create: floor.tables.map(table => ({
                    number: table.number
                  })),
                },
              },
              update: {
                name: floor.name,
                tables: {
                  upsert: floor.tables.map(table => ({
                    where: { id: table.id ?? '' },
                    create: {
                      number: table.number
                    },
                    update: {
                      number: table.number
                    }
                  })),
                },
              },
            })),
          },
        },
        include: {
          floors: {
            include: {
              tables: true,
            },
          },
        },
      });
    } else {
      throwUnauthorizedException();
    }
  }
  


  async remove(ownedRestaurantId: string, id: string): Promise<Branch> {
    // Obtener las órdenes asociadas a los tables y floors del branch
    const ordersToDelete = await this.prisma.order.findMany({
      where: {
        table: {
          floor: {
            branchId: id
          }
        }
      }
    });
    const orderIdsToDelete = ordersToDelete.map(order => order.id);
  
    // Eliminar OrderProduct asociados a esas órdenes
    await this.prisma.orderProduct.deleteMany({
      where: {
        orderId: {
          in: orderIdsToDelete
        }
      }
    });
  
    // Eliminar las órdenes
    await this.prisma.order.deleteMany({
      where: {
        table: {
          floor: {
            branchId: id
          }
        }
      }
    });
  
    // Eliminar tables relacionados
    await this.prisma.table.deleteMany({
      where: {
        floor: {
          branchId: id
        }
      }
    });
  
    // Eliminar floors relacionados
    await this.prisma.floor.deleteMany({
      where: {
        branchId: id
      }
    });
  
    // Finalmente, eliminar el branch
    return this.prisma.branch.delete({
      where: {
        restaurantId: ownedRestaurantId,
        id
      }
    });
  }
  
}