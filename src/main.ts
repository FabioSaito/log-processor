import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, unlinkSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
declare const module: any;

async function bootstrap() {
  const dbFile = 'db.sqlite';
  if (existsSync(dbFile)) unlinkSync(dbFile);

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }));

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
