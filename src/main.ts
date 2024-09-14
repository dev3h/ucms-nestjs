import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const errors = validationErrors.reduce(
          (acc: { [key: string]: any; message?: string }, err) => {
            // Lấy lỗi đầu tiên cho mỗi thuộc tính và gán vào một mảng
            const firstConstraint = Object.values(err.constraints)[0];

            acc[err.property] = [firstConstraint];

            // Gán lỗi đầu tiên vào "message"
            if (!acc.message) {
              acc.message = firstConstraint;
            }
            return acc;
          },
          {},
        );

        return new HttpException(
          {
            errors: errors,
            message: errors.message,
            error: 'Unprocessable Entity',
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('UCMS API')
    .setDescription('User Central Management System description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') ?? 3000;
  // useContainer to use custom validation decorators like @IsUnique
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port);
}
bootstrap();
