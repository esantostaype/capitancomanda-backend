import { Controller, Get, Post, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { Branch, Role } from '@prisma/client';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { OwnedRestaurantId } from 'src/auth/decorators/user.decorator';
import { UserContext } from 'src/auth/decorators/user-context.decorator';

@Controller('branches')
@UseGuards(AuthGuard)
export class BranchController {

  constructor( private readonly branchService: BranchService ) {}

  @Get()
  async findAll( @OwnedRestaurantId() ownedRestaurantId: string ) {    
    return this.branchService.findAll( ownedRestaurantId );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role, ownedRestaurantId: string }
  ){
    const { userRole, ownedRestaurantId } = userContext
    return this.branchService.findOne( userRole, ownedRestaurantId, id);
  }

  @Post()
  async create( @OwnedRestaurantId() ownedRestaurantId: string, @Body() data: Branch ) {
    return this.branchService.create( ownedRestaurantId, data );
  }

  @Put(':id')
  async update(
    @Param('id') id: string, @Body() data: Branch,
    @UserContext() userContext: { userRole: Role, ownedRestaurantId: string }
  ){
    const { userRole, ownedRestaurantId } = userContext
    return this.branchService.update( userRole, ownedRestaurantId, id, data );
  }

  @Delete(':id')
  async remove( @OwnedRestaurantId() ownedRestaurantId: string, @Param('id') id: string ) {
    return this.branchService.remove( ownedRestaurantId, id );
  }
}