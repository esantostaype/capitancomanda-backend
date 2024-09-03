import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Role, Client } from '@prisma/client'

@Injectable()
export class ClientService {

  constructor( private prisma: PrismaService ) {}

  async findAll( userRole: Role, branchId: string, ownedRestaurantId: string ): Promise<Client[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.client.findMany({
        where: {
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      return await this.prisma.client.findMany({
        where: {
          user: {
            branchId: branchId,
          },
        },
        orderBy: {
          createdAt: 'desc'
        },
      })
    }
  }

  async findOne( userRole: Role, branchId: string, ownedRestaurantId: string, id: string ) {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.client.findFirst({
        where: {
          id,
          user: {
            branch: {
              restaurantId: ownedRestaurantId
            }
          }
        }
      })
    } else {
      return await this.prisma.client.findFirst({
        where: {
          id,
          user: {
            branchId: branchId,
          }
        }
      })
    }
  }

  async findByNameOrDni( searchTerm: string, userId: string ): Promise<Client[]> {

    if ( searchTerm.length === 8 && /^\d+$/.test( searchTerm )) {
      return this.prisma.client.findMany({
        where: {
          dni: searchTerm,
          userId: userId,
        }
      })
    } else if ( searchTerm.length >= 3 ) {
      return this.prisma.client.findMany({
        where: {
          fullName: {
            contains: searchTerm,
            mode: 'insensitive'
          },
          userId: userId
        }
      })
    } else {
      return []
    }
  }

  async create( UserId: string, data: Client ) {
    return await this.prisma.client.create({
      data: {
        ...data,
        userId: UserId
      }
    })
  }

  async update( branchId: string, id: string, data: Client ) {
    return await this.prisma.client.update({
      where: {
        id,
        user: {
          branchId: branchId
        }
      },
      data
    })
  }

  async remove( branchId: string, id: string ) {
    return this.prisma.client.delete({
      where: {
        id,
        user: {
          branchId: branchId
        }
      }
    })
  }
}
