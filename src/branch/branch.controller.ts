import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { Branch } from '@prisma/client';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { OwnedRestaurantId } from 'src/auth/decorators/user.decorator';

@Controller('branches')
@UseGuards(AuthGuard)
export class BranchController {

  constructor( private readonly branchService: BranchService ) {}

  @Get()
  async findAll( @OwnedRestaurantId() ownedRestaurantId: string ) {    
    return this.branchService.findAll( ownedRestaurantId );
  }

  @Get(':id')
  async findOne( @OwnedRestaurantId() ownedRestaurantId: string, @Param('id') id: string ) {
    return this.branchService.findOne( ownedRestaurantId, id);
  }

  @Post()
  async create( @OwnedRestaurantId() ownedRestaurantId: string, @Body() data: Branch ) {
    return this.branchService.create( ownedRestaurantId, data );
  }

  @Put(':id')
  async update( @OwnedRestaurantId() ownedRestaurantId: string, @Param('id') id: string, @Body() data: Branch ) {
    return this.branchService.update( ownedRestaurantId, id, data );
  }

  @Delete(':id')
  async remove( @OwnedRestaurantId() ownedRestaurantId: string, @Param('id') id: string ) {
    return this.branchService.remove( ownedRestaurantId, id );
  }
}