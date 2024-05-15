import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {

  constructor( private prisma: PrismaService ) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        id: 'asc'
      }
    })
  }

  async findAllByFilters( searchTermAll: string ): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        name: {
          contains: searchTermAll
        }
      }
    })
  }

  async findByFilters(
    page?: number,
    take?: number,
    category?: string,
    searchTerm?: string,
    minPrice?: number,
    maxPrice?: number  ): Promise< Product[] >{
    const pageFound =  page ? page : 1
    const takeFound = take ? take : 10
    const categoryFound = category ? category : ''
    const skip = ( pageFound - 1 ) * takeFound
    const minFound =  minPrice ? minPrice : 1
    const maxFound = maxPrice ? maxPrice : 99999999999
    const searchTermFound = searchTerm ? searchTerm : ''
    const whereCondition: any = {
      price: {
        gte: minFound,
        lte: maxFound,
      },
      name: {
        contains: searchTermFound,
      },
    };
  
    if (categoryFound) {
      whereCondition.category = {
        slug: categoryFound,
      };
    }
  
    return this.prisma.product.findMany({
      take: takeFound,
      skip: skip,
      where: whereCondition,
      include: {
        category: true
      }
    });
  }
  
  async findByCategory( category: string, page?: number, take?: number ): Promise<Product[]> {
    const skip = ( page - 1 ) * take 
    return this.prisma.product.findMany({
      take,
      skip,
      include: {
        category: true
      },
      where: {
        category: {
          slug: category
        }
      }
    })
  }
  
  async findBySearch( searchTerm: string ): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        name: {
          contains: searchTerm
        }
      }
    })
  }

  async findAllCategories(){
    return this.prisma.category.findMany()
  }

  async findOne( id: number ): Promise<Product> {
    return this.prisma.product.findUnique({
      where: {
        id
      }
    })
  }

  async create( data: Product ): Promise<Product> {
    return this.prisma.product.create({
      data
    })
  }

  async update( id: number, data: Product ): Promise<Product> {
    return this.prisma.product.update({
      where: {
        id
      },
      data  
    })
  }

  async remove( id: number ): Promise<Product> {
    return this.prisma.product.delete({
      where: {
        id
      }
    })
  }
}
