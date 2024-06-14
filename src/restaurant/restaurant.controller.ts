import { Controller, Get, Param, Delete, Body, Put } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '@prisma/client';

@Controller('restaurants')
export class RestaurantController {

  constructor( private readonly restaurantService: RestaurantService ) {}

  @Get()
  async findAll() {    
    return this.restaurantService.findAll();
  }

  @Get(':id')
  async findOne( @Param('id') id: string ) {
    return this.restaurantService.findOne( id);
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() data: Restaurant ) {
    return this.restaurantService.update( id, data );
  }

  @Delete(':id')
  async remove( @Param('id') id: string ) {
    return this.restaurantService.remove( id );
  }
}