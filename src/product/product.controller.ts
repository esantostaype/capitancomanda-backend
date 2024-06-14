import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { BranchId, OwnedRestaurantId } from 'src/auth/decorators/user.decorator';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @OwnedRestaurantId() ownedRestaurantId: string,
    @BranchId() branchId: string,
    @Query('category') category: string
  ) {
    if ( category ) {
      return this.productService.findByCategory( category, ownedRestaurantId, branchId );
    }
    return this.productService.findAll( ownedRestaurantId, branchId );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @BranchId() branchId: string
  ) {
    return this.productService.findOne( branchId, id );
  }

  @Post()
  async create( @Body() data: Product, @BranchId() branchId: string ) {
    return this.productService.create( branchId, data );
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() data: Product, @BranchId() branchId: string ) {
    return this.productService.update( branchId, id, data );
  }

  @Delete(':id')
  async remove( @Param('id') id: string, @BranchId() branchId: string ) {
    return this.productService.remove( branchId, id );
  }
}
