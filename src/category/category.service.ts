import { Injectable } from '@nestjs/common';
import { Category, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwUnauthorizedException } from 'src/utils'

@Injectable()
export class CategoryService {

  constructor( private prisma: PrismaService ) {}

  async findAll(): Promise<Category[]> {
    return await this.prisma.category.findMany({
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
        orderNumber: 'asc'
      },
    });
  }

  async findOne( id: string ): Promise<Category> {
    return await this.prisma.category.findFirst({
      where: {
        id
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
    })
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
    const lastOrder = await this.prisma.category.findFirst({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let orderIncrement = 1
    if ( lastOrder && lastOrder.orderNumber ) {
      orderIncrement = lastOrder.orderNumber + 1
    }

    const orderNumber = orderIncrement

    if ( userRole === Role.OWNER || Role.MANAGER || Role.ADMIN ) {
      return this.prisma.category.create({
        data: {
          ...data,
          orderNumber,
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
