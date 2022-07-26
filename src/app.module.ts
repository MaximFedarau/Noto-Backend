// Nest JS
import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';

//Constants
import * as db from 'constants/db';

//TypeORM
import { Auth } from 'auth/entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: db.DB_HOST,
      port: db.DB_PORT,
      username: db.DB_USERNAME,
      password: db.DB_PASSWORD,
      database: db.DB_NAME,
      entities: [Auth],
      synchronize: true, // ! Change this to false in prod
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
