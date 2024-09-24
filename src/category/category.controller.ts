import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category, Role } from '@prisma/client';
import { UserContext } from 'src/auth/decorators/user-context.decorator';

@Controller('categories')
export class CategoryController {

  constructor( private readonly categoryService: CategoryService ) {}

  @Get()
  async findAll(
  ) {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.categoryService.findOne( id );
  }

  @Post()
  async create( 
    @Body() data: Category,
    @UserContext() userContext: { userRole: Role,userId: string }
  ) {
    const { userId, userRole } = userContext
    return this.categoryService.create( userRole, userId, data );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Category,
    @UserContext() userContext: { userRole: Role,branchId: string }
  ) {
    const { branchId, userRole } = userContext
    return this.categoryService.update( userRole, branchId, id, data );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role,branchId: string }
  ) {
    const { branchId, userRole } = userContext
    return this.categoryService.remove( userRole, branchId, id );
  }
}