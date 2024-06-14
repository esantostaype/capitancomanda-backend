import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { BranchId } from 'src/auth/decorators/user.decorator';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {

  constructor( private readonly categoryService: CategoryService ) {}

  @Get()
  async findAll( @BranchId() branchId: string ) {    
    return this.categoryService.findAll( branchId );
  }

  @Get(':id')
  async findOne( @BranchId() branchId: string, @Param('id') id: string ) {
    return this.categoryService.findOne( branchId, id);
  }

  @Post()
  async create( @BranchId() branchId: string, @Body() data: Category ) {
    return this.categoryService.create( branchId, data );
  }

  @Put(':id')
  async update( @BranchId() branchId: string, @Param('id') id: string, @Body() data: Category ) {
    return this.categoryService.update( branchId, id, data );
  }

  @Delete(':id')
  async remove( @BranchId() branchId: string, @Param('id') id: string ) {
    return this.categoryService.remove( branchId, id );
  }
}