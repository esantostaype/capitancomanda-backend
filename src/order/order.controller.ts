import { Controller, Get, Param, Delete, Body, Put, UseGuards, Post } from '@nestjs/common';
import { Order, OrderStatus, Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderService } from './order.service'
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { UserContext } from 'src/auth/decorators/user-context.decorator';

@Controller('orders')
@Roles( Role.OWNER, Role.ADMIN )
@UseGuards( AuthGuard, RoleGuard )
export class OrderController {

  constructor( private readonly orderService: OrderService ) {}

  @Get()
  async findAll(
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext;
    return this.orderService.findAll( userRole, branchId, ownedRestaurantId );
  }

  @Get(':status')
  async findByStatus(
    @Param('status') status: OrderStatus,
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext;
    return this.orderService.findByStatus( userRole, branchId, ownedRestaurantId, status );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.orderService.findOne( userRole, branchId, ownedRestaurantId, id);
  }

  @Post()
  async create( 
    @Body() data: Order,
    @UserContext() userContext: { userId: string }
  ) {
    const { userId } = userContext
    return this.orderService.create( userId, data );
  }

  @Put(':id')
  async update(    
    @Param('id') id: string,
    @Body() data: Order,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.orderService.update( branchId, id, data );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.orderService.remove( branchId, id );
  }
}