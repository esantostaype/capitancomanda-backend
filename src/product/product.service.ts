import { Injectable } from '@nestjs/common'
import { Product, Role } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { throwUnauthorizedException } from 'src/utils'

@Injectable()
export class ProductService {
  
  constructor( private prisma: PrismaService ) {}  

  async findAll( userRole: Role, branchId: string, ownedRestaurantId: string ): Promise<Product[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.product.findMany({
        where: {
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
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
    } else if ( userRole === Role.ADMIN || Role.MANAGER ) {
      return await this.prisma.product.findMany({
        where: {
          user: {
            branchId: branchId
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
          createdAt: 'desc'
        },
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async findByCategory( userRole: Role, category: string, branchId: string, ownedRestaurantId: string ) {
    if ( userRole === Role.OWNER ) {
      return this.prisma.product.findMany({
        where: {
          category: {
            id: category
          },
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
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
          createdAt: 'desc'
        },
      })
    } else if ( userRole === Role.ADMIN || Role.MANAGER ) {
      return this.prisma.product.findMany({
        where: {
          category: {
            id: category
          },
          user: {
            branchId: branchId
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
          createdAt: 'desc'
        }
      })
    } else {
      throwUnauthorizedException()
    }
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
          createdAt: 'desc'
        },
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async findOne( userRole: Role, branchId: string, ownedRestaurantId: string, id: string ): Promise<Product> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.product.findFirst({
        where: {
          id,
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
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
        }
      })
    } else if ( userRole === Role.ADMIN || Role.MANAGER ) {
      return await this.prisma.product.findFirst({
        where: {
          id,
          user: {
            branchId: branchId,
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
        }
      })
    } else {
      throwUnauthorizedException()
    }
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
