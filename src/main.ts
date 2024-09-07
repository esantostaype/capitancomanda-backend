import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport'
import { frontEndUrl } from './utils/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [`https://restify-frontend-production.up.railway.app/`, 'http://localhost:3000'],
    credentials: true,
  })
  app.setGlobalPrefix('api')
  app.use(
    session({
      secret: 'anselwho-gaaa',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000
      }
    })
  )
  app.use( passport.initialize())
  app.use( passport.session())
  await app.listen(3001);
}
bootstrap();
