import { Injectable } from '@nestjs/common';
import { Branch } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BranchService {

  constructor( private prisma: PrismaService ) {}

  async findAll( ownedRestaurantId: string ): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: {
        restaurantId: ownedRestaurantId
      },
      include: {
        users: true
      }
    })
  }

  async findOne( ownedRestaurantId: string, id: string ): Promise<Branch> {
    return this.prisma.branch.findUnique({
      where: {
        restaurantId: ownedRestaurantId,
        id
      }
    })
  }

  async create( ownedRestaurantId: string, data: Branch ): Promise<Branch> {
    return this.prisma.branch.create({
      data: {
        ...data,
        restaurantId: ownedRestaurantId
      }
    })
  }

  async update( ownedRestaurantId: string, id: string, data: Branch ): Promise<Branch> {
    return this.prisma.branch.update({
      where: {
        restaurantId: ownedRestaurantId,
        id
      },
      data
    })
  }

  async remove( ownedRestaurantId: string, id: string ): Promise<Branch> {
    return this.prisma.branch.delete({
      where: {
        restaurantId: ownedRestaurantId,
        id
      }
    })
  }
}
