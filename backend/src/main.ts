import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  });
  await app.listen(3000);
}
bootstrap();
