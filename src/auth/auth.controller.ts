import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Response } from 'express'
import { CompleteRegistrationDto, RegisterOwnerDto } from './dto/register.dto'
import { EnvConfig } from 'src/utils'

@Controller('auth')
export class AuthController {

  constructor( private readonly authService: AuthService ) {}

  @Post('login')
  login( @Body() data ){
    return this.authService.login( data )
  }

  @Post('register')
  async register( @Body() data: RegisterOwnerDto ) {
    return this.authService.registerOwner( data )
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string, @Param('email') email: string, @Res() res: Response) {
    try {
      const { user } = await this.authService.verifyEmail(token)
      return res.redirect(`${ EnvConfig.frontendUrl }/signup/complete?email=${ user.email }&token=${ token }`)
    } catch (error) {
      return res.redirect(`${ EnvConfig.frontendUrl }/signup?token=expired`)
    }
  }

  @Post('complete-registration')
  async completeRegistration(@Body() data: CompleteRegistrationDto, @Query('token') token: string ) {
    return this.authService.completeRegistration({ ...data, token })
  }

  @Post('oauth-register')
  async oauthRegister(@Body() data: { email: string, name: string }) {
    return this.authService.oAuthRegister(data);
  }

  @Post('complete-oauth-registration')
  async completeRegistrationGoogle(@Body() data: CompleteRegistrationDto ) {
    return this.authService.completeOAuthRegistration({ ...data })
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  resetPassword(@Query('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword( token, newPassword );
  }

}
