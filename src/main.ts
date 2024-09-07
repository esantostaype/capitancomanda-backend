import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as session from 'express-session'
import * as passport from 'passport'
import { ConfigService } from '@nestjs/config'
import { EnvConfig } from 'src/utils'

async function bootstrap() {

  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)  
  
  EnvConfig.init(configService)

  app.enableCors({
    origin: EnvConfig.frontendUrl,
    credentials: true
  })
  
  app.setGlobalPrefix('api')
  app.use(
    session({
      secret: EnvConfig.jwtSecret,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
        secure: true
      }
    })
  )
  app.use( passport.initialize())
  app.use( passport.session())
  await app.listen(3001);
}
bootstrap();
