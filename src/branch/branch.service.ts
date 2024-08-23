import { Injectable } from '@nestjs/common';
import { Branch, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwUnauthorizedException } from 'src/utils';

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
        }
      })
    } else if ( userRole === Role.MANAGER ) {
      return this.prisma.branch.findUnique({
        where: {
          id
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async create( ownedRestaurantId: string, data: Branch ): Promise<Branch> {
    return this.prisma.branch.create({
      data: {
        ...data,
        restaurantId: ownedRestaurantId
      }
    })
  }

  async update( userRole: string, ownedRestaurantId: string, id: string, data: Branch ): Promise<Branch> {
    if ( userRole === Role.OWNER ) {
      return this.prisma.branch.update({
        where: {
          restaurantId: ownedRestaurantId,
          id
        },
        data
      })
    } else if ( userRole === Role.MANAGER ) {
      return this.prisma.branch.update({
        where: {
          id
        },
        data
      })
    } else {
      throwUnauthorizedException()
    }
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