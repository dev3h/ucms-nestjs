import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// import { typeOrmAsyncConfig } from '@/config/typeorm.config';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  exports: [TypeOrmModule, ConfigModule],
})
export class DatabaseConfigModule {}
