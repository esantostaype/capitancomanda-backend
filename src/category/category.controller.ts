import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '@prisma/client';

@Controller('categories')
export class CategoryController {

  constructor( private readonly categoryService: CategoryService ) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne( @Param('id') id: string ) {
    return this.categoryService.findOne(+id);
  }

  @Post()
  async create( @Body() data: Category ) {
    return this.categoryService.create( data );
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() data: Category ) {
    return this.categoryService.update( +id, data );
  }

  @Delete(':id')
  async remove( @Param('id') id: string ) {
    return this.categoryService.remove( +id );
  }
}