import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { System } from './modules/system/entities/system.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  const systemRepository = app.get<Repository<System>>(
    getRepositoryToken(System),
  );

  // Lấy FRONTEND_URL từ configService
  const frontendUrl = configService.get('FRONTEND_URL');

  // Lấy danh sách các redirect_uri từ cơ sở dữ liệu
  const systems = await systemRepository.find();
  const allowedOrigins = systems.flatMap((system) => system.redirect_uris);

  // Thêm FRONTEND_URL vào danh sách các nguồn gốc được phép
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('UCMS API')
    .setDescription('Tất cả các API của hệ thống quản lý người dùng tập trung')
    .setVersion('1.0')
    .addTag('Auth', 'Xử lý đăng nhập admin')
    .addTag('Reset Password', 'Đặt lại mật khẩu')
    .addTag('Auth Redirect UCMS', 'Xử lý đăng nhập redirect tới UCMS')
    .addTag('MFA', 'Xử lý xác thực 2 bước')
    .addTag('System Management', 'Quản lý hệ thống')
    .addTag('User Management', 'Quản lý người dùng')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') ?? 3000;
  // useContainer to use custom validation decorators like @IsUnique
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port);
}
bootstrap();
