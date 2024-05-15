import { Module } from '@nestjs/common'
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ProductModule,
    CategoryModule,
    OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}