import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll( ownedRestaurantId?: string, branchId?: string  ): Promise<Product[]> {
    if ( ownedRestaurantId ) {
      return await this.prisma.product.findMany({
        where: {
          branch: {
            restaurantId: ownedRestaurantId
          }
        },
        include: {
          category: true,
          branch: true
        },
        orderBy: {
          id: 'asc'
        }
      })
    } else if ( branchId ) {
      return await this.prisma.product.findMany({
        where: {
          branchId
        },
        include: {
          category: true,
          branch: true
        },
        orderBy: {
          id: 'asc'
        }
      })
    }
  }

  async findByCategory( category: string, ownedRestaurantId?: string, branchId?: string ): Promise<Product[]> {
    if ( ownedRestaurantId ) {
      return await this.prisma.product.findMany({
        where: {
          branch: {
            restaurantId: ownedRestaurantId
          },
          category: {
            id: category,
          },
        },
        include: {
          category: true,
          branch: true
        },
        orderBy: {
          id: 'asc'
        }
      })
    } else if ( branchId ) {
      return await this.prisma.product.findMany({
        where: {
          branchId,
          category: {
            id: category,
          },
        },
        include: {
          category: true,
          branch: true
        },
        orderBy: {
          id: 'asc'
        }
      })
    }
  }

  async findOne( branchId: string, id: string ): Promise<Product> {
    return await this.prisma.product.findUnique({
      where: {
        branchId,
        id
      }
    })
  }

  async create( branchId: string, data: Product ): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        ...data,
        branchId
      }
    })
  }

  async update( branchId: string, id: string, data: Product ): Promise<Product> {
    return await this.prisma.product.update({
      where: {
        branchId,
        id
      },
      data: {
        ...data,
        branchId
      }
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
        branchId,
        id
      }
    })
  }
}
