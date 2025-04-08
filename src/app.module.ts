import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ProductsModule, UserModule, MongooseModule.forRoot(envs.databaseUrl), AuthModule, JwtModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
