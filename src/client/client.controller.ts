import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UserContext } from 'src/auth/decorators/user-context.decorator'
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ClientService } from './client.service';
import { Role } from '@prisma/client';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.clientService.findAll( userRole, branchId, ownedRestaurantId )
  }
  
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.clientService.findOne( userRole, branchId, ownedRestaurantId, id );
  }

  @UseGuards(AuthGuard)
  @Get('search/:searchTerm')
  async searchClient(
    @Param('searchTerm') searchTerm: string,
    @UserContext() userContext: { userId: string }
  ) {
    const { userId } = userContext;
    return this.clientService.findByNameOrDni(searchTerm, userId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() data,
    @UserContext() userContext: { userId: string }
  ) {
    const { userId } = userContext
    return this.clientService.create( userId, data );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.clientService.update( branchId, id, data );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { branchId: string }
  ) {
    const { branchId } = userContext
    return this.clientService.remove( branchId, id );
  }  
}
