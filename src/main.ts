import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
console.log('ok gone 3')
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ============= SET PREFIX => RESULT = (HOST + PREFIX + ROUTES) ========= //
  app.setGlobalPrefix('/api/v1');

  // ====================== DEFINED GLOBAL PIPES =========================== //
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        if (validationErrors[0].children.length)
          return new BadRequestException(
            Object.values(validationErrors[0].children[0].constraints)[0],
          );
        else
          return new BadRequestException(
            Object.values(validationErrors[0].constraints)[0],
          );
      },
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
