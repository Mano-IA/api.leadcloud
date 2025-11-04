import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`LeadCloud API running on :${port}`);
}
bootstrap();
