import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Res } from '@nestjs/common';
import { UserContext } from 'src/auth/decorators/user-context.decorator'
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
import { Response } from 'express'
import { Role } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.userService.findAll( userRole, branchId, ownedRestaurantId )
  }
  
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId, ownedRestaurantId } = userContext
    return this.userService.findOne( userRole, branchId, ownedRestaurantId, id );
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() data,
    @UserContext() userContext: { userRole: Role, branchId: string, ownedRestaurantId: string }
  ) {
    const { userRole, branchId } = userContext
    return this.userService.create( userRole, branchId, data );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data,
    @UserContext() userContext: { branchId: string, userRole: Role }
  ) {
    const { userRole } = userContext
    return this.userService.update( userRole, id, data );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserContext() userContext: { branchId: string, userRole: Role }
  ) {
    const { branchId, userRole } = userContext
    return this.userService.remove( userRole, branchId, id );
  }  

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string, @Param('email') email: string, @Res() res: Response) {
    try {
      const { user } = await this.userService.verifyEmail(token)
      return res.redirect(`http://localhost:3000/login?email=${ user.email }&token=${ token }`)
    } catch (error) {
      return res.redirect(`http://localhost:3000/signup?token=expired`)
    }
  }
}
