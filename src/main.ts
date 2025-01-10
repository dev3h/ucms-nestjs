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
// import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { LoggerService } from './modules/logger/logger.service';
import { LoggingExceptionFilter } from './common/exceptions/logging.exception';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as session from 'express-session';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
// import * as csurf from 'csurf';
// import { NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const errors = validationErrors.reduce(
          (acc: { [key: string]: any; message?: string }, err) => {
            // Check if the property is an array and handle accordingly
            if (Array.isArray(err.children) && err.children.length > 0) {
              err.children.forEach((child, index) => {
                if (child.constraints) {
                  const firstConstraint = Object.values(child.constraints)[0];
                  acc[`${err.property}.${index}`] = [firstConstraint];

                  // Assign the first error message to "message"
                  if (!acc.message) {
                    acc.message = firstConstraint;
                  }
                }
              });
            } else {
              // Handle non-array properties
              const firstConstraint = Object.values(err.constraints)[0];
              acc[err.property] = [firstConstraint];

              // Assign the first error message to "message"
              if (!acc.message) {
                acc.message = firstConstraint;
              }
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
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  const systemRepository = app.get<Repository<System>>(
    getRepositoryToken(System),
  );

  // Lấy FRONTEND_URL từ configService
  const frontendUrl = configService.get('FRONTEND_URL');
  const backendUrl = configService.get('URL_SERVER');

  let allowedOrigins: string[] = [];

  try {
    // Lấy danh sách các redirect_uri từ cơ sở dữ liệu
    const systems = await systemRepository.find();
    allowedOrigins = Array.from(
      // Sử dụng Set để loại bỏ các redirect_uri trùng lặp
      new Set(systems.flatMap((system) => system.redirect_uris)),
    );
  } catch (error) {
    console.error('Failed to fetch systems from the database:', error);
    // You can set a default allowed origins or leave it empty
    allowedOrigins = [];
  }

  // Thêm FRONTEND_URL vào danh sách các nguồn gốc được phép
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }
  if (backendUrl) {
    allowedOrigins.push(backendUrl);
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
    exposedHeaders: ['X-Secret-Code'],
  });
  app.use(
    session({
      secret: configService.get('APP_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );
  // function csrfExclude(req, res: Response, next: NextFunction) {
  //   const csrfExcludedRoutes = ['/api/v1/auth/sso-ucms/get-token']; // Danh sách các route cần bỏ qua CSRF
  //   if (csrfExcludedRoutes.includes(req.path)) {
  //     return next();
  //   }
  //   return csurf({ cookie: true })(req, res, next);
  // }

  // app.use(csrfExclude);
  // app.use(function (req, res, next) {
  //   res.cookie('XSRF-TOKEN', req.csrfToken());
  //   res.locals._csrf = req.csrfToken();
  //   next();
  // });

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
    .addTag('SubSystem Management', 'Quản lý phân hệ')
    .addTag('Module Management', 'Quản lý mô đun')
    .addTag('Action Management', 'Quản lý thao tác')
    .addTag('Role Management', 'Quản lý vai trò (nhóm quyền)')
    .addTag('Permission Management', 'Quản lý quyền')
    .addTag('User Management', 'Quản lý người dùng')
    .addTag('Log Management', 'Quản lý log hệ thống')
    .addTag('Dashboard', 'Dashboard')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') ?? 3000;
  // useContainer to use custom validation decorators like @IsUnique
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const loggerService = app.get(LoggerService);
  // app.use(new LoggingMiddleware(loggerService).use);
  app.useGlobalFilters(new LoggingExceptionFilter(loggerService));
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));

  const appModule = app.get(AppModule); // Lấy instance của AppModule
  if (typeof appModule.configureApp === 'function') {
    appModule.configureApp(app); // Gọi configureApp để thiết lập Bull Board
  }
  await app.listen(port);
}
bootstrap();
