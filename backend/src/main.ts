import { NestFactory } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'sitemap.xml', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
