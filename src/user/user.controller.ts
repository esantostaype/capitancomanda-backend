import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
import { Response } from 'express'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }
  
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne( @Param('id') id: string ) {
    return this.userService.findOne( id );
  }

  @UseGuards(AuthGuard)
  @Post()
  async create( @Body() data ) {
    return this.userService.create( data );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update( @Param('id') id: string, @Body() data ) {
    return this.userService.update( id, data );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove( @Param('id') id: string) {
    return this.userService.remove( id );
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
