import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v2 } from 'cloudinary';

import { AuthModule } from 'auth/auth.module';
import { NotesModule } from 'notes/notes.module';
import { Auth } from 'auth/entities/auth.entity';
import { Note } from 'notes/entities/note.entity';
import * as db from 'constants/db';
import * as cloudinary from 'constants/cloudinary';

@Module({
  imports: [
    AuthModule,
    NotesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: db.DB_HOST,
      port: db.DB_PORT,
      username: db.DB_USERNAME,
      password: db.DB_PASSWORD,
      database: db.DB_NAME,
      entities: [Auth, Note],
      synchronize: true, // ! Change this to false in prod
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'Cloudinary',
      useFactory: (): any => {
        return v2.config({
          cloud_name: cloudinary.CLOUDINARY_CLOUD_NAME,
          api_key: cloudinary.CLOUDINARY_API_KEY,
          api_secret: cloudinary.CLOUDINARY_API_SECRET,
        });
      },
    },
  ],
})
export class AppModule {}
