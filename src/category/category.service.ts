import { Injectable } from '@nestjs/common';
import { Category, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor( private prisma: PrismaService ) {}

  async findAll( userRole: string, branchId: string, ownedRestaurantId: string ): Promise<Category[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.category.findMany({
        where: {
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        },
        include: {
          products: {
            select: {
              id: true
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
      return await this.prisma.category.findMany({
        where: {
          user: {
            branchId: branchId,
          },
        },
        include: {
          products: {
            select: {
              id: true
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

  async findOne( userRole: string, branchId: string, ownedRestaurantId: string, id: string ): Promise<Category> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.category.findFirst({
        where: {
          id,
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        },
        include: {
          products: {
            select: {
              id: true
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
      return await this.prisma.category.findFirst({
        where: {
          id,
          user: {
            branchId: branchId,
          },
        },
        include: {
          products: {
            select: {
              id: true
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

  async create( userId: string, data: Category ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ...data,
        userId
      }
    })
  }

  async update( branchId: string, id: string, data: Category ): Promise<Category> {
    return this.prisma.category.update({
      where: {
        id,
        user: {
          branchId
        }
      },
      data
    })
  }

  async remove( branchId: string, id: string ): Promise<Category> {
    return this.prisma.category.delete({
      where: {
        id,
        user: {
          branchId
        }
      }
    })
  }
}
