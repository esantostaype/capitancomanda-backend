import { Controller, Get, Param, Delete, Body, Put, UseGuards, Post } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { OrderService } from './order.service'
import { AuthGuard } from 'src/auth/auth.guard';
import { BranchId } from 'src/auth/decorators/user.decorator';

@Controller('orders')
@UseGuards( AuthGuard )
export class OrderController {

  constructor( private readonly orderService: OrderService ) {}

  @Get()
  async findAll( @BranchId() branchId: string ) {
    return this.orderService.findAll( branchId );
  }

  @Get(':status')
  async findByStatus( @BranchId() branchId: string, @Param('status') status: OrderStatus) {
    return this.orderService.findByStatus( branchId, status );
  }

  @Get(':id')
  async findOne( @BranchId() branchId: string, @Param('id') id: string ) {
    return this.orderService.findOne( branchId, id);
  }

  @Post()
  async create( @BranchId() branchId: string, @Body() data ): Promise<any> {
    try {
      const create = await this.orderService.create( branchId, data );
      return { message: 'Pedido creado exitosamente', order: create };
    } catch (error) {
      return { error: 'Error al crear el pedido' };
    }
  }

  @Put(':id')
  async update( @BranchId() branchId: string, @Param('id') id: string, @Body() data: Order ) {
    return this.orderService.update( branchId, id, data );
  }

  @Delete(':id')
  async remove( @BranchId() branchId: string, @Param('id') id: string ) {
    return this.orderService.remove( branchId, id );
  }
}