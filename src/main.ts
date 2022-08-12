// Nest JS Common
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';

//Helmet
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); // using helmet to secure the application
  await app.listen(5000);
}
bootstrap();
