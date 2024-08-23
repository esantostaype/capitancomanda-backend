import { Injectable } from '@nestjs/common';
import { Category, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwUnauthorizedException } from 'src/utils'

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
          createdAt: 'desc'
        },
      });
    } else if ( userRole === Role.ADMIN || Role.MANAGER ) {
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
          createdAt: 'desc'
        },
      });
    } else {
      throwUnauthorizedException()
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
          createdAt: 'desc'
        },
      });
    } else if ( userRole === Role.ADMIN || Role.MANAGER ) {
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
          createdAt: 'desc'
        },
      });
    } else {
      throwUnauthorizedException()
    }
  }

  async findByBranch( userRole: Role, branch: string ) {
    if ( userRole === Role.OWNER ) {
      return this.prisma.category.findMany({
        where: {
          user: {
            branchId: branch
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
                  name: true
                }
              },
              branchId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async create( userRole: Role, userId: string, data: Category ): Promise<Category> {
    if ( userRole === Role.OWNER || Role.MANAGER || Role.ADMIN ) {
      return this.prisma.category.create({
        data: {
          ...data,
          userId
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async update( userRole: Role, branchId: string, id: string, data: Category ): Promise<Category> {
    if ( userRole === Role.OWNER || Role.MANAGER || Role.ADMIN ) {
      return this.prisma.category.update({
        where: {
          id,
          user: {
            branchId
          }
        },
        data
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async remove( userRole: Role, branchId: string, id: string ): Promise<Category> {
    if (userRole === Role.OWNER || userRole === Role.ADMIN || userRole === Role.MANAGER) {
      const products = await this.prisma.product.findMany({
        where: {
          categoryId: id,
          user: {
            branchId,
          },
        },
        select: {
          id: true,
        },
      });
  
      const productIds = products.map(product => product.id);
  
      await this.prisma.orderProduct.deleteMany({
        where: {
          productId: {
            in: productIds,
          },
        },
      });
  
      await this.prisma.product.deleteMany({
        where: {
          categoryId: id,
          user: {
            branchId,
          },
        },
      });
  
      return await this.prisma.category.delete({
        where: {
          id,
          user: {
            branchId,
          },
        },
      });
    } else {
      throwUnauthorizedException();
    }
  }
  
}
