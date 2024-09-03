import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ RestaurantController ],
  providers: [ RestaurantService ],
  imports: [ PrismaModule ],
  exports: [ RestaurantService ]
})

export class RestaurantModule {}
