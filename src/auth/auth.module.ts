import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ AuthController ],
  providers: [
    { 
      provide: 'AUTH_SERVICE',
      useClass: AuthService
    },
    AuthService
  ],
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }
    }),
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: configService.get<string>('SENDGRID_API_KEY'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('SENDGRID_FROM_EMAIL')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    })
  ]
})
export class AuthModule {}
