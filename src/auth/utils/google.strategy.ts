import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy( Strategy ) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: ['profile', 'email']
    })
  }

  // async validate( accessToken: string, refreshToken: string, profile: Profile ) {
  //   console.log( "accessToken: ", accessToken )
  //   console.log( "refreshToken: ", refreshToken )
  //   console.log( "profile: ", profile )
  //   const { emails, displayName } = profile;
  //   const email = emails && emails[0].value;

  //   const user = await this.authService.registerRestaurantWithGoogle({
  //     email,
  //     id: profile.id,
  //     emails: emails.map((e) => ({ value: e.value })),
  //     displayName,
  //     branch: { name: 'Sucursal 1' }
  //   })
  //   console.log( "Usuario Validado: ", user )
  //   return user || null
  // }
}