import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); // using helmet to secure the application
  await app.listen(5000);
}
bootstrap();
