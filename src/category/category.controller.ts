import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category, Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserContext } from 'src/auth/decorators/user-context.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';

@Controller('categories')
@Roles( Role.OWNER, Role.ADMIN )
@UseGuards( AuthGuard, RoleGuard )
export class CategoryController {

  constructor( private readonly categoryService: CategoryService ) {}

  @Get()
  async findAll(
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext;
    return this.categoryService.findAll( userRole, branchId, ownedRestaurantId );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.categoryService.findOne( userRole, branchId, ownedRestaurantId, id );
  }

  @Post()
  async create( 
    @Body() data: Category,
    @UserContext() userContext: { userId: string }
  ) {
    const { userId } = userContext
    return this.categoryService.create( userId, data );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Category,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.categoryService.update( branchId, id, data );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.categoryService.remove( branchId, id );
  }
}