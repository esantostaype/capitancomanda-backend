import { Injectable } from '@nestjs/common'
import { Product, Role } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ProductService {
  constructor( private prisma: PrismaService ) {}

  async findAll( userRole: string, branchId: string, ownedRestaurantId: string ): Promise<Product[]> {
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
    } else {
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
    }
  }

  async findByCategory( userRole: string, category: string, branchId: string, ownedRestaurantId: string ) {
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
    } else {
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
    }
  }

  async findByBranch( userRole: string, branch: string ) {
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
    }
  }

  async findOne( userRole: string, branchId: string, ownedRestaurantId: string, id: string ): Promise<Product> {
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
    } else {
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
    }
  }

  async create( userId: string, data: Product ): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        ...data,
        userId
      }
    })
  }

  async update( branchId: string, id: string, data: Product ): Promise<Product> {
    return await this.prisma.product.update({
      where: {
        id,
        user: {
          branchId
        }
      },
      data
    })
  }

  async remove( branchId: string, id: string ): Promise<Product> {
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
  }
}
