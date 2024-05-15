import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '@prisma/client';

@Controller('products')
export class ProductController {

  constructor( private readonly productService: ProductService ) {}
  
  @Get()
  async findAll(
    // @Query('category') category: string,
    // @Query('searchTerm') searchTerm: string,
    // @Query('searchTermAll') searchTermAll: string,
    // @Query('page') page: string,
    // @Query('take') take: string,
    // @Query('min') minPrice: string,
    // @Query('max') maxPrice: string,
  ) {
    // if ( category || searchTerm || page || take || minPrice || maxPrice ) {
    //   return this.productService.findByFilters(
    //     +page,
    //     +take,
    //     category,
    //     searchTerm,
    //     +minPrice,
    //     +maxPrice,
    //   );
    // }
    // if ( searchTermAll ) {
    //   return this.productService.findAllByFilters( searchTermAll );
    // } else {
    //   return this.productService.findAll();
    // }
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne( @Param('id') id: number ) {
    return this.productService.findOne(+id);
  }

  @Post()
  async create( @Body() data: Product ) {
    return this.productService.create( data );
  }

  @Put(':id')
  async update( @Param('id') id: number, @Body() data: Product ) {
    return this.productService.update( +id, data );
  }

  @Delete(':id')
  async remove( @Param('id') id: number ) {
    return this.productService.remove( +id );
  }
}