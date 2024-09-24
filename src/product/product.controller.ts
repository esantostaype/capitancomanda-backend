import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common'
import { ProductService } from './product.service'
import { Product, Role } from '@prisma/client'
import { UserContext } from 'src/auth/decorators/user-context.decorator'

@Controller('products')
export class ProductController {
  constructor( private readonly productService: ProductService ) {}

  @Get()
  async findAll(
  ) {
    return this.productService.findAll()
  }

  @Get('branch/:branchId')
  async findByBranch(
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string },
    @Param('branchId') branch: string
  ) {
    const { userRole } = userContext
    return this.productService.findByBranch( userRole, branch )
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string
  ) {
    return this.productService.findByCategory( categoryId )
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.productService.findOne( id )
  }

  @Post()
  async create(
    @Body() data: Product,
    @UserContext() userContext: { userRole: Role, userId: string }
  ) {
    const { userId, userRole } = userContext
    return this.productService.create( userRole, userId, data )
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Product,
    @UserContext() userContext: { userRole: Role, branchId: string }
  ) {
    const { branchId, userRole } = userContext
    return this.productService.update( userRole, branchId, id, data )
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role, branchId: string }
  ) {
    const { branchId, userRole } = userContext
    return this.productService.remove( userRole, branchId, id )
  }
}
