import { Injectable } from '@nestjs/common';
import { Restaurant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestaurantService {

  constructor( private prisma: PrismaService ) {}

  async findAll(): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({
      where: {
      }
    })
  }

  async findOne( id: string ): Promise<Restaurant> {
    return this.prisma.restaurant.findUnique({
      where: {
        id
      }
    })
  }

  async update( id: string, data: Restaurant ): Promise<Restaurant> {
    return this.prisma.restaurant.update({
      where: {
        id
      },
      data
    })
  }

  async remove( id: string ): Promise<Restaurant> {
    return this.prisma.restaurant.delete({
      where: {
        id
      }
    })
  }
}
