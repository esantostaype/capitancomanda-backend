import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { BranchModule } from './branch/branch.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PassportModule } from '@nestjs/passport';
import { ClientModule } from './client/client.module';
import { SocketGateway } from './socket.gateway'

@Module({
  imports: [
    RestaurantModule,
    BranchModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    CloudinaryModule,
    UserModule,
    ClientModule,
    AuthModule,
    PassportModule.register({
      session: true
    }),
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [ AppController ],
  providers: [ AppService, SocketGateway ],
})
export class AppModule {}