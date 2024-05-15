import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor( private prisma: PrismaService ) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany()
  }

  async findOne( id: number ): Promise<Category> {
    return this.prisma.category.findUnique({
      where: {
        id
      }
    })
  }

  async create( data: Category ): Promise<Category> {
    return this.prisma.category.create({
      data
    })
  }

  async update( id: number, data: Category ): Promise<Category> {
    return this.prisma.category.update({
      where: {
        id
      },
      data
    })
  }

  async remove( id: number ): Promise<Category> {
    return this.prisma.category.delete({
      where: {
        id
      }
    })
  }
}
