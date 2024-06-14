import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor( private prisma: PrismaService ) {}

  async findAll( branchId: string ): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        branchId
      },
      include: {
        products: true,
        branch: true
      }
    })
  }

  async findOne( branchId: string, id: string ): Promise<Category> {
    return this.prisma.category.findUnique({
      where: {
        branchId,
        id
      }
    })
  }

  async create( branchId: string, data: Category ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ...data,
        branchId
      }
    })
  }

  async update( branchId: string, id: string, data: Category ): Promise<Category> {
    return this.prisma.category.update({
      where: {
        branchId,
        id
      },
      data
    })
  }

  async remove( branchId: string, id: string ): Promise<Category> {
    return this.prisma.category.delete({
      where: {
        branchId,
        id
      }
    })
  }
}
