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
      // Obtener el branch existente
      const existingBranch = await this.prisma.branch.findUnique({
        where: { id },
        include: {
          floors: {
            include: {
              tables: true
            }
          }
        }
      });

      if (!existingBranch) {
        throw new Error('Branch not found');
      }

      // Obtener IDs actuales
      const existingFloorIds = existingBranch.floors.map(floor => floor.id);
      const existingTableIds = existingBranch.floors.flatMap(floor => floor.tables.map(table => table.id));

      // Obtener nuevos IDs
      const newFloorIds = data.floors.map(floor => floor.id).filter(id => id);
      const newTableIds = data.floors.flatMap(floor => floor.tables.map(table => table.id)).filter(id => id);

      // Eliminar tables que ya no existen
      await this.prisma.table.deleteMany({
        where: {
          id: {
            in: existingTableIds.filter(id => !newTableIds.includes(id))
          }
        }
      });

      // Eliminar floors que ya no existen
      await this.prisma.floor.deleteMany({
        where: {
          id: {
            in: existingFloorIds.filter(id => !newFloorIds.includes(id))
          }
        }
      });

      // Actualizar el branch con los nuevos floors y tables
      return this.prisma.branch.update({
        where: { id },
        data: {
          ...data,
          floors: {
            upsert: data.floors.map(floor => ({
              where: { id: floor.id ?? '' }, // Usa el id del piso si existe
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
                    where: { id: table.id ?? '' }, // Usa el id de la mesa si existe
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
    // Elimina todos los tables relacionados
    await this.prisma.table.deleteMany({
      where: {
        floor: {
          branchId: id
        }
      }
    });
  
    // Elimina todos los floors relacionados
    await this.prisma.floor.deleteMany({
      where: {
        branchId: id
      }
    });
  
    // Finalmente, elimina el branch
    return this.prisma.branch.delete({
      where: {
        restaurantId: ownedRestaurantId,
        id
      }
    });
  }
}