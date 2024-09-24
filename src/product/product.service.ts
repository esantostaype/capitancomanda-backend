import { Injectable } from '@nestjs/common'
import { Product, Role } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { throwUnauthorizedException } from 'src/utils'

@Injectable()
export class ProductService {
  
  constructor( private prisma: PrismaService ) {}  

  async findAll(): Promise<Product[]> {
    return await this.prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
            orderNumber: true
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
      orderBy: [
        {
          category: {
            orderNumber: 'asc'
          }
        },
        {
          name: 'asc'
        }
      ]
    })
  }

  async findByCategory( category: string ) {
    return this.prisma.product.findMany({
      where: {
        category: {
          id: category
        }
      },
      include: {
        category: {
          select: {
            name: true
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
        name: 'asc',
      }
    })
  }

  async findByBranch( userRole: Role, branch: string ) {
    if ( userRole === Role.OWNER ) {
      return this.prisma.product.findMany({
        where: {
          user: {
            branchId: branch
          }
        },
        include: {
          category: {
            select: {
              name: true
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
          name: 'asc',
        },
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async findOne( id: string ): Promise<Product> {
    return await this.prisma.product.findFirst({
      where: {
        id
      },
      include: {
        category: {
          select: {
            name: true,
            orderNumber: true
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
      }
    })    
  }

  async create( userRole: Role, userId: string, data: Product ): Promise<Product> {
    if ( userRole === Role.OWNER || Role.ADMIN || Role.MANAGER ) {
      return await this.prisma.product.create({
        data: {
          ...data,
          userId
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async update( userRole: Role, branchId: string, id: string, data: Product ): Promise<Product> {
    if ( userRole === Role.OWNER || Role.ADMIN || Role.MANAGER ) {
      return await this.prisma.product.update({
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

  async remove( userRole: Role, branchId: string, id: string ): Promise<Product> {
    if ( userRole === Role.OWNER || Role.ADMIN || Role.MANAGER ) {
      await this.prisma.orderProduct.deleteMany({
        where: {
          productId: id
        }
      })
      return await this.prisma.product.delete({
        where: {
          id,
          user: {
            branchId
          }
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }
}
