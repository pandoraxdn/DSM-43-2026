import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const capibara = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
        "http://localhost:8081",
        "http://0.0.0.0:8081"
    ],
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
    credetials: true
  });
  await app.listen(3000);
}

capibara();
