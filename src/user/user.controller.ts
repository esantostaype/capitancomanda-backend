import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';
import { BranchId } from 'src/auth/decorators/user.decorator';
import { Response } from 'express'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll( @BranchId() branchId: string ) {
    return this.userService.findAll( branchId );
  }
  
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne( @BranchId() branchId: string, @Param('id') id: string ) {
    return this.userService.findOne( branchId, id );
  }

  @UseGuards(AuthGuard)
  @Post()
  async create( @BranchId() branchId: string, @Body() data ) {
    return this.userService.create( branchId, data );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update( @BranchId() branchId: string, @Param('id') id: string, @Body() data ) {
    return this.userService.update( branchId, id, data );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove( @BranchId() branchId: string, @Param('id') id: string) {
    return this.userService.remove( branchId, id );
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
