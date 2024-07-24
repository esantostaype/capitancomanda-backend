import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards } from '@nestjs/common'
import { ProductService } from './product.service'
import { Product } from '@prisma/client'
import { UserContext } from 'src/auth/decorators/user-context.decorator'
import { AuthGuard } from 'src/auth/guard/auth.guard'

@Controller('products')
@UseGuards( AuthGuard)
export class ProductController {
  constructor( private readonly productService: ProductService ) {}

  @Get()
  async findAll(
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.productService.findAll( userRole, branchId, ownedRestaurantId )
  }

  @Get('branch/:branchId')
  async findByBranch(
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string },
    @Param('branchId') branch: string
  ) {
    const { userRole } = userContext
    return this.productService.findByBranch( userRole, branch )
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext;
    return this.productService.findByCategory( userRole, categoryId, branchId, ownedRestaurantId )
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: string, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.productService.findOne( userRole, branchId, ownedRestaurantId, id )
  }

  @Post()
  async create(
    @Body() data: Product,
    @UserContext() userContext: { userId: string }
  ) {
    const { userId } = userContext
    return this.productService.create( userId, data )
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Product,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.productService.update( branchId, id, data )
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.productService.remove( branchId, id )
  }
}
