import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
import { Order } from '@prisma/client';
import { OrderService } from './order.service'

@Controller('orders')
export class OrderController {

  constructor( private readonly orderService: OrderService ) {}

  @Get()
  async findAll() {
    return this.orderService.findAll();
  }

  @Get(':status')
  async findByStatus( @Param('status') status: string) {
    return this.orderService.findByStatus( status );
  }

  @Get(':id')
  async findOne( @Param('id') id: string ) {
    return this.orderService.findOne(+id);
  }

  @Post()
  async create( @Body() data ): Promise<any> {
    try {
      const create = await this.orderService.create( data );
      return { message: 'Pedido creado exitosamente', order: create };
    } catch (error) {
      return { error: 'Error al crear el pedido' };
    }
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() data: Order ) {
    return this.orderService.update( +id, data );
  }

  @Delete(':id')
  async remove( @Param('id') id: string ) {
    return this.orderService.remove( +id );
  }
}